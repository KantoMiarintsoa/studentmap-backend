import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() data: Record<string, any>
    ) {
        return this.authService.login(data.email, data.password)
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async callback(
        @Req() req: Request) {
        return this.authService.googleLogin(req)
    }

    @HttpCode(HttpStatus.OK)
    @Post('google/token')
    async getToken(
        @Body('token') token: string
    ) {
        return this.authService.validateGoogleToken(token)
    }

    @Post('refresh')
    async refreshTokens(
        @Body() body: { refreshToken: string }
    ) {
        const { refreshToken } = body
        return await this.authService.refreshTokens(refreshToken)

    }
}