import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@vegasdevapps/tickets-common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { TicketCreatedEvent } from '@vegasdevapps/tickets-common';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

const ticketsValidations = [
    body('title').not().isEmpty().withMessage('Title is requered'),
    body('price').isFloat({gt: 0}).withMessage('Valide price is requered'),
]

router.post('/api/tickets', requireAuth, ticketsValidations, validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    });
    await ticket.save();
    new TicketCreatedPublisher(natsWrapper.client)
        .publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

    res.status(201).send(ticket);
});
 
export { router as createTicketRouter };