import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title: 'sgrgsdf', price: 5 });
}

it('can fetch a list of tickets', async () => {


    await createTicket();
    await createTicket();
    await createTicket();
    await createTicket();

    const list = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(list.body.length).toEqual(4);

});