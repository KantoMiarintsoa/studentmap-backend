import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import * as fs from "fs/promises"
import { join, resolve } from 'path';


@Injectable()
export class StorageService {
    private DIRECTORY_NAME = "upload";
    constructor() {
        this.createDirectory()
    }

    async uploadFile(file: Express.Multer.File, fileName: string | null = undefined) {
        const filePath = fileName ?? crypto.randomUUID()
        const extension = file.originalname.split('.').pop()
        try {
            fs.writeFile(`${this.DIRECTORY_NAME}/${filePath}.${extension}`, file.buffer)
        }
        catch {
            throw new InternalServerErrorException("failed to save file locally")
        }
        return `${filePath}.${extension}`
    }

    async createDirectory() {
        try {
            const dirStat = await fs.stat(this.DIRECTORY_NAME)

            if (!dirStat.isDirectory()) {
                throw new Error("not a directory")
            }
        }
        catch (error: any) {
            if (error.code === "ENOENT") {
                try {
                    fs.mkdir(this.DIRECTORY_NAME, { recursive: true });
                }
                catch {
                    throw new InternalServerErrorException("Failed to create upload path");
                }
            }
            else {
                throw new InternalServerErrorException("Failed to verify directory");
            }
        }
    }

    async getFile(fileName: string) {
        const path = join(resolve(this.DIRECTORY_NAME), fileName)
        if (!existsSync(path)) {
            throw new NotFoundException({
                message: "file not founs"
            })
        }
        return path

    }
}
