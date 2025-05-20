import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { Gateway } from './chat.gateway';

@Module({
  providers: [MessagesService, Gateway],
  controllers: [MessagesController],
  imports: [CommonModule, AuthModule, UserModule]
})
export class MessagesModule { }
