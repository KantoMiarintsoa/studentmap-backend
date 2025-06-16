import { PartialType } from "@nestjs/swagger";
import { AddAccomodationDTO } from "./accommodation.dto";
import { Exclude } from "class-transformer";
import { IsInt } from "class-validator";

export class UpdateAccommodationDTO extends PartialType(AddAccomodationDTO) {
    @Exclude()
    address?: string
}

export class ReviewAccommodationDTO{
    @IsInt()
    rating:number;
}