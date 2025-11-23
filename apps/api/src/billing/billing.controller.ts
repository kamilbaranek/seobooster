import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import type Stripe from 'stripe';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUserPayload } from '../auth/types/auth-response';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) { }

  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  createCheckoutSession(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() payload: CreateCheckoutSessionDto
  ) {
    return this.billingService.createCheckoutSession(user.userId, payload);
  }

  @Post('webhook')
  handleWebhook(@Body() payload: Stripe.Event) {
    return this.billingService.handleWebhook(payload);
  }

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }
}
