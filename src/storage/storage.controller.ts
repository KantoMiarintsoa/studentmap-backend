import { Controller, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Response } from 'express';
import path from 'path';
import fs from "fs";

@Controller('storage')
export class StorageController {
    constructor(private storageService: StorageService) { }

    @Get("preview/:filename(*)")
    async preview(
        @Param('filename') filename: string,
        @Res() res: Response
    ) {
        return res.sendFile(await this.storageService.getFile(filename))
    }

    @Get('download/:filename(*)')
    async downloadFile(
        @Param('filename') filename: string,
        @Res() res: Response
    ) {
        const filePath = path.join(process.cwd(), 'upload', filename);

        if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
        }

        return res.download(filePath); // prompts browser to download the file
    }
}