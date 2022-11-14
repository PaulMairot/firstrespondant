import supertest from "supertest"
import app from "../app.js"
import mongoose from "mongoose"
import { cleanUpDatabase, generateValidJwt } from "./utils.js"
import User from "../models/user.js"

beforeEach(cleanUpDatabase);

describe('POST /users', function() {
    test('should create a user', async function() {
        const res = await supertest(app)
        .post('/users')
        .send({
            firstName: 'John',
            lastName : 'Doe',
            email : 'john.doe@email.ch',
            password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/);
    });

    test('should not create a user (firstName too short)', async function() {
        const res = await supertest(app)
        .post('/users')
        .send({
            firstName: 'J',
            lastName : 'Doe',
            email : 'john.doe@email.ch',
            password: 'password'
        })
        .expect(400)
        .expect('Content-Type', /json/);
        
        expect(res.body.firstName).toEqual('Path `firstName` (`J`) is shorter than the minimum allowed length (2).');
    });

    test('should not create a user (firstName and LastName too short)', async function() {
        const res = await supertest(app)
        .post('/users')
        .send({
            firstName: 'J',
            lastName : 'D',
            email : 'john.doe@email.ch',
            password: 'password'
        })
        .expect(400)
        .expect('Content-Type', /json/);
        
        expect(res.body.firstName).toEqual('Path `firstName` (`J`) is shorter than the minimum allowed length (2).');
        expect(res.body.lastName).toEqual('Path `lastName` (`D`) is shorter than the minimum allowed length (2).');
    });

    test('should not create a user (firstName and LastName too long)', async function() {
        const res = await supertest(app)
        .post('/users')
        .send({
            firstName: 'Joooooooooohnnnnnnnnnn',
            lastName : 'Doooooooooooooeeeeeeeee',
            email : 'john.doe@email.ch',
            password: 'password'
        })
        .expect(400)
        .expect('Content-Type', /json/);
        
        expect(res.body.firstName).toEqual('Path `firstName` (`Joooooooooohnnnnnnnnnn`) is longer than the maximum allowed length (20).');
        expect(res.body.lastName).toEqual('Path `lastName` (`Doooooooooooooeeeeeeeee`) is longer than the maximum allowed length (20).');
    });

    test('should not create a user (no email entered)', async function() {
        const res = await supertest(app)
        .post('/users')
        .send({
            firstName: 'John',
            lastName : 'Doe',
            email : '',
            password: 'password'
        })
        .expect(400)
        .expect('Content-Type', /json/);
        
        expect(res.body.email).toEqual('Path `email` is required.');
    });

    test('should not create a user (user with email already exists)', async function() {
        User.create({ firstName: 'John',  lastName: 'Doe', email: 'john.doe@email.ch', password: 'password'})
        const res = await supertest(app)
        .post('/users')
        .send({
            firstName: 'James',
            lastName : 'Doe',
            email : 'john.doe@email.ch',
            password: 'password'
        })
        .expect(500);
    });

});


let userID;
let token;


describe('GET /users', function() {
    let johnDoe;
    let janeDoe;
    beforeEach(async function() {
        // Create 2 users before retrieving the list.
        [ johnDoe, janeDoe ] = await Promise.all([
        User.create({ firstName: 'John',  lastName: 'Doe', email: 'john.doe@email.ch', password: 'password'}),
        User.create({ firstName: 'Jane',  lastName: 'Doe', email: 'jane.doe@email.ch', password: 'password'})
        ]);
    });

    test('should retrieve the list of users', async function() {
        token = await generateValidJwt(johnDoe);
        const res = await supertest(app)
            .get('/users/')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        userID = res.body[0].id;

        expect(res.body[0].id).toEqual(janeDoe.id);
        expect(res.body[0].firstName).toEqual('Jane');
        expect(res.body[0].lastName).toEqual('Doe');
        expect(res.body[0].email).toEqual('jane.doe@email.ch');

        expect(res.body[1].id).toEqual(johnDoe.id);
        expect(res.body[1].firstName).toEqual('John');
        expect(res.body[1].lastName).toEqual('Doe');
        expect(res.body[1].email).toEqual('john.doe@email.ch');
    });

    test('should retrieve a specific user', async function() {
        token = await generateValidJwt(johnDoe);
        const res = await supertest(app)
            .get(`/users/${johnDoe.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body.id).toEqual(johnDoe.id);
        expect(res.body.firstName).toEqual('John');
        expect(res.body.lastName).toEqual('Doe');
        expect(res.body.email).toEqual('john.doe@email.ch');
    });

    test('should found nothing (invalid id)', async function() {
        token = await generateValidJwt(johnDoe);
        const res = await supertest(app)
            .get('/users/1234')
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    });

});

describe('PUT /users/:id', function() {

    test('should update a user informations', async function() {
        const res = await supertest(app)
            .put(`/users/${userID}`)
            .send({
                firstName : 'James',
                lastName: 'Do',
                email: 'james.do@email.ch'
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });

    test('should not update a user informations (invalid id)', async function() {
        const res = await supertest(app)
            .put(`/users/${userID}`)
            .send({
                firstName : 'James',
                lastName: 'Do',
                email: 'james.do@email.ch'
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});

describe('DELETE /users/:id', function() {

    test('should delete a user', async function() {
        const res = await supertest(app)
            .delete(`/users/${userID}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204);

    });


    test('should not delete a user (invalid id)', async function() {
        const res = await supertest(app)
            .delete("/users/1234")
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

    });

});

afterAll(async () => {
    await mongoose.disconnect();
});