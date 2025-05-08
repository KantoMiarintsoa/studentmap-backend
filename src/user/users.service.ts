import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UserRegisterDTO } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { UserUpdateDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @Inject(forwardRef(() => PrismaService))
        private readonly prisma: PrismaService
    ) { }

    async createUser(data: UserRegisterDTO) {
        const userExist = await this.prisma.user.findUnique({
            where: { email: data.email }
        })

        if (userExist) {
            throw new BadRequestException({
                message: "email  already exist"
            })
        }

        const hashedPasssword = await this.hashPassword(data.password)
        return this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                contact: data.contact,
                password: hashedPasssword
            }

        })
    }

    async hashPassword(password: string) {
        return await bcrypt.hash(password, 8)
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return await this.prisma.user.findUnique({
            where: { email: email }
        })
    }

    async findById(id: number) {
        return await this.prisma.user.findUnique({
            where: { id }
        })
    }

    async passwordMatch(hashedPasssword: string | string | undefined, password: string) {
        return await bcrypt.compare(password, hashedPasssword)
    }

    async getStudent() {
        return await this.prisma.user.findMany({
            where: { role: Role.STUDENT },
            omit: {
                password: true
            }
        })
    }

    async updateUser(id: number, data: UserUpdateDTO) {
        const { password, oldPassword, ...body } = data
        const user = await this.prisma.user.findUnique({
            where: { id: id }
        })

        if (!user) {
            throw new BadRequestException({
                mesage: "user not found"
            })
        }

        if (password) {
            const passwordValid = await this.passwordMatch(user.password, oldPassword)

            if (passwordValid) {
                body["password"] = await this.hashPassword(password)
            }
            else {
                throw new BadRequestException({
                    message: "passowrd did not match"
                })
            }
        }

        return await this.prisma.user.update({
            where: { id: id },
            data: body,
            select: {
                firstName: true,
                lastName: true,
                email: true,
                contact: true,
                profilePicture: true,
                id: true
            }
        })
    }

    async getAllUser({
        roles
    }: { roles?: string[] } | undefined = undefined) {
        return await this.prisma.user.findMany({
            where: {
                ...(roles && {
                    role: {
                        in: roles as Role[]
                    }
                })
            }
        });
    }

    async deleteUser(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        })

        if (!user) {
            throw new NotFoundException({
                message: "user not found"
            })
        }
        return { message: "user deleted" }

    }

}


