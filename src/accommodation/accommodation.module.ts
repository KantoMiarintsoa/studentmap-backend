import { Module } from '@nestjs/common';
import { AccommodationController } from './accommodation.controller';
import { AccommodationService } from './accommodation.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccommodationController],
  providers: [AccommodationService],
  imports: [CommonModule, AuthModule]
})
export class AccommodationModule { }
