import mangoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@vegasdevapps/tickets-common";
import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: mangoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: 'sdgsdfgdfg',
        userId: mangoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: 'sdfsdfsdf',
            price: 149
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);

});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalledTimes(1);
});