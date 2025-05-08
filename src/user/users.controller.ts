import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserRegisterDTO } from './dto/users.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserUpdateDTO } from './dto/update-user.dto';
import { RoleGuard } from 'src/auth/role.guard';

@Controller('users')
export class UsersController {
    constructor(
        private userservice: UsersService
    ) { }

    @Post('register')
    async register(
        @Body() data: UserRegisterDTO
    ) {
        return await this.userservice.createUser(data)
    }

    @Get(':id/details')
    @UseGuards(AuthGuard)
    async getStudents(
        // @Req() req: { user: { email: string } },
        @Param("id") id: string
    ) {
        return await this.userservice.findById(parseInt(id))
    }

    @Put()
    @UseGuards(AuthGuard)
    async updateUser(
        @Req() req: { user: { id: number } },
        @Body() data: UserUpdateDTO
    ) {
        return await this.userservice.updateUser(req.user.id, data)
    }

    @Get('lists')
    @UseGuards(AuthGuard, new RoleGuard(["ADMIN"]))
    async getAllUser(
        @Query("role") roles?: string | string[] | undefined
    ) {
        return this.userservice.getAllUser({
            roles: roles ? (Array.isArray(roles) ? roles : [roles]) : undefined
        });
    }

    @Delete(":id/delete")
    @UseGuards(AuthGuard, new RoleGuard(["ADMIN"]))
    async deleteUser(
        @Param('id') id: string,
    ) {
        return this.userservice.deleteUser(parseInt(id))
    }
}
