import { Module } from '@nestjs/common';
import { AccommodationController } from './accommodation.controller';
import { AccommodationService } from './accommodation.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [AccommodationController],
  providers: [AccommodationService],
  imports: [CommonModule, AuthModule, EmailModule]
})
export class AccommodationModule { }
