import { Publisher, Subjects, TicketUpdatedEvent } from '@vegasdevapps/tickets-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

}