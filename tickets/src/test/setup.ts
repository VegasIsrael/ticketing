import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../app';

declare global{
    namespace NodeJS {
        interface Global {
            signin(): string[];
        }
    }
}


jest.mock('../nats-wrapper');

let mongo: MongoMemoryServer;

beforeAll(async () => {

    process.env.JWT_KEY = 'fdsdgsdfg';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

});

beforeEach(async () => {

    jest.clearAllMocks();

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin = () => {
    
    // Build a  JWT payload. {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Create the JWY
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object {jwt: MY_JWT}
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as Base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string thats the cookie with the encoded data
    return [`express:sess=${base64}`];
}