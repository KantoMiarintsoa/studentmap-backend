import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/common/prisma.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { EmailModule } from 'src/email/email.module';
import { StorageModule } from 'src/storage/storage.module';
import { CommonModule } from 'src/common/common.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
  imports: [
    forwardRef(() => AuthModule),
    EmailModule, StorageModule, CommonModule, JwtModule
  ],


})
export class UserModule { }