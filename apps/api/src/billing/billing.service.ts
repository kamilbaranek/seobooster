import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Prisma, SubscriptionStatus, WebStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JobQueueService } from '../queues/queues.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

type StripeSubscriptionPayload = Stripe.Subscription & { current_period_end?: number };

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
    const priceId = this.configService.get<string>('STRIPE_PRICE_ID');
    if (!priceId) {
      throw new BadRequestException('Stripe price is not configured');
    }
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const web = await this.prisma.web.findUnique({ where: { id: payload.webId } });
    if (!web || web.userId !== userId) {
      throw new NotFoundException('Website not found');
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
          webId: payload.webId
        }
      },
      metadata: {
        userId,
        webId: payload.webId
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
    const webId = metadata.webId;
    if (!userId || !webId) {
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

      const subscriptionRecord = await tx.subscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        update: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : null
        },
        create: {
          userId,
          stripeSubscriptionId: subscriptionId,
          status: SubscriptionStatus.ACTIVE
        }
      });

      await tx.web.update({
        where: { id: webId },
        data: {
          subscriptionId: subscriptionRecord.id,
          status: WebStatus.ACTIVE
        }
      });
    });

    await this.jobQueueService.enqueueScanWebsite(webId);
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

    const subscriptionRecord = await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: {
        status,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null
      },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        status,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null
      }
    });

    const webIdFromMetadata = metadata.webId;
    if (webIdFromMetadata) {
      await this.prisma.web.updateMany({
        where: { id: webIdFromMetadata, userId },
        data: {
          subscriptionId: subscriptionRecord.id,
          status: status === SubscriptionStatus.ACTIVE ? WebStatus.ACTIVE : WebStatus.PAUSED
        }
      });
    }

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
}
