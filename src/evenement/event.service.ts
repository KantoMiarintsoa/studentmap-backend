import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AddEventDTO } from './dto/event.dto';
import { UpdateEventDTO } from './dto/update-event.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class EventService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService
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

        const event = await this.prisma.event.create({
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
        });

        const users = await this.prisma.user.findMany({
            select: {
                email: true,
                address: true,
                preference: true
            }
        });

        const subject = `📢 Nouvel événement : ${data.name}`;
        const html = `
            <p>Bonjour,</p>
            <p>Un nouvel événement a été publié sur la plateforme :</p>
            <ul>
                <li><strong>Nom :</strong> ${data.name}</li>
                <li><strong>Lieu :</strong> ${data.location ?? 'Non précisé'}</li>
                <li><strong>Date de début :</strong> ${new Date(data.startDate).toLocaleDateString()}</li>
                ${data.endDate ? `<li><strong>Date de fin :</strong> ${new Date(data.endDate).toLocaleDateString()}</li>` : ''}
                ${data.registrationLink ? `<li><strong>Inscription :</strong> <a href="${data.registrationLink}">Lien</a></li>` : ''}
            </ul>
            <p>${data.description ?? ''}</p>`;

        for (const user of users) {
            const adressProche = user.address?.toLowerCase().includes(data.location?.toLowerCase() || '')
            const preferenceCorrespond = user.preference?.some((pref: string) =>
                data.name.toLowerCase().includes(pref.toLowerCase())
            );
            if (!adressProche && preferenceCorrespond) {
                continue;
            }
            try {
                await this.emailService.notifyEmail({
                    email: user.email,
                    subject,
                    html
                })
            }

            catch (error) {
                console.warn(` Email non envoyé à ${user.email}`, error.message);
            }
        }

        return event

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

    async searchEventsByName(name?: string) {
        if (!name || name.trim() === '') {
            return this.prisma.event.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
        }

        const events = await this.prisma.event.findMany({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
            orderBy: {
                name: 'asc'
            }
        })

        if (!events.length) {
            return this.prisma.event.findMany({
                orderBy: {
                    name: 'asc'
                }
            })
        }
        return events
    }
}

