import { Controller, Get } from '@nestjs/common';
import { EventService } from 'src/evenement/event.service';
import { PrismaService } from './prisma.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly prismaService: PrismaService) { }


    @Get()
    async getDashboardStats() {
        return await this.prismaService.getDashboardStats()
    }

    @Get('graph')
    async dawGraph() {
        return await this.prismaService.drawGraph()

    }


}

