import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AddAccomodationDTO } from './dto/accommodation.dto';
import { Type as AccommodationType } from '@prisma/client';
import { UpdateAccommodationDTO } from './dto/update.dto';
import { EmailService } from 'src/email/email.service';
import { da } from '@faker-js/faker/.';
import { StorageService } from 'src/storage/storage.service';
import { contains } from 'class-validator';
import { haversineDistance } from 'src/common/distance';



interface SearchParams {
    name?: string;
    address?: string;
    type?: string;
    budget?: number;
}

@Injectable()
export class AccommodationService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private storageService: StorageService
    ) { }

    async addAccomodation(data: AddAccomodationDTO, userId: number, media?: Array<Express.Multer.File>) {
        const accommodationExist = await this.prisma.accommodation.findFirst({
            where: { address: data.address },
        },
        )

        if (accommodationExist) {
            throw new BadRequestException({ message: "address already exist" })
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, id: true }
        })

        if (!user) {
            throw new BadRequestException({ message: "User not found" })
        }

        const isAdmin = user.role === 'ADMIN';
        const ownerId = isAdmin ? data.ownerId : userId;

        if (!ownerId) {
            throw new BadRequestException({
                message: "Owner ID is required. (Admins must provide a valid ownerId)"
            });
        }

        const mediaUrl = [];

        if (media && media.length > 0) {
            media.forEach(async file => {
                const fileName = await this.storageService.uploadFile(file);
                mediaUrl.push(fileName);
            });
        }

        const accommodation = this.prisma.accommodation.create({
            data: {
                name: data.name,
                address: data.address,
                // neighborhood: data.neighborhood,
                // city: data.city,
                area: data.area,
                receptionCapacity: data.receptionCapacity,
                IsAvailable: data.IsAvailable,
                rentMin: data.rentMin,
                rentMax: data.rentMax,
                type: data.type,
                description: data.description,
                media: {
                    images: mediaUrl
                },
                owner: { connect: { id: ownerId } }
            }
        })
        console.log(accommodation)

        const users = await this.prisma.user.findMany({
            where: {
                address: data.address
            },
            select: { email: true }
        });

        const subject = `🏠 Nouveau logement disponible : ${data.name}`;
        const html = `
        <p>Bonjour,</p>
        <p>Un nouveau logement vient d'être ajouté sur la plateforme :</p>
        <ul>
            <li><strong>Nom :</strong> ${data.name}</li>
            <li><strong>Adresse :</strong> ${data.address}</li>
            <li><strong>Zone :</strong> ${data.area}</li>
            <li><strong>Capacité d'accueil :</strong> ${data.receptionCapacity}</li>
            <li><strong>Loyer :</strong> ${data.rentMin} - ${data.rentMax} MGA</li>
        </ul>
        <p>Connectez-vous à la plateforme pour en savoir plus !</p>`;

        for (const user of users) {
            try {
                await this.emailService.notifyEmail({
                    email: user.email,
                    subject,
                    html
                })
            }
            catch (error) {
                console.warn(`❌ Email non envoyé à ${user.email}`, error.message);
            }
        }
        return accommodation
    }


    async detailsAccommodation(id: number) {
        const accommodation = await this.prisma.accommodation.findUnique({
            where: { id: id },
            include: {
                owner: true
            }
        })

        if (!accommodation) {
            throw new NotFoundException({
                message: "accommodation not found"
            })
        } ``
        return accommodation
    }

    async updateAccommodation(id: number, data: UpdateAccommodationDTO, userId: number) {
        const accommodation = await this.prisma.accommodation.findUnique({
            where: ({ id })
        })

        if (!accommodation) {
            throw new BadRequestException({
                message: "accommodation not found"
            })
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, id: true }
        });

        if (!user) {
            throw new BadRequestException({
                message: "user not found"
            })
        }

        if (user.role !== "ADMIN" && accommodation.ownerId !== userId) {
            throw new ForbiddenException({
                message: "you don't have a permission to update this accommodation"
            })
        }

        return this.prisma.accommodation.update({
            where: { id },
            data
        })

    }

    async GetAllAccommodations() {
        return await this.prisma.accommodation.findMany({
            include: {
                owner: true
            }
        })
    }

    async GetAccommodationsByOwner(userId: number) {
        return await this.prisma.accommodation.findMany({
            where: {
                ownerId: userId,
            },
            orderBy: {
                id: 'desc',
            },
        });
    }


    async deleteAccommodation(id: number) {
        const accommodation = await this.prisma.accommodation.findUnique({
            where: { id }
        });

        if (!accommodation) {
            throw new NotFoundException({ message: "accommodation not found" });
        }

        return await this.prisma.accommodation.delete({
            where: { id }
        });
    }


    // async sortByAccommodation(type?: string) {
    //     if (!type || type.trim() === "") {
    //         return await this.prisma.accommodation.findMany({
    //             orderBy: {
    //                 id: "asc"
    //             }
    //         });
    //     }

    //     // const values = Object.values(Type)
    //     const normalizedType = type.trim().toUpperCase();
    //     const allowedTypes = Object.values(AccommodationType);


    //     if (!allowedTypes.includes(normalizedType as AccommodationType)) {
    //         throw new BadRequestException({
    //             messsage: "invalid accommodation"
    //         })
    //     }

    //     const accommodations = await this.prisma.accommodation.findMany({
    //         where: {
    //             type: {
    //                 equals: normalizedType as AccommodationType
    //             }
    //         },
    //         orderBy: {
    //             id: "asc"
    //         }
    //     })

    //     return accommodations
    // }

    async advancedSearch(params: SearchParams) {
        const { name, address, type, budget } = params;

        const results = await this.prisma.accommodation.findMany({
            where: {
                AND: [
                    name ? { name: { contains: name, mode: 'insensitive' } } : {},
                    address ? { address: { contains: address, mode: 'insensitive' } } : {},
                    type ? { type: type as any } : {},
                    budget !== undefined
                        ? {
                            rentMin: { lte: budget },
                            rentMax: { gte: budget }
                        }
                        : {}
                ]
            },
            orderBy: {
                id: 'asc'
            },
            include: {
                owner: true
            }
        });

        // if (results.length === 0) {
        //     throw new NotFoundException('No results found for this search.');
        // }

        return results;
    }

    // private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    //     const R = 6371;
    //     const dLat = (lat2 - lat1) * Math.PI / 180;
    //     const dLon = (lon2 - lon1) * Math.PI / 180;
    //     const a =
    //         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //         Math.cos(lat1 * Math.PI / 180) *
    //         Math.cos(lat2 * Math.PI / 180) *
    //         Math.sin(dLon / 2) * Math.sin(dLon / 2);
    //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //     return R * c;
    // }

    async findAccommodationsNearUniversity(
        nameUniversity?: string,
        city?: string,
        address?: string,
        budget?: number,
        type?: AccommodationType
    ) {

        let searchAddress = city ?? address;

        if (nameUniversity) {
            const university = await this.prisma.university.findFirst({
                where: {
                    name: {
                        contains: nameUniversity,
                        mode: 'insensitive',
                    },
                },
            });

            if (!university) {
                throw new NotFoundException(`University "${nameUniversity}" not found`);
            }

            const { city: uniCity, neighborhood: uniNeighborhood } = university;

            searchAddress = uniNeighborhood;
        }

        const results = await this.advancedSearch({
            address: searchAddress,
            budget,
            type
        });

        return results
    }
}

