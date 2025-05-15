import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { AddEventDTO } from './dto/event.dto';
import { UpdateEventDTO } from './dto/update-event.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';

@Controller('event')
@UseGuards(AuthGuard)
export class EventController {
    constructor(
        private eventService: EventService
    ) { }

    @Post('add')
    @UseGuards(new RoleGuard(["ADMIN", "ORGANIZER"]))
    async addEvent(
        @Req() req: { user: { id: number } },
        @Body() data: AddEventDTO

    ) {

        return await this.eventService.addEvent(data, req.user.id)
    }

    @Get(':id/details')
    @UseGuards(new RoleGuard(["ADMIN", "ORGANIZER"]))
    async getEvent(
        @Param("id") id: string
    ) {
        return await this.eventService.getEventById(parseInt(id))
    }

    @Put(':id/update')
    @UseGuards(new RoleGuard(["ADMIN", "ORGANIZER"]))
    async updateEvent(
        @Param("id") id: string,
        @Body() data: UpdateEventDTO
    ) {
        return await this.eventService.updateEvent(parseInt(id), data)
    }

    @Delete(':id/delete')
    @UseGuards(new RoleGuard(["ADMIN", "ORGANIZER"]))
    async deleteEvent(
        @Param("id") id: string
    ) {
        return await this.eventService.deleteEvent(parseInt(id))
    }

    @Get('lists')
    @UseGuards(new RoleGuard(["ADMIN", "ORGANIZER"]))
    async getAllEvent() {
        return this.eventService.getAllEvent()
    }

    @Post('register/:id')
    @UseGuards(AuthGuard, new RoleGuard(["STUDENT"]))
    async registerToEvent(
        @Req() req: { user: { id: number } },
        @Param('id') id: string
    ) {
        return await this.eventService.registerEvent(parseInt(id), req.user.id)
    }

    @Get('search')
    async searchEventByName(
        @Query('name') name: string
    ) {
        return this.eventService.searchEventsByName(name)
    }
}
