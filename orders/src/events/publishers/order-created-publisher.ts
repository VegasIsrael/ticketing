import { Publisher, OrderCreatedEvent, Subjects } from '@vegasdevapps/tickets-common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}