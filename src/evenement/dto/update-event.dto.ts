import { PartialType } from "@nestjs/swagger";
import { AddEventDTO } from "./event.dto";

export class UpdateEventDTO extends PartialType(AddEventDTO) {

}