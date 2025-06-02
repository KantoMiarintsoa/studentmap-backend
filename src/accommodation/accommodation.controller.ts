import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AccommodationService } from './accommodation.service';
import { AddAccomodationDTO } from './dto/accommodation.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateAccommodationDTO } from './dto/update.dto';
import { RoleGuard } from 'src/auth/role.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('accommodation')
export class AccommodationController {
    constructor(
        private accommodationservice: AccommodationService
    ) { }

    @Post('add')
    @UseGuards(AuthGuard, new RoleGuard(["ADMIN", "OWNER"]))
    @UseInterceptors(FilesInterceptor("media"))
    async addAccommodation(
        @Req() req: { user: { id: number } },
        @Body() data: AddAccomodationDTO,
        @UploadedFiles() files?: Array<Express.Multer.File>

    ) {
        console.log(files);
        return await this.accommodationservice.addAccomodation(data, req.user.id, files);
    }

    @Get(':id/details')
    @UseGuards(AuthGuard)
    async getAccommodation(
        @Param("id") id: string,
    ) {
        return await this.accommodationservice.detailsAccommodation(parseInt(id))
    }

    @Put(':id/update')
    @UseGuards(AuthGuard)
    async updateAccommodation(
        @Param("id") id: string,
        @Req() req: { user: { id: number } },
        @Body() data: UpdateAccommodationDTO
    ) {
        return await this.accommodationservice.updateAccommodation(parseInt(id), data, req.user.id)
    }

    @Get('lists')
    @UseGuards(AuthGuard, new RoleGuard(["ADMIN", "STUDENT"]))
    async getAllAccommodations() {
        return await this.accommodationservice.GetAllAccommodations()
    }

    @Delete(':id/delete')
    @UseGuards(AuthGuard, new RoleGuard(["ADMIN"]))
    async deleteAccommodation(
        @Param('id') id: string,

    ) {
        return await this.accommodationservice.deleteAccommodation(parseInt(id))
    }

    @Get("search")
    @UseGuards(AuthGuard, new RoleGuard(['ADMIN', 'STUDENT']))
    async searchAdvancedAccommodation(
        @Query('name') name?: string,
        @Query('address') address?: string,
        @Query("type") type?: string,
        @Query('budget') budget?: string

    ) {
        const numericBudget = budget ? parseFloat(budget) : undefined
        return this.accommodationservice.advancedSearch({ name, address, type, budget: numericBudget })
    }



    @Get("advanced-search")
    @UseGuards(AuthGuard, new RoleGuard(['ADMIN']))
    async searchAdvancedAccommodationStudent(
        @Query('nameUniversity') nameUniversity?: string,
        @Query('city') city?: string,
        @Query('address') address?: string,
        @Query("type") type?: string,
        @Query('budget') budget?: string

    ) {
        return this.accommodationservice.findAccommodationsNearUniversity(
            nameUniversity,
            city,
            address,
            budget && parseFloat(budget),
            type as any
        )
    }


    @Get('owner')
    @UseGuards(AuthGuard, new RoleGuard(['OWNER']))
    async getAccommodationsOwner(
        @Req() req: { user: { id: number } }
    ) {
        const userId = req.user.id
        return this.accommodationservice.GetAccommodationsByOwner(userId)
    }
}