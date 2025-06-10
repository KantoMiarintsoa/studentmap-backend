import { Type, User } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class AddAccomodationDTO {
    @IsString()
    name: string

    @IsString()
    address: string

    @Transform(({ value }) => {
        if (typeof value === "string") {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num
        }
        return value;
    })
    @IsNumber()
    area: number

    @IsString()
    @IsOptional()
    unit: string = "m2"

    @IsString()
    receptionCapacity: string

    @IsOptional()
    @IsString()
    description: string

    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    IsAvailable: boolean = false

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    rentMin: number

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    rentMax: number

    @Transform((({ value }) => value.toUpperCase()))
    @IsEnum(Type)
    type: Type

    @Transform(({ value }) => value ? parseInt(value) : undefined)
    @IsInt()
    @IsOptional()
    ownerId?: number

    @IsString()
    city: string

    // @IsString()
    // neighborhood: string

    // @IsInt()
    // localisation: [number, number]


    // @IsOptional()
    // @IsObject()
    // media?: object
}