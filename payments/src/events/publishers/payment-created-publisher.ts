import { PaymentCreatedEvent, Subjects, Publisher } from "@vegasdevapps/tickets-common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}