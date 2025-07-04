import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UsersService } from 'src/user/users.service';
import { ChatMessage } from './dto/chat.dto';
import { paginate } from 'src/common/paginator';

@Injectable()
export class MessagesService {
    constructor(
        private prisma: PrismaService,
        private userService: UsersService
    ) { }

    async createMessage(data: ChatMessage, senderId: number) {
        const test = await this.prisma.user.findFirstOrThrow({
            where: { id: data.receiverId }
        })


        const message = await this.prisma.messages.create({
            data: {
                ...data,
                senderId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profilePicture:true,
                        firstName:true,
                        lastName:true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profilePicture:true,
                        firstName:true,
                        lastName:true
                    }
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true
                    }
                }
            }
        })
        return message
    }

    async getLastUsersMessages(
        userId: number,
        page: number = 1
    ) {
        const lastUsers = await this.prisma.messages.findMany({
            where: {
                OR: [
                    {
                        senderId: userId
                    },
                    {
                        receiverId: userId
                    }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            distinct: ["senderId", "receiverId"],
            select: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profilePicture: true,
                        firstName:true,
                        lastName:true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profilePicture: true,
                        firstName:true,
                        lastName:true
                    }
                },
                content: true,
                createdAt: true,
                messageType: true,
                isRead: true,
            },
            take: 10
        })
        const lastConversationMap = new Map<number, any>();
        for (const message of lastUsers) {
            const key = message.sender.id === userId ? message.receiver.id : message.sender.id

            const existing = lastConversationMap.get(key)
            if (!existing) {
                // if (message.receiver.profilePicture) {
                //     message.receiver.profilePicture = `${process.env.BASE_URL}/storage/preview/${message.receiver.profilePicture}`
                // }
                const nickName = await this.getNickName(userId, message.sender.id === userId ? message.receiver.id : message.sender.id)
                message.sender["nickName"] = message.sender.id === userId ? nickName.myNickName : nickName.otherUserNickName

                message.receiver["nickName"] = message.receiver.id === userId ? nickName.myNickName : nickName.otherUserNickName

                lastConversationMap.set(key, message)
            }
        }
        // return paginate({ data: Array.from(lastConversationMap.values()), page }) 
        return Array.from(lastConversationMap.values())
    }

    async getNickName(
        userId: number,
        otherUserId: number
    ) {
        return this.userService.getNickName(userId, otherUserId);
    }
    async setNickName(userId: number, otherUserId: number, nickName: string) {
        const existingNickName = await this.prisma.nickname.findFirst({
            where: {
                OR: [
                    {
                        user1Id: userId,
                        user2Id: otherUserId
                    }, {
                        user2Id: userId,
                        user1Id: otherUserId
                    }
                ]
            }
        });
        const body = {}

        if (existingNickName) {
            if (userId === existingNickName.user1Id) {
                body["nickName2"] = nickName === "" ? undefined : nickName
            }
            else {
                body["nickName1"] = nickName === "" ? undefined : nickName
            }
            const updated = (await this.prisma.nickname.update({
                where: { id: existingNickName.id },
                data: body
            }))
            return { nickName: nickName === "" ? undefined : nickName }
        };
        await this.prisma.nickname.create({
            data: {
                user1Id: userId,
                user2Id: otherUserId,
                nickName1: undefined,
                nickName2: nickName === "" ? undefined : nickName,

            }
        })
        return { nickName: nickName === "" ? undefined : nickName }
    }

    async getConversations(
        userId: number,
        otherUserId: number,
        page: number = 1
    ) {
        console.log(userId)
        console.log(otherUserId)
        const conversation = await this.prisma.messages.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                        receiverId: otherUserId
                    },
                    {
                        senderId: otherUserId,
                        receiverId: userId
                    }

                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profilePicture: true,
                        firstName:true,
                        lastName:true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profilePicture: true,
                        firstName:true,
                        lastName:true
                    }
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true
                    }
                }
            }
        })
        // return paginate({
        //     data: conversation.map(message => ({
        //         ...message, isSender: message.senderId === userId
        //     })), page
        // });
        return conversation.map(message => ({
            ...message, isSender: message.senderId === userId
        }))
    }

    async getUnreadFromSenders(
        userId:number
    ){
        const unreadFromSenders = await this.prisma.messages.groupBy({
            by: ['senderId'],
            where: {
                receiverId: userId,
                isRead: false,
            },
            _count: {
                _all: true,
            },
        });

        return {
            count:unreadFromSenders.length
        };
    }

    async viewMessage(
        userId:number,
        senderId:number
    ){
        // basically, we view every message
        // we send the state of the last message
        const messages = await this.prisma.messages.updateMany({
            where:{
                receiverId:userId,
                senderId:senderId
            },
            data:{
                isRead:true
            }
        });

        // no message to update
        if(messages.count===0)
            return undefined

        return await this.prisma.messages.findFirst({
            where:{
                receiverId:userId,
                senderId:senderId
            },
            orderBy:{
                id:"desc"
            }
        })
    }
}