import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';


@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      signOptions: {
        expiresIn: "24h"
      },
      secretOrPrivateKey: process.env.SECRET
    }),

  ],

  providers: [AuthService, AuthGuard, JwtService],
  controllers: [AuthController],
  exports: [AuthGuard, JwtService, AuthService]
})
export class AuthModule { } 
