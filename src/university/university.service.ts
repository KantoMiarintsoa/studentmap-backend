import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AddUniversityDTO } from './dto/university.dto';
import { UpdateAccommodationDTO } from 'src/accommodation/dto/update.dto';
import { UpdateUniversityDTO } from './dto/update-university.dto';
import { TypeUniversity } from '@prisma/client';

@Injectable()
export class UniversityService {
    constructor(
        private prisma: PrismaService
    ) { }

    async addUniversity(data: AddUniversityDTO, userId: number) {
        const universityExist = await this.prisma.university.findFirst({
            where: { address: data.address }
        })

        if (universityExist) {
            throw new BadRequestException({
                message: "adress university is already exist"
            })
        }

        if (!userId) {
            throw new BadRequestException({
                message: "user id is missing or invalid"
            })
        }
        console.log(data)

        return this.prisma.university.create({
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                webSite: data.webSite,
                mention: data.mention || [],
                address: data.address,
                city: data.city

            }
        })
    }

    async getUniversity(id: number) {
        const university = await this.prisma.university.findUnique({
            where: { id: id }
        })

        if (!university) {
            throw new NotFoundException({
                message: "university not found"
            })
        }

        return university
    }

    async updateUniversity(id: number, data: UpdateUniversityDTO) {
        const university = await this.prisma.university.findUnique({
            where: { id }
        })

        if (!university) {
            throw new NotFoundException({
                message: "university not found"
            })
        }

        return this.prisma.university.update({
            where: { id },
            data
        })
    }

    async deleteUniversity(id: number) {
        const university = await this.prisma.university.findUnique({
            where: { id }
        })

        if (!university) {
            throw new BadRequestException({
                message: "university not found"
            })
        }

        await this.prisma.university.delete({
            where: { id }
        })

        return { message: "university deleted" }

    }


    async getAllUniversity() {
        return await this.prisma.university.findMany()
    }



    async searchUniversity(type?: string) {
        if (!type || type.trim() === "") {
            return await this.prisma.university.findMany({
                orderBy: {
                    id: "asc"
                }
            });
        }

        const typeValues = Object.values(TypeUniversity)
        const normalizedType = type.toLowerCase();

        if (!typeValues.includes(normalizedType as TypeUniversity)) {
            throw new BadRequestException({
                messsage: "invalid university"
            })
        }
        const universities = await this.prisma.university.findMany({
            where: {
                type: {
                    equals: normalizedType as TypeUniversity
                }
            },
            orderBy: {
                id: "asc"
            }
        })

        // if (!universities.length) {
        //     throw new NotFoundException({
        //         message: "No universities found for this type"
        //     });
        // }


        return universities
    }

    async compareUniversities(mentions: string[]) {
        if (!mentions || mentions.length === 0) {
            throw new BadRequestException({
                message: "At least one mention is required for comparison"
            })
        }

        const filterMentions = mentions.filter(mention => mention !== undefined && mention.trim() !== "")
        if (filterMentions.length === 0) {
            throw new BadRequestException({
                message: "No valid mentions provided"
            })
        }

        const universities = await this.prisma.university.findMany({
            where: {
                mention: {
                    hasSome: filterMentions
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        if (!universities.length) {
            throw new BadRequestException({
                message: "No universities found with the given mentions"
            })
        }
        return universities
    }
}