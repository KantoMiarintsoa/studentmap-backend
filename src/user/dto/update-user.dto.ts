import { PartialType } from "@nestjs/swagger";
import { UserRegisterDTO } from "./users.dto";
import { Exclude } from "class-transformer";
import { IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class UserUpdateDTO extends PartialType(UserRegisterDTO) {
    @Exclude()
    email?: string;

    @ValidateIf(body => body.password !== undefined && body.password !== null)
    @IsString()
    @IsNotEmpty()
    oldPassword: string

}