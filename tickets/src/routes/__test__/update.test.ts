import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const id = new mongoose.Types.ObjectId().toHexString();

const createTicket = (cookie = global.signin()) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'sgrgsdf', price: 5 });
}

it('returns a 404 if provided id does not exists', async () => {
    
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'asfsd',
            price: 45
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'asfsd',
            price: 45
        })
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const newTicket = await createTicket();

    await request(app)
        .put(`/api/tickets/${newTicket.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'dadawe',
            price: 100
        })
        .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const ticket = await createTicket(cookie);

    await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 100
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'sdfsdfsd',
            price: -100
        })
        .expect(400);
});

it('update the ticket provided valide inputs', async () => {
    const cookie = global.signin();
    const ticket = await createTicket(cookie);

    await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'vega',
            price: 11
        })
        .expect(200);
    
    const updatedTicket = await request(app)
        .get(`/api/tickets/${ticket.body.id}`)
        .send();
    
    expect(updatedTicket.body.title).toEqual('vega');
    expect(updatedTicket.body.price).toEqual(11);
});

it('publishes an event', async () => {

    const cookie = global.signin();
    const ticket = await createTicket(cookie);

    await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'vega',
            price: 11
        })
        .expect(200);

    const updatedTicket = await request(app)
        .get(`/api/tickets/${ticket.body.id}`)
        .send();

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const ticket = await createTicket(cookie);

    const ticketDB = await Ticket.findById(ticket.body.id);
    ticketDB!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticketDB!.save()

    await request(app)
        .put(`/api/tickets/${ticket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'vega',
            price: 11
        })
        .expect(400);

});