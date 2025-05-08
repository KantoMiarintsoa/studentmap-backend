import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AddEventDTO } from './dto/event.dto';
import { UpdateEventDTO } from './dto/update-event.dto';

@Injectable()
export class EventService {
    constructor(
        private prisma: PrismaService
    ) { }

    async addEvent(data: AddEventDTO, userId: number) {
        const eventExist = await this.prisma.event.findFirst({
            where: { name: data.name }
        })

        if (eventExist) {
            throw new BadRequestException({
                message: "event already exist"
            })
        }

        if (!userId) {
            throw new BadRequestException({
                message: "user id missing or invalide"
            })
        }

        return this.prisma.event.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                startDate: data.startDate,
                endDate: data.endDate ?? null,
                location: data.location ?? null,
                capacity: data.capacity ?? null,
                registration_available: data.registrationAvailable ?? false,
                registration_link: data.registrationLink ?? null,
                image: data.photo ?? null,
                created_at: data.createdAt ?? new Date(),
                updated_at: data.updateAt ?? new Date(),
                user: { connect: { id: userId } },
                ...(data.universityId && { university: { connect: { id: data.universityId } } })
            }
        })
    }


    async getEventById(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: id }
        })

        if (!event) {
            throw new BadRequestException({
                message: "event not found"
            })
        }
        return event
    }

    async updateEvent(id: number, data: UpdateEventDTO) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        })

        if (!event) {
            throw new BadRequestException({
                message: "event not found"
            })
        }

        return this.prisma.event.update({
            where: { id },
            data
        })

    }

    async deleteEvent(id: number) {
        const event = await this.prisma.event.findUnique({
            where: { id }
        })

        if (!event) {
            throw new BadRequestException({
                message: "event not found"
            })
        }

        await this.prisma.event.delete({
            where: { id }
        })
        return { message: "event deleted" }
    }

    async getAllEvent() {
        return await this.prisma.event.findMany()
    }

    async registerEvent(eventId: number, userId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { EventStudent: true }
        });

        if (!event) {
            throw new BadRequestException({
                message: "event not found"
            })
        }

        const userExist = await this.prisma.eventStudent.findFirst({
            where: {
                eventId,
                userId
            }
        })

        if (userExist) {
            throw new BadRequestException({
                message: "user already registered to this event"
            })
        }

        const registration = await this.prisma.eventStudent.create({
            data: {
                eventId,
                userId,
            },

        })
        return registration
    }
}
