import { PrismaClient, Role, Type, TypeUniversity } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

function getImageGroups(images: string[], groupSize: number, count: number): string[][] {
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    const groups: string[][] = [];

    for (let i = 0; i < count && shuffled.length >= groupSize; i++) {
        groups.push(
            shuffled.splice(0, groupSize).map((img) => `house_data/${img}`)
        );
    }

    return groups;
}

const imageFolder = path.join(__dirname, "../upload/house_data"); // adjust path if needed
const allImages = fs.readdirSync(imageFolder).filter(file =>
    /\.(jpe?g|png|webp)$/i.test(file)
);

const imageGroups = getImageGroups(allImages, 4, 30); // 30 accommodations


async function main() {
    const users = await Promise.all(
        Array.from({ length: 20 }).map(() =>
            prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    password: bcrypt.hashSync("password", 8),
                    contact: faker.phone.number(),
                    role: faker.helpers.arrayElement(Object.values(Role))
                }
            })
        )
    );

    const universities = await Promise.all(
        Array.from({ length: 3 }).map(() =>
            prisma.university.create({
                data: {
                    name: faker.company.name(),
                    description: faker.lorem.paragraph(),
                    city: faker.location.city(),
                    webSite: faker.internet.url(),
                    mention: ["Informatique", "Art", "Commerce"],
                    type: faker.helpers.arrayElement(Object.values(TypeUniversity)),
                    address: faker.location.streetAddress()
                }
            })
        )
    );

    await Promise.all(
        Array.from({ length: 30 }).map((_, index) =>
            prisma.accommodation.create({
                data: {
                    name: faker.company.name(),
                    address: faker.location.streetAddress(),
                    area: faker.number.float({ min: 20, max: 200 }),
                    receptionCapacity: `${faker.number.int({ min: 1, max: 4 })}`,
                    IsAvailable: faker.datatype.boolean(),
                    rentMin: faker.number.float({ min: 100, max: 500 }),
                    rentMax: faker.number.float({ min: 501, max: 1000 }),
                    currency: "Ar",
                    media: {
                        images: imageGroups[index] || [],
                    },
                    ownerId: faker.helpers.arrayElement(users.filter(user => user.role === Role.OWNER)).id,
                    type: faker.helpers.arrayElement(Object.values(Type)),
                }
            })
        )
    );

    await Promise.all(
        Array.from({ length: 5 }).map(() => {
            const university = faker.helpers.arrayElement(universities);
            const user = faker.helpers.arrayElement(users.filter(user => user.role === Role.ORGANIZER));
            const startDate = faker.date.soon();
            const endDate = faker.date.soon({ days: 10 });

            return prisma.event.create({
                data: {
                    name: faker.company.catchPhrase(),
                    description: faker.lorem.paragraph(),
                    startDate,
                    endDate,
                    created_at: new Date(),
                    updated_at: new Date(),
                    location: faker.location.streetAddress(),
                    capacity: faker.number.float({ min: 10, max: 200 }),
                    registration_available: faker.datatype.boolean(),
                    registration_link: faker.internet.url(),
                    image: faker.image.url(),
                    universityId: university.id,
                    userId: user.id,
                },
            });
        })
    );

    console.log("Database seeed successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());