import { Injectable } from '@nestjs/common';
import { Response } from 'express';

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.vfs;

@Injectable()
export class ExportService {
    async generatePDF(response: Response, contentData: any, filename: string) {
        const documentDefinition = {
            content: [
                { text: contentData.nom || 'Titre inconnu', style: 'header' },
                { text: `\nNom : ${contentData.nom}`, style: 'content' },
                { text: `Description : ${contentData.description}`, style: 'content' },
                { text: `Type : ${contentData.type}`, style: 'content' },
                {
                    text: `Site web : ${contentData.siteWeb}`,
                    link: contentData.siteWeb,
                    style: 'content',
                    color: 'blue',
                    decoration: 'underline'
                },
                { text: `Mentions : ${contentData.mentions}`, style: 'content' },
                { text: `Ville : ${contentData.ville}`, style: 'content' },
                { text: `Adresse : ${contentData.adresse}`, style: 'content' },
                { text: '\nGénéré par PDFMake', style: 'footer' }
            ],
            styles: {
                header: { fontSize: 18, bold: true, alignment: 'center' },
                content: { fontSize: 12, margin: [0, 4, 0, 0] },
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
