import { PartialType } from "@nestjs/swagger";
import { AddAccomodationDTO } from "./accommodation.dto";
import { Exclude } from "class-transformer";

export class UpdateAccommodationDTO extends PartialType(AddAccomodationDTO) {
    @Exclude()
    address?: string
}