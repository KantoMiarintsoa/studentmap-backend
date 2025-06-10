import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Get('pdf')
    async exportPDF(@Res() response: Response) {
        const data = {
            nom: 'ua',
            description: 'desc',
            type: 'prive',
            siteWeb: 'https://www.uaz.zurcher.edu.mg',
            mentions: 'arts, commerce',
            ville: 'Antsirabe',
            adresse: 'adress'
        };

        await this.exportService.generatePDF(response, data, 'universite_ua');
    }
}
