import { TypeUniversity } from "@prisma/client";
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export class AddUniversityDTO {

    @IsString()
    name: string

    @IsEnum(TypeUniversity)
    type: TypeUniversity

    @IsString()
    description: string

    // @IsString()
    // localisation: string

    @IsString()
    webSite: string

    @IsArray()
    @IsString({ each: true })
    mention: string[]

    @IsString()
    address: string

    // @IsInt()
    // @IsOptional()
    // ownerId: number

    @IsString()
    city: string

    @IsInt()
    localisation: [number, number]

}