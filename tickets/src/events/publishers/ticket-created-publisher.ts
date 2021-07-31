import { Publisher, Subjects, TicketCreatedEvent } from '@vegasdevapps/tickets-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    
}