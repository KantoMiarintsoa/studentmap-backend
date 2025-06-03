import { IsInt, IsString } from "class-validator";

export class BuyCreditDto {
    @IsInt()
    credits:number;

    @IsString()
    paymentMethod:string;
}