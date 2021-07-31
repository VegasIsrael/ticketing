import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const url = '/api/tickets';

it('has a route handler listening to /api/tickets for post requests', async () => {
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

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        }).expect(400);
    
    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({
            price: 10
        }).expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({
            title: 'asdasdasd',
            price: -10
        }).expect(400);

    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({
            title: 'asdasdasd'
        }).expect(400);
});

it('creates a ticket with valide inputs', async () => {

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    // add in a check to make sure a ticket was saved
    
    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({
            title: 'asdasdasd',
            price: 10.75
        }).expect(201);
    
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(10.75);
    expect(tickets[0].title).toEqual('asdasdasd');
});

it('publishes an event', async () => {

    await request(app)
        .post(url)
        .set('Cookie', global.signin())
        .send({
            title: 'asdasdasd',
            price: 10.75
        }).expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});