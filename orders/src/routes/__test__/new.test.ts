import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const url = '/api/orders';

it('has a route handler listening to /api/orders for post requests', async () => {
    const response = await request(app)
        .post(url)
        .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the is signed in', async () => {
    const response = await request(app)
        .post(url)
        .send({});

    expect(response.status).toEqual(401);
});

it('returns a status other than 401 if user signed in', async () => {

    const response = await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({ ticketId })
        .expect(404);
});


it('returns an error if the ticket already reserved', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 149
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'sfsfsdgre',
        status: OrderStatus.Complete,
        expiresAt: new Date()
    })
    await order.save();

    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'megadeath',
        price: 25
    });
    await ticket.save();

    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'megadeath',
        price: 25
    });
    await ticket.save();

    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});