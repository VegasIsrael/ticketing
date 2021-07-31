import { Subjects, ExpirationCompleteEvent, Publisher } from '@vegasdevapps/tickets-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    

}