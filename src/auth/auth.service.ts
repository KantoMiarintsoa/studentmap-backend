import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/users.service';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class AuthService {
    private oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userservice: UsersService,
        private jwtservice: JwtService,
        private prisma: PrismaService
    ) { }


    async login(email: string, pass: string): Promise<any> {
        const user = await this.userservice.findByEmail(email);

        if (!user) {
            throw new NotFoundException();
        }
        if (user.provider === 'google') {
            throw new UnauthorizedException("This user was registered with Google. Please sign in using Google")
        }
        const passwordMatch = await this.userservice.passwordMatch(user.password, pass)

        if (!passwordMatch) {
            throw new UnauthorizedException();
        }


        const payload = { id: user.id, email: user.email, role: user.role }
        const refreshToken = await this.jwtservice.signAsync(payload, {
            secret: process.env.SECRET,
            expiresIn: '7d'
        })
        return {
            access_token: await this.jwtservice.signAsync(payload, {
                secret: process.env.SECRET
            }),
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                contact: user.contact
            },
            refreshToken: refreshToken
        }
    }


    async validateGoogleToken(token: string) {
        const ticket = await this.oauthClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new UnauthorizedException('Invalid token ')
        }
        const user = await this.prisma.user.upsert({
            where: { email: payload.email },
            update: {},
            create: {
                email: payload.email,
                firstName: payload.given_name!,
                lastName: payload.family_name!,
                profilePicture: payload.picture!,
                provider: 'google',
                password: '',
                contact: ''
            }
        });

        const payloadJWT = { id: user.id, email: user.email, role: user.role };

        const accessTokenApp = await this.jwtservice.signAsync(payloadJWT, {
            secret: process.env.SECRET
        });
        const refreshToken = await this.jwtservice.signAsync(payload, {
            secret: process.env.SECRET,
            expiresIn: '7d'
        })

        return {
            user,
            access_token: accessTokenApp,
            refreshToken: refreshToken
        }
    }

    async verifyToken(token: string) {
        try {
            const payload = await this.jwtservice.verifyAsync(token, {
                secret: process.env.SECRET
            })

            const user = await this.userservice.findById(payload.id);

            return user;
        }
        catch {
            return null;
        }
    }

    async googleLogin(req) {
        if (!req.user) {
            return "No user from goole"
        }
        const user = await this.userservice.findOrCreate(req.user)

        return {
            message: "User from google",
            user
        }
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.jwtservice.verifyAsync(refreshToken, {
                secret: process.env.SECRET
            })
            const user = await this.userservice.findById(payload.id)
            if (!user) {
                throw new UnauthorizedException()
            }
            const newPayload = {
                id: user.id,
                email: user.email,
                role: user.role
            }
            const newAccessToken = await this.jwtservice.signAsync(newPayload, {
                secret: process.env.SECRET
            })

            const newRefreshToken = await this.jwtservice.signAsync(newPayload, {
                secret: process.env.SECRET,
                expiresIn: '7d',

            });
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        }
        catch (error) {
            throw new UnauthorizedException('invalid refresh token')
        }
    }
}

