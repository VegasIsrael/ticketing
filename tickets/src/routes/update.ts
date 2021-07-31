import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@vegasdevapps/tickets-common';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

const ticketsValidations = [
    body('title').not().isEmpty().withMessage('Title is requered'),
    body('price').isFloat({ gt: 0 }).withMessage('Valide price is requered'),
]

router.put('/api/tickets/:id', requireAuth, ticketsValidations, validateRequest, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (ticket.orderId) {
        throw new BadRequestError('Cannot edit a reserved ticket');
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price
    });
    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client)
        .publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });
    res.send(ticket);
});

export { router as ticketUpdateRouter };