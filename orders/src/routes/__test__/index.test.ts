import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

const url = '/api/orders';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'asdaa',
        price: 31
    });
    return await ticket.save();
}

it('fetches orders for an particular user', async () => {
    // create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();


    const userOne = global.signin();
    const userTwo = global.signin();

    // create one order as user #1
    await request(app)
        .post(url)
        .set('Cookie', userOne)
        .send({
            ticketId: ticketOne.id
        }).expect(201);

    // create two order as user #2
    const { body: orderOne } = await request(app)
        .post(url)
        .set('Cookie', userTwo)
        .send({
            ticketId: ticketTwo.id
        }).expect(201);
    
    const { body: orderTwo } = await request(app)
        .post(url)
        .set('Cookie', userTwo)
        .send({
            ticketId: ticketThree.id
        }).expect(201);

    // make reauest to get orders for user #2
    const response = await request(app)
        .get(url)
        .set('Cookie', userTwo)
        .expect(200);

    // Make sure we only gots orders for user #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});