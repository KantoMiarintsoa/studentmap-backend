import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class Oauth2Service {
    constructor(private prisma: PrismaService) { }

    async saveToken(userId: number, accessToken: string, expiresAt: Date) {
        return this.prisma.oAuthToken.upsert({
            where: { accessToken },
            update: { expiresAt },
            create: {
                userId,
                accessToken,
                expiresAt,
            },
        });
    }

    async findToken(accessToken: string) {
        return this.prisma.oAuthToken.findUnique({
            where: { accessToken },
        });
    }

    async validateToken(accessToken: string): Promise<boolean> {
        const token = await this.findToken(accessToken);
        if (!token) return false;
        if (token.expiresAt < new Date()) return false;
        return true;
    }
}
