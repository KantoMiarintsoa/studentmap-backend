import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AddAccomodationDTO } from './dto/accommodation.dto';
import { Type as AccommodationType } from '@prisma/client';
import { UpdateAccommodationDTO } from './dto/update.dto';

@Injectable()
export class AccommodationService {
    constructor(
        private prisma: PrismaService
    ) { }

    async addAccomodation(data: AddAccomodationDTO, userId: number) {
        const accommodationExist = await this.prisma.accommodation.findFirst({
            where: { address: data.address }
        })
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

        return this.prisma.accommodation.create({
            data: {
                name: data.name,
                address: data.address,
                area: data.area,
                receptionCapacity: data.receptionCapacity,
                IsAvailable: data.IsAvailable,
                rentMin: data.rentMin,
                rentMax: data.rentMax,
                type: data.type,
                owner: { connect: { id: ownerId } }
            }
        })
    }

    async detailsAccommodation(id: number) {
        const accommodation = await this.prisma.accommodation.findUnique({
            where: { id: id }
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
        return await this.prisma.accommodation.findMany()

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


    async searchAccommodation(type?: string) {
        if (!type || type.trim() === "") {
            return await this.prisma.accommodation.findMany({
                orderBy: {
                    id: "asc"
                }
            });
        }

        // const values = Object.values(Type)
        const normalizedType = type.trim().toUpperCase();
        const allowedTypes = Object.values(AccommodationType);


        if (!allowedTypes.includes(normalizedType as AccommodationType)) {
            throw new BadRequestException({
                messsage: "invalid accommodation"
            })
        }

        const accommodations = await this.prisma.accommodation.findMany({
            where: {
                type: {
                    equals: normalizedType as AccommodationType
                }
            },
            orderBy: {
                id: "asc"
            }
        })

        return accommodations
    }








}


