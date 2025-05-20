import { Controller, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Response } from 'express';

@Controller('storage')
export class StorageController {
    constructor(private storageService: StorageService) { }

    @Get("preview/:filename")
    async preview(
        @Param('filename') filename: string,
        @Res() res: Response
    ) {
        return res.sendFile(await this.storageService.getFile(filename))
    }
}