import express, { Request, response, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
   
    const tiketsList = await Ticket.find({
        orderId: undefined
    });

    res.status(200).send(tiketsList);
});

export { router as ticketsListRouter };