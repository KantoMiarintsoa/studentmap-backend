import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [CommonModule, AuthModule, EmailModule]
})
export class EvenementModule { }
