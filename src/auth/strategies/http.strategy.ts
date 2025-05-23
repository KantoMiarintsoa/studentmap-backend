import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/common/prisma.service';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy, 'http-bearer') {
    constructor(private prisma: PrismaService) {
        super();
    }

    async validate(token: string) {
        const tokenRecord = await this.prisma.oAuthToken.findUnique({
            where: { accessToken: token },
            include: { user: true },
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        return tokenRecord.user;
    }
}
