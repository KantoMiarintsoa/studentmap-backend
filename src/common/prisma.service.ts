import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
    onModuleDestroy() {
        this.$disconnect
    }
    onModuleInit() {
        this.$connect
    }

    async drawGraph() {
        const monthNames = ['Jan', 'Fevrir', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const users = await this.user.findMany({
            select: {
                createdAt: true,
                role: true
            }
        });

        const monthlyCounts: Record<string, { student: number; owner: number; organizer: number }> = {};

        for (const user of users) {
            const date = new Date(user.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
            if (!monthlyCounts[key]) {
                monthlyCounts[key] = { student: 0, owner: 0, organizer: 0 };
            }
            if (user.role === 'STUDENT') monthlyCounts[key].student++;
            else if (user.role === 'OWNER') monthlyCounts[key].owner++;
            else if (user.role === 'ORGANIZER') monthlyCounts[key].organizer++;
        }

        const allKeys = Object.keys(monthlyCounts).sort();

        const lastThreeKeys = allKeys.slice(-3);

        const currentDate = new Date();
        while (lastThreeKeys.length < 3) {
            const newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
            const key = `${newDate.getFullYear()}-${String(newDate.getMonth()).padStart(2, '0')}`;
            if (!lastThreeKeys.includes(key)) {
                lastThreeKeys.unshift(key);
            }
        }

        for (const key of lastThreeKeys) {
            if (!monthlyCounts[key]) {
                monthlyCounts[key] = { student: 0, owner: 0, organizer: 0 };
            }
        }

        const labels = lastThreeKeys.map(key => {
            const [year, month] = key.split('-').map(Number);
            return monthNames[month];
        });

        const datasets = [
            {
                label: 'Student',
                borderColor: 'blue',
                tension: 0.4,
                data: lastThreeKeys.map(key => monthlyCounts[key].student)
            },
            {
                label: 'Owner',
                borderColor: 'orange',
                tension: 0.4,
                data: lastThreeKeys.map(key => monthlyCounts[key].owner)
            },
            {
                label: 'Organizer',
                borderColor: 'green',
                tension: 0.4,
                data: lastThreeKeys.map(key => monthlyCounts[key].organizer)
            }
        ];

        return {
            labels,
            datasets
        };
    }


    async getDashboardStats() {
        const [eventCount, universityCount, accommodationCount, userCount] = await Promise.all([
            this.event.count(),
            this.university.count(),
            this.accommodation.count(),
            this.user.count()
        ])

        return {
            totalEvents: eventCount,
            totalUniversities: universityCount,
            totalAccommodations: accommodationCount,
            totalUsers: userCount
        }
    }
}