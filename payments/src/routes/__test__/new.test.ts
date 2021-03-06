import { OrderStatus } from '@vegasdevapps/tickets-common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asfasdf',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);

});

it('returns a 401 when purchasing an order that doesn\'t belong to the user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 129,
        status: OrderStatus.Created,
        version: 0,
        userId: mongoose.Types.ObjectId().toHexString()
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asfasdf',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async function name() {
    
    const userId = mongoose.Types.ObjectId().toHexString();
    
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 129,
        status: OrderStatus.Cancelled,
        version: 0,
        userId
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asfasdf',
            orderId: order.id
        })
        .expect(400);
});


it('returns a 204 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 129,
        status: OrderStatus.Created,
        version: 0,
        userId
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);
    
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(129 * 100);
    expect(chargeOptions.currency).toEqual('usd');
});