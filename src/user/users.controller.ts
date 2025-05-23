import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserRegisterDTO } from './dto/users.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserUpdateDTO } from './dto/update-user.dto';
import { RoleGuard } from 'src/auth/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';

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

    @Put(':id/update')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor("profilePicture"))
    async updateUser(
        @Req() req: { user: { id: number } },
        @Body() data: UserUpdateDTO,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({ maxSize: 25 * 1024 * 1024 })
                .build({
                    fileIsRequired: false,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        )
        profilePicture?: Express.Multer.File
    ) {
        console.log(profilePicture);
        return await this.userservice.updateUser(req.user.id, data, profilePicture)
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

    @Post('reset-password/send-code')
    async resetPassowrdSentCode(
        @Body() body: { email: string }
    ) {
        return this.userservice.sendResetCode(body.email)
    }

    @Post('reset-password/confirm')
    async resetPasswordConfirm(
        @Body() body: { email: string; code: string; newPassword: string }
    ) {
        return this.userservice.verifyResetCode(body.email, body.code, body.newPassword)
    }

    @Get('search')
    async searchUser(
        @Query('firstName') firstName: string
    ) {
        console.log(firstName);
        return this.userservice.searchUsers(firstName)
    }

    @Get('sort/role')
    async getUsersByRoles(
        @Query('roles') role: string
    ) {
        return this.userservice.getUsersByRole(role as Role)
    }

    @Get('check-email')
    async handleEMail(
        @Query('email') email: string
    ) {
        return await this.userservice.handleEmail(email)
    }
}
