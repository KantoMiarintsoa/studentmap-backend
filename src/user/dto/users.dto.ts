import { IsEmail, IsString } from "class-validator";

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
}