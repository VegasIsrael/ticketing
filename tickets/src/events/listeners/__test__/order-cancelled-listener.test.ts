import { natsWrapper } from "../../../nats-wrapper";
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from '../../../models/ticket';
import mongoose from "mongoose";
import { OrderCancelledEvent } from "@vegasdevapps/tickets-common";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        title: 'Splean',
        price: 330,
        userId: mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, orderId, ticket, data, msg };
};

it('updates the ticket, publishes an event, and acks the messages', async () => {
    const { listener, orderId, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toBeCalledTimes(1);
    expect(natsWrapper.client.publish).toBeCalledTimes(1);
});