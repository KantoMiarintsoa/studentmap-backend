import { Injectable } from '@nestjs/common';
import { Response } from 'express';

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.vfs;

@Injectable()
export class ExportService {
    async generatePDF(response: Response, content: string, filename: string) {
        const documentDefinition = {
            content: [
                { text: 'Titre du PDF kanto', style: 'header' },
                { text: content || 'Contenu par défaut', style: 'content' },
                { text: 'Généré par PDFMake', style: 'footer' }
            ],
            styles: {
                header: { fontSize: 18, bold: true, alignment: 'center' },
                content: { fontSize: 12, alignment: 'left' },
                footer: { fontSize: 10, italics: true, alignment: 'center' }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = pdfMake.createPdf(documentDefinition);

        pdfDoc.getBuffer((buffer: Buffer) => {
            response.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'rapport'}.pdf"`,
                'Content-Length': buffer.length.toString(),
            });
            response.end(buffer);
        });
    }
}

