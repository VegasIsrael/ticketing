import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
    
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
    
});

it('returns the ticket if ticket is found', async () => {

    const title = 'epica';
    const price = 149;

    const newTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title, price }).expect(201);
    
    const getTicket = await request(app)
        .get(`/api/tickets/${newTicket.body.id}`)
        .send()
        .expect(200);
    
    expect(getTicket.body.title).toEqual(title);
    expect(getTicket.body.price).toEqual(price);
});

