import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';


@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 587,
            auth: {
                user: "c7bc900ac41043",
                pass: "7e8a28925c073e"
            }
        })
    }

    async sendEmailAfterRegister({
        email
    }: {
        email: string
    }) {

        const mailOptions = {
            from: '"StudentMap" <no-reply@studentMap.com>',
            to: email,
            subject: "welcome to studentMap",
            text: "welcome to studentMap "
        };
        try {
            const info = await this.transporter.sendMail(mailOptions)
            console.log('Email sent: ', info.response);
            return info
        }
        catch (error) {
            console.error('Error sending email: ', error);
            // throw new Error('Email sending failed');
        }
    }

    async sendForgotPassword({ email, code }: { email: string, code: string }) {
        const mailOptions = {
            from: '"StudentMap" <no-reply@studentmap.com>',
            to: email,
            subject: '🔐 Code de réinitialisation de mot de passe',
            html: `
      <p>Voici votre code de vérification :</p>
      <h2>${code}</h2>
      <p>Ce code expirera bientôt.</p>
    `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ', info.response);
            return info;
        } catch (error) {
            console.error('Error sending reset email: ', error);
            // throw new Error('Email sending failed');
        }
    }


    async notifyEmail({ email, subject, html }: { email: string, subject: string, html: string }) {
        const mailOptions = {
            from: '"StudentMap" <no-reply@studentmap.com>',
            to: email,
            subject: ' Notification from StudentMap',
            html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Notification ema   il sent:', info.response);
            return info;
        } catch (error) {
            console.error('Error sending notification email:', error);
            // throw new Error('Failed to send notification email');
        }
    }
}


