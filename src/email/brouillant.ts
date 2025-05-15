import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            throw new Error("provide RESEND_API_KEY");
        }

        this.resend = new Resend(apiKey);
    }

    async sendEmailAfterRegister({
        email
    }: {
        email: string
    }) {
        try {
            await this.resend.emails.send({
                from: "onboarding@resend.dev",
                to: email,
                subject: "Welcome to StudentMap",
                html: `<p>welcome to studentMap🤠</p>`
            });
            console.log("email sent to ", email);
        }
        catch (error) {
            console.log(error)
        }
    }

    async sendForgotPassword({
        email
    }: {
        email: string
    }) {
        await this.resend.emails.send({
            from: "no-reply@resend.dev",
            to: email,
            subject: "Reset your password",
            html: `
                <p>You forgot your password, don't worry! We got you</p>
            `
        });
    }

    async notifyEmail({
        email
    }: {
        email: string
    }) {
        await this.resend.emails.send({
            from: "no-reply@resend.dev",
            to: email,
            subject: "Reset your password",
            html: `
                <p>You forgot your password, don't worry! We got you</p>
            `
        });
    }
}
