const request = require('supertest');
const db = require('../../../../src/database/models');
const app = require('../../../../src/app');

describe('User Routes', () => {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    describe('POST /api/users/register', () => {
        test('should register a new user with valid data', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'Test@1234',
                    phoneNumber: '+14579514657'
                })
                .expect(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.username).toBe('testuser');
        });

        test('should not register a user with invalid data', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'invalidemail',
                    password: 'short',
                })
                .expect(400);
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/users/login', () => {
        test('should log in with correct credentials', async () => {
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser2',
                    password: 'Test@1234',
                    email: 'testuser2@example.com',
                    phoneNumber: '+14579514657'
                });

            const response = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuser2',
                    password: 'Test@1234'
                })
                .expect(200);
            
            expect(response.body).toHaveProperty('token');
            token = response.body.token;
        });

        test('should not log in with incorrect credentials', async () => {
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuser2@qwe',
                    //username: 'testuser2'
                    password: 'wrongpassword'
                })
                switch(response.status) {
                    case 401:
                        expect(response.body).toHaveProperty('message', 'Invalid credentials.');
                        break;
                    case 404:
                        expect(response.body).toHaveProperty('message', 'User not found.');
                        break;
                    case 500:
                        expect(response.body).toHaveProperty('message', 'Error logging in. Please try again later.');
                        break;
                    default:
                        throw new Error(`Unexpected status code: ${response.status}`);
                }
        });
    });

    describe('POST /api/users/logout', () => {
        let token;

        beforeAll(async () => {
            // Register and login a user to get a token
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser3',
                    email: 'testuser3@example.com',
                    password: 'Test@1234',
                    phoneNumber: '+14579514657'
                });

            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuser3',
                    password: 'Test@1234'
                });
            
            token = loginResponse.body.token;
        });

        test('should log out a logged-in user', async () => {
            const response = await request(app)
                .post('/api/users/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'User successfully logged out.');
        });

        test('should not log out without a valid token', async () => {
            const response = await request(app)
                .post('/api/users/logout')
                .expect(401);

            expect(response.body).toHaveProperty('message');
        });
    });
});
