import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
});

it('returns a 400 with an invalide email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@testcom',
            password: 'password'
        })
        .expect(400);
});

it('returns a 400 with an invalide password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'sa'
        })
        .expect(400);
});

it('returns a 400 with an invalide email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'testest.com',
            password: 'sa'
        })
        .expect(400);
});

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({})
        .expect(400);
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
    
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400);
});


it('sets cookie after successefull signup', async () => {
        const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        }).expect(201);
    
    expect(response.get('Set-Cookie')).toBeDefined();
});