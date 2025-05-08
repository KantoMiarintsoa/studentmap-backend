import { Type, User } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class AddAccomodationDTO {
    @IsString()
    name: string

    @IsString()
    address: string

    @IsNumber()
    @Transform(({ value }) => {
        if (typeof value === "string") {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num
        }
        return value;
    })
    area: number

    @IsString()
    @IsOptional()
    unit: string = "m2"

    @IsString()
    receptionCapacity: string

    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    IsAvailable: boolean = false

    @IsNumber()
    rentMin: number

    @IsNumber()
    rentMax: number

    @Transform((({ value }) => value.toUpperCase()))
    @IsEnum(Type)
    type: Type

    @IsInt()
    @IsOptional()
    ownerId?: number




}