import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class AuthService {

    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userservice: UsersService,
        private jwtservice: JwtService
    ) { }


    async login(email: string, pass: string): Promise<any> {
        const user = await this.userservice.findByEmail(email);

        if (!user) {
            throw new NotFoundException();
        }
        const passwordMatch = await this.userservice.passwordMatch(user.password, pass)

        if (!passwordMatch) {
            throw new UnauthorizedException();
        }


        const payload = { id: user.id, email: user.email, role: user.role }
        return {
            access_token: await this.jwtservice.signAsync(payload, {
                secret: process.env.SECRET
            }),
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        }
    }
}