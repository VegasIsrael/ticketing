import { Publisher, OrderCancelledEvent, Subjects } from '@vegasdevapps/tickets-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}