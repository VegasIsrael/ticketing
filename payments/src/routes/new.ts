import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus
} from '@vegasdevapps/tickets-common';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { stripe } from '../stripe';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { Payment } from '../models/payments';

const router = express.Router();

const validation = [
    body('token')
        .not()
        .isEmpty(),
    body('orderId')
        .not()
    .isEmpty()
];

router.post('/api/payments', requireAuth, validation, validateRequest, async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for an cancelled order');
    }
       
    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    });
    const payment = Payment.build({
        orderId,
        stripeId: charge.id
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    })
 
    res.status(201).send({ id: payment.id });
});

export { router as createChargeRouter };