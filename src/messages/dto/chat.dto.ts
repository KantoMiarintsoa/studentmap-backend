import { MessageType } from "@prisma/client";
import { IsString } from "class-validator";

export class ChatMessage {
    content: string;
    receiverId: number;
    replyMessageId?: number;
    messageType?: MessageType
}

export class NickNameDTO {
    @IsString()
    nickName: string
}