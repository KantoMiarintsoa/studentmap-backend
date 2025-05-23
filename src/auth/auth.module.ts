import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { CommonModule } from 'src/common/common.module';


@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: "24h"
      },
      // secretOrPrivateKey: process.env.JWT_SECRET
    }),
    CommonModule

  ],

  providers: [AuthService, AuthGuard, JwtService, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthGuard, JwtService, AuthService],

})

export class AuthModule { }