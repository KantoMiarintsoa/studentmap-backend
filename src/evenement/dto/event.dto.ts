import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsDecimal, IsInt, IsOptional, IsString } from "class-validator";

// function toDate(value: any): Date | undefined {
//     return value ? new Date(value) : undefined;
// }


export class AddEventDTO {
    @IsString()
    name: string

    @IsString()
    description: string

    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate: Date

    // @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsDate()
    endDate: Date

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    createdAt: Date

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    updateAt: Date

    @IsOptional()
    @IsString()
    location: string

    @IsOptional()
    @IsInt()
    capacity: number

    @IsOptional()
    @IsBoolean()
    registrationAvailable: boolean

    @IsOptional()
    @IsString()
    registrationLink: string

    @IsOptional()
    @IsString()
    photo: string

    @IsOptional()
    @IsInt()
    universityId?: number
}
