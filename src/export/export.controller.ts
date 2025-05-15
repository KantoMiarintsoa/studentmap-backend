import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';


@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Get('pdf')
    async generatePDf(
        @Query('content') content: string,
        @Query('filename') filename: string,
        @Res() response: Response
    ) {
        return await this.exportService.generatePDF(response, content, filename)
    }
}


