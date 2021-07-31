import { NotAuthorizedError, NotFoundError, requireAuth } from '@vegasdevapps/tickets-common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

// TODO: orderId parameter validation

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        // I think that is be better to throw Not Found error instead.
        // coz if order does not belong to current user, he defenatly no
        // need to know that order exists.
        throw new NotAuthorizedError();
    }
    res.send(order);
});

export { router as showOrderRouter };