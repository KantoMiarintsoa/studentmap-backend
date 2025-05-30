import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AddUniversityDTO } from './dto/university.dto';
import { UpdateAccommodationDTO } from 'src/accommodation/dto/update.dto';
import { UpdateUniversityDTO } from './dto/update-university.dto';
import { TypeUniversity } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UniversityService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService
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

        const university = await this.prisma.university.create({
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                webSite: data.webSite,
                mention: data.mention || [],
                address: data.address,
                city: data.city,
                localisation: data.localisation

            }
        })

        const users = await this.prisma.user.findMany({
            where: {
                address: data.address,
            },
            select: { email: true }
        });

        const subject = `📣 Nouvelle université ajoutée : ${data.name}`;
        const html = `
    <p>Bonjour,</p>
    <p>Une nouvelle université a été ajoutée sur notre plateforme :</p>
    <ul>
      <li><strong>Nom :</strong> ${data.name}</li>
      <li><strong>Adresse :</strong> ${data.address}, ${data.city}</li>
      <li><strong>Description :</strong> ${data.description}</li>
      <li><strong>Type :</strong> ${data.type}</li>
    </ul>
    <p>Visitez le site : <a href="${data.webSite}" target="_blank">${data.webSite}</a></p>`;

        for (const user of users) {
            try {
                await this.emailService.notifyEmail({
                    email: user.email,
                    subject,
                    html
                });
            }
            catch (error) {
                console.warn(`❌ Email non envoyé à ${user.email}`, error.message);
            }
        }

        return university;

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



    async filterUniversity(type?: string, name?: string, address?: string) {
        const whereClause: any = {};

        if (type && type.trim() !== "") {
            const typeValues = Object.values(TypeUniversity);
            const normalizedType = type.toLowerCase();

            if (!typeValues.includes(normalizedType as TypeUniversity)) {
                throw new BadRequestException({
                    message: "Invalid university type"
                });
            }

            whereClause.type = normalizedType as TypeUniversity;
        }

        if (name && name.trim() !== "") {
            whereClause.name = {
                contains: name,
                mode: "insensitive"
            };
        }
        if (address && address.trim() !== "") {
            whereClause.address = {
                contains: address,
                mode: "insensitive"
            };
        }

        const universities = await this.prisma.university.findMany({
            where: whereClause,
            orderBy: {
                id: "asc"
            }
        });

        if (!universities.length) {
            throw new NotFoundException({
                message: "No universities found"
            });
        }

        return universities;
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



