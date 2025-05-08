import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DashboardController } from './dashboard.controller';

@Module({
  providers: [PrismaService],
  exports:[PrismaService],
  controllers: [DashboardController]
})
export class CommonModule {}
