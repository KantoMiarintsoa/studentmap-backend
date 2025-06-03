import { Injectable } from "@nestjs/common";
import Stripe from "stripe";


@Injectable()
export class StripeService {
    private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    async createCustomer(email:string, name:string){
        const customer = await this.stripe.customers.create({
            email,
            name
        });
        return customer.id;
    } 

    async createSetupIntent(customerId:string){
        return this.stripe.setupIntents.create({
            customer: customerId
        });
    }

    async listPaymentMethods(customerId:string){
        return this.stripe.paymentMethods.list({
            customer: customerId
        });
    }

    async createPaymentIntent(
        amount:number, 
        currency:string, 
        customerId:string,
        paymentmethod:string
    ){
        return this.stripe.paymentIntents.create({
            amount: amount * 100, // Stripe works with cents
            currency: currency,
            customer: customerId,
            payment_method:paymentmethod,
            off_session: true,
            confirm: true,
        });
    }

    async removePaymentMethod(
        paymentMethodId:string
    ){
        return this.stripe.paymentMethods.detach(paymentMethodId);
    }
    
}
