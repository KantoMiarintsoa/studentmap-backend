import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DashboardController } from './dashboard.controller';
import { StripeService } from './stripe.service';

@Module({
  providers: [PrismaService, StripeService],
  exports:[PrismaService, StripeService],
  controllers: [DashboardController]
})
export class CommonModule {}
