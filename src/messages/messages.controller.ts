import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { NickNameDTO } from './dto/chat.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
    constructor(private messagesService: MessagesService) { }

    @Get('last-users-messages')
    async getLastUsersMessages(
        @Req() req: { user: { id: number } },
        @Query("page") pages: string = "1"
    ) {
        return await this.messagesService.getLastUsersMessages(req.user.id, parseInt(pages))
    }

    @Get('get/:user_id')
    async getConversations(
        @Req() req: { user: { id: number } },
        @Param("user_id") userId: string,
        @Query("page") pages: string = "1"
    ) {
        return await this.messagesService.getConversations(req.user.id, parseInt(userId), parseInt(pages))
    }

    @Put("nickname/:id")

    async setNickName(
        @Req() req: { user: { id: number } },
        @Param("id") userId: string,
        @Body() data: NickNameDTO
    ) {
        return await this.messagesService.setNickName(req.user.id, parseInt(userId), data.nickName)
    }
}
