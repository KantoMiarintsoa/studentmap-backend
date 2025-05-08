import { PartialType } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { AddAccomodationDTO } from "src/accommodation/dto/accommodation.dto";
import { AddUniversityDTO } from "./university.dto";

export class UpdateUniversityDTO extends PartialType(AddUniversityDTO) {
    @Exclude()
    address?: string;

}