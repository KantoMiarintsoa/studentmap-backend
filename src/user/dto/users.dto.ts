import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsString } from "class-validator";

export class UserRegisterDTO {
    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsEmail()
    email: string

    @IsString()
    contact: string

    @IsString()
    password: string

    @IsEnum(Role)
    role: Role

    @IsString()
    profilePicture: string
}