import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@vegasdevapps/tickets-common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        userId: mongoose.Types.ObjectId().toHexString(),
        title: 'epica',
        price: 150
    });
    await ticket.save();


    // create fake data event 
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().setMinutes(15).toString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    // create fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket };

};

it('sets the userId of the ticket', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, data, msg, ticket } = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);

    expect(JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]).orderId).toEqual(data.id);
});