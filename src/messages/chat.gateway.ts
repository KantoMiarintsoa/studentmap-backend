import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { AuthService } from "src/auth/auth.service";
import { MessagesService } from "./messages.service";
import { Server, Socket } from "socket.io";
import { ChatMessage } from "./dto/chat.dto";
import { User } from "@prisma/client";

@WebSocketGateway({ cors: { origin: '*' } })
export class Gateway {
    constructor(
        private authService: AuthService,
        private messageService: MessagesService
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
    }
}