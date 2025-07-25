import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { AuthService } from "src/auth/auth.service";
import { MessagesService } from "./messages.service";
import { Server, Socket } from "socket.io";
import { ChatMessage } from "./dto/chat.dto";
import { User } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { count } from "console";

@WebSocketGateway({ cors: { origin: '*' } })
export class Gateway {
    constructor(
        private authService: AuthService,
        private messageService: MessagesService,
        private prisma: PrismaService,

    ) { }

    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        const token = client.handshake.headers["authorization"] ?? ""
        const validToken = token.startsWith("Bearer ") ? token.split(" ")[1] ?? "" : ""
        const user = await this.authService.verifyToken(validToken)

        if (!user) {
            client.disconnect();
            return
        }

        const unreadFromSenders = await this.messageService.getUnreadFromSenders(user.id);

        client.data.user = user
        client.join(`user_${user.id}`)
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() message: ChatMessage,
        @ConnectedSocket() client: Socket
    ) {
        // console.log(message.content)
        // console.log(client.data.user)

        const user = client.data.user as User
        const receiverId = message.receiverId

        const createdMessage = await this.messageService.createMessage(message, user.id)

        client.to(`user_${receiverId}`).emit("newMessage", createdMessage)
        client.emit("newMessage", { ...createdMessage, isSender: true })

        const unreadFromSenders =await this.messageService.getUnreadFromSenders(receiverId);

        client.to(`user_${receiverId}`).emit("unreadFromSenders", unreadFromSenders);
    }

    @SubscribeMessage("viewMessage")
    async getViewMessage(
        @MessageBody() data:{receiverId:number},
        @ConnectedSocket() client: Socket
    ){
        const user = client.data.user as User;
        const receiverId = data.receiverId;

        const lastMessage = await this.messageService.viewMessage(
            user.id,
            receiverId
        );
        const unreadFromSenders =await this.messageService.getUnreadFromSenders(user.id);

        client.to(`user_${receiverId}`).emit("messageSeen", lastMessage);
        client.emit("messageSeen", lastMessage);

        client.emit("unreadFromSenders", unreadFromSenders);
    }

    @SubscribeMessage("markAsRead")
    async markAsRead(messageId: number, userId: number) {
        const message = await this.prisma.messages.findUnique({
            where: { id: messageId }
        });
        if (message || message.receiverId !== userId) {
            return null
        }

        return await this.prisma.messages.update({
            where: { id: messageId },
            data: { isRead: true }
        })
    }
}