import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UserRegisterDTO } from './dto/users.dto';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { UserUpdateDTO } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { StorageService } from 'src/storage/storage.service';
import { StripeService } from 'src/common/stripe.service';
import { BuyCreditDto } from './dto/buy-credit.dto';

@Injectable()
export class UsersService {
    private resetCodes = new Map<string, string>()
    constructor(
        @Inject(forwardRef(() => PrismaService))
        private readonly prisma: PrismaService,
        private emailService: EmailService,
        private storageService: StorageService,
        private readonly stripeService: StripeService
    ) { }

    async findOrCreate(googleUser: any): Promise<User> {
        const user = await this.findByEmail(googleUser.email)

        if (user) {
            return user
        }
        return await this.createUser(googleUser)

    }

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
        const user = await this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                contact: data.contact,
                password: hashedPasssword,
                profilePicture: data.profilePicture,
                role: data.role
            }
        });

        // this.emailService.sendEmailAfterRegister({
        //     email: user.email
        // })
        return user
    }

    async handleEmail(email: string): Promise<{ exists: boolean }> {

        const user = await this.prisma.user.findUnique({
            where: { email }
        })
        console.log(user);
        return { exists: user !== null }
    }

    async sendResetCode(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        this.resetCodes.set(email, code);

        await this.emailService.sendForgotPassword({ email, code });

        return { message: 'Reset code sent to email' };
    }


    async verifyResetCode(email: string, code: string, newPassword: string) {
        const savedCode = this.resetCodes.get(email);
        if (!savedCode || savedCode !== code) {
            throw new Error('Invalid or expired code');
        }

        const hashedPassword = await this.hashPassword(newPassword);

        await this.prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        this.resetCodes.delete(email);

        return { message: 'Password updated successfully' };
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

    async updateUser(id: number, data: UserUpdateDTO, profilePicture?: Express.Multer.File) {
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

        if (profilePicture) {
            const fileName = await this.storageService.uploadFile(profilePicture);
            body['profilePicture'] = fileName
        }

        const updateUser = await this.prisma.user.update({
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

        // if (updateUser.profilePicture) {
        //     updateUser.profilePicture = `${process.env.BASE_URL}/storage/preview/${updateUser.profilePicture}`
        // }

        return updateUser
    }

    async getNickName(
        userId: number,
        otherUserId: number
    ) {
        const nickName = await this.prisma.nickname.findFirst({
            where: {
                OR: [
                    {
                        user1Id: userId,
                        user2Id: otherUserId
                    },
                    {
                        user2Id: userId,
                        user1Id: otherUserId
                    }
                ]
            }
        })

        if (!nickName) {
            return {
                myNickNmae: undefined,
                otherUserNickName: undefined
            };
        }
        return {
            myNickName: userId === nickName.user1Id ? nickName.nickName1 : nickName.nickName2,
            otherUserNickName: otherUserId === nickName.user1Id ? nickName.nickName1 : nickName.nickName2
        }
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

    async searchUsers(firstName?: string) {
        if (!firstName || firstName.trim() === '') {
            return this.prisma.user.findMany({
                orderBy: {
                    firstName: 'asc',
                },
            });
        }

        const users = await this.prisma.user.findMany({
            where: {
                firstName: {
                    contains: firstName,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                lastName: 'asc',
            },
        });

        return users;
    }

    async getUsersByRole(role: Role) {
        return this.prisma.user.findMany({
            where: { role },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contact: true,
                role: true,

            }
        })
    }

    async createSetupIntent(userId:number){
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            throw new NotFoundException('User not found');
        }

        let customerId = user.stripeCustomerId;

        if (!customerId) {
            customerId = await this.stripeService.createCustomer(user.email, `${user.firstName} ${user.lastName}`);
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }

        const data = await this.stripeService.createSetupIntent(customerId);
        return {
            clientSecret:data.client_secret
        }
    }

    async listPaymentMethods(userId: number) {
        const user = await this.prisma.user.findUnique({
            where:{id:userId}
        });

        if(!user) {
            throw new NotFoundException('User or Stripe customer not found');
        }

        if(!user.stripeCustomerId){
            return [];
        }

        const paymentMethods = await this.stripeService.listPaymentMethods(user.stripeCustomerId);

        return paymentMethods.data.map(pm=>({
            id:pm.id,
            card:pm.card
        }));
    }

    async removePaymentMethod(paymentMethodId:string){
        await this.stripeService.removePaymentMethod(paymentMethodId);
        return { message: "Payment method removed successfully" };
    }

    async buyCredit(data:BuyCreditDto, userId:number){
        const user = await this.prisma.user.findUnique({
            where:{id:userId}
        });

        if(!user || !user.stripeCustomerId){
            throw new NotFoundException({
                message:"user not found"
            });
        }

        await this.stripeService.createPaymentIntent(
            data.credits * 10,
            'usd',
            user.stripeCustomerId,
            data.paymentMethod
        );

        const newCredit = (await this.prisma.user.update({
            where: {id:userId},
            data:{
                serviceRemainders:{
                    increment:data.credits
                }
            }
        })).serviceRemainders;

        return {credits: newCredit};
    }
}
