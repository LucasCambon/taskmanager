const request = require('supertest');
const db = require('../../../../src/database/models');
const userController = require('../../../../src/controllers/userController');
const app = require('../../../../src/app');

describe('User Routes', () => {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true }); // Sync the database before all tests
        // Loop through and register users
        for (let i = 1; i <= 3; i++) {
            const username = `testloginuser${i}`; // Generate username
            const email = `testloginuser${i}@example.com`; // Generate email
            const password = 'Test@1234'; // Set common password
            const phoneNumber = `+1457951465${i}`; // Generate phone number

            // Register the user
            await request(app)
                .post('/api/users/register')
                .send({
                    username,
                    email,
                    password,
                    phoneNumber
                });
        }
    }, 10000);

    afterAll(async () => {
        await db.sequelize.close();
    }, 10000);

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

        test('should not register an existing user (username/email)', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'Test@1234',
                    phoneNumber: '+14579514657'
                })
                .expect(400);
                expect(response.body).toHaveProperty('message', 'The username or email is already in use.');
        });
    });

    describe('POST /api/users/login', () => {

        test.each([
            ['testloginuser1', 'Test@1234', 200], // Correct credentials
            ['testloginuser2', 'WrongPassword', 401], // Incorrect password
            ['nonexistentuser@example.com', 'Test@1234', 404], // User does not exist
        ])('should log in with %s and %s', async (username, password, expectedStatusCode) => {
            const response = await request(app)
                .post('/api/users/login')
                .send({ username, password });

            expect(response.status).toBe(expectedStatusCode);
            
            // Additional assertions can be added based on the expectedStatusCode
            switch (expectedStatusCode) {
                case 200:
                    expect(response.body).toHaveProperty('token');
                    break;
                case 401:
                    expect(response.body).toHaveProperty('message', 'Invalid credentials.');
                    break;
                case 404:
                    expect(response.body).toHaveProperty('message', 'User not found.');
                    break;
                default:
                    throw new Error(`Unexpected status code: ${expectedStatusCode}`);
            }
        });

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
    describe('User Controller 500 error', () => {

        let token;

        beforeAll(async () => {
            // Register and login a user to get a token
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuserLogouterror',
                    email: 'testuserLogouterror@example.com',
                    password: 'Test@1234',
                    phoneNumber: '+14579514657'
                });

            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuserLogouterror',
                    password: 'Test@1234'
                });
            
            token = loginResponse.body.token;
        });
        
        test('should handle error 500 in register route', async () => {
            jest.spyOn(db.User, 'findOne').mockImplementation(() => {
                throw new Error('Internal Server Error');
            });
            // Mock the post function of /api/users/register route to return a 500 error
            app.post('/api/users/register', (req, res) => {
                res.status(500).json({ message: 'Internal Server Error' });
            });
    
            // Make a request to /api/users/register route
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuser500error',
                    email: 'testuser500error@example.com',
                    password: 'Test@1234',
                    phoneNumber: '+14579514657'
                });
    
            // Verify the response has the expected status code and message
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error registering user. Please try again later.' });
        });

        test('should handle error 500 in login route', async () => {
            jest.spyOn(db.User, 'findOne').mockImplementation(() => {
                throw new Error('Internal Server Error');
            });
            // Mock the post function of /api/users/login route to return a 500 error
            app.post('/api/users/login', (req, res) => {
                res.status(500).json({ message: 'Internal Server Error' });
            });
    
            const response = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuser500error',
                    password: 'Test@1234',
                });
    
            // Verify the response has the expected status code and message
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error logging in. Please try again later.' });
        });

        test('should handle error 500 in logout route', async () => {
            jest.spyOn(db.BlacklistedToken, 'create').mockImplementation(() => {
                throw new Error('Internal Server Error');
            });
            // Mock the post function of /api/users/register route to return a 500 error
            app.post('/api/users/logout', (req, res) => {
                res.status(500).json({ message: 'Internal Server Error' });
            });
            const response = await request(app)
                .post('/api/users/logout')
                .set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Logout failed. Please try again later.' });
        });
    });
});
