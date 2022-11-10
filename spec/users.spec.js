import supertest from "supertest"
import app from "../app.js"
import mongoose from "mongoose"
import { cleanUpDatabase, generateValidJwt } from "./utils.js"
import User from "../models/user.js"

beforeEach(cleanUpDatabase);

describe('POST /users', function() {
    it('should create a user', async function() {
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
            .get('/users')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);

        userID = res.body[0].id;

        expect(res.body[0].id).toEqual(johnDoe.id);
        expect(res.body[0].firstName).toEqual('John');
        expect(res.body[0].lastName).toEqual('Doe');
        expect(res.body[0].email).toEqual('john.doe@email.ch');

        expect(res.body[1].id).toEqual(janeDoe.id);
        expect(res.body[1].firstName).toEqual('Jane');
        expect(res.body[1].lastName).toEqual('Doe');
        expect(res.body[1].email).toEqual('jane.doe@email.ch');
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

            /* expect(res.body.firstName).toEqual('James');
            expect(res.body.lastName).toEqual('Do');
            expect(res.body.email).toEqual('james.do@email.ch'); */
    });

});

describe('DELETE /users/:id', function() {

    test('should delete a user', async function() {
        const res = await supertest(app)
            .delete(`/users/${userID}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

    });
});

afterAll(async () => {
    await mongoose.disconnect();
});