import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UniversityService } from './university.service';
import { AddUniversityDTO } from './dto/university.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUniversityDTO } from './dto/update-university.dto';
import { RoleGuard } from 'src/auth/role.guard';
// import { AuthGuard } from 'src/auth/auth.guard';
// import { RoleGuard } from 'src/auth/role.guard';

@Controller('university')
@UseGuards(AuthGuard)
export class UniversityController {
    constructor(
        private universityService: UniversityService
    ) { }

    @Post('add')
    @UseGuards(AuthGuard)
    async addUniveersity(
        @Req() req: { user: { id: number } },
        @Body() data: AddUniversityDTO
    ) {

        // if(!req.user ||req.user.id){
        //     throw new BadRequestException({
        //         message:"user id is missing, make sure you  are authentificated"
        //     })
        // }

        return await this.universityService.addUniversity(data, req.user.id)
    }

    @Get(':id/details')
    async getUniversity(
        @Param("id") id: string
    ) {
        return await this.universityService.getUniversity(parseInt(id))
    }


    @Put(':id/update')
    @UseGuards(AuthGuard)
    async updateUniversity(
        @Param("id") id: string,
        @Body() data: UpdateUniversityDTO
    ) {
        return await this.universityService.updateUniversity(parseInt(id), data)
    }

    @Delete(':id/delete')
    @UseGuards(AuthGuard)
    async deleteUniversity(
        @Param("id") id: string
    ) {
        return await this.universityService.deleteUniversity(parseInt(id))
    }

    @Get('lists')
    @UseGuards(AuthGuard, new RoleGuard(["ADMIN", "STUDENT"]))
    async getAllUnversity() {
        return await this.universityService.getAllUniversity()
    }


    @Get("filter")
    @UseGuards(AuthGuard)
    async getUniversitiesByType(
        @Query('type') type?: string,
        @Query("name") name?: string,
        @Query('address') address?: string
    ) {
        return await this.universityService.filterUniversity(type, name, address);
    }

    @Get("compare/mentions")
    async compareByMentions(
        @Query('mentions') mentions: string | string[]
    ) {
        const mentionArray = Array.isArray(mentions) ? mentions : [mentions]

        return this.universityService.compareUniversities(mentionArray)
    }


}

