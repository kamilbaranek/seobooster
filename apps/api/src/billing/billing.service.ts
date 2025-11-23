import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Prisma, SubscriptionStatus, WebStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JobQueueService } from '../queues/queues.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { PLANS, getPlanById, getPlanByPriceId } from '../config/subscription-plans.config';

type StripeSubscriptionPayload = Stripe.Subscription & {
  current_period_end?: number;
  current_period_start?: number;
};

@Injectable()
export class BillingService {
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jobQueueService: JobQueueService
  ) {
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      // eslint-disable-next-line no-console
      console.warn('STRIPE_SECRET_KEY is not set. Billing endpoints will not work properly.');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(stripeSecret);
    }
  }

  async createCheckoutSession(userId: string, payload: CreateCheckoutSessionDto) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const plan = getPlanById(payload.planId);
    if (!plan) {
      throw new BadRequestException('Invalid plan ID');
    }
    const priceId = plan.priceId;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        metadata: {
          userId,
          planId: payload.planId
        }
      },
      metadata: {
        userId,
        planId: payload.planId
      }
    });

    return { checkoutUrl: session.url };
  }

  async handleWebhook(event: Stripe.Event): Promise<{ received: true }> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdated(event.data.object as StripeSubscriptionPayload);
        break;
      default:
        break;
    }
    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata ?? {};
    const userId = metadata.userId;
    const planId = metadata.planId;

    if (!userId) {
      return;
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (stripeCustomerId) {
        await tx.user.update({
          where: { id: userId },
          data: { stripeCustomerId }
        });
      }

      if (!subscriptionId) {
        return;
      }

      await tx.subscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        update: {
          status: SubscriptionStatus.ACTIVE,
          planId: planId,
          currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : null,
          currentPeriodStart: new Date() // Approximate
        },
        create: {
          userId,
          stripeSubscriptionId: subscriptionId,
          status: SubscriptionStatus.ACTIVE,
          planId: planId,
          currentPeriodStart: new Date()
        }
      });
    });
  }

  private async handleSubscriptionUpdated(subscription: StripeSubscriptionPayload) {
    const metadata = subscription.metadata ?? {};
    const stripeCustomerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;
    let userId = metadata.userId;

    if (!userId && stripeCustomerId) {
      const user = await this.prisma.user.findFirst({
        where: { stripeCustomerId }
      });
      if (user?.id) {
        userId = user.id;
      }
    }

    if (!userId) {
      return;
    }

    const status = this.mapSubscriptionStatus(subscription.status);

    // Attempt to determine planId from items if not in metadata
    let planId = metadata.planId;
    if (!planId && subscription.items?.data?.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const plan = getPlanByPriceId(priceId);
      if (plan) {
        planId = plan.id;
      }
    }

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: {
        status,
        planId,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        currentPeriodStart: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : null
      },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        status,
        planId,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
        currentPeriodStart: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : null
      }
    });
  }

  private mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      default:
        return SubscriptionStatus.INCOMPLETE;
    }
  }

  async checkLimit(userId: string, resource: 'webs' | 'articles'): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: SubscriptionStatus.ACTIVE },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user || user.subscriptions.length === 0) {
      // No active subscription -> allow 0 or default free limits?
      // For now, return false to enforce subscription
      return false;
    }

    const subscription = user.subscriptions[0];
    const planId = subscription.planId;
    if (!planId) return false;

    const plan = getPlanById(planId);
    if (!plan) return false;

    if (resource === 'webs') {
      const webCount = await this.prisma.web.count({
        where: { userId, status: { not: WebStatus.ERROR } } // Count all non-error webs?
      });
      return webCount < plan.limits.webs;
    }

    if (resource === 'articles') {
      if (!subscription.currentPeriodStart) return false;
      const articleCount = await this.prisma.article.count({
        where: {
          web: { userId },
          createdAt: { gte: subscription.currentPeriodStart }
        }
      });
      return articleCount < plan.limits.articlesPerMonth;
    }

    return false;
  }

  async getPlans() {
    return Object.values(PLANS).map(p => ({
      id: p.id,
      name: p.name,
      limits: p.limits
    }));
  }
}
