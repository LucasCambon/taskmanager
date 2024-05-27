const request = require('supertest');
const app = require('../../../src/app');
const db = require('../../../src/database/models'); 


describe('Validation Middleware', () => {

    let token;

    // Set up the database before running the tests
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        const user = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuserValidationMiddleware',
                email: 'testuserValidationMiddleware@example.com',
                password: 'Test@1234',
                phoneNumber: '+14579514657'
            })
        // Simulate logging in to get a token
        const response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'testuserValidationMiddleware',
                password: 'Test@1234'
            });

        token = response.body.token;
    }, 5000);
    // Clean up tasks after each test
    afterEach(async () => {
        await db.Task.destroy({ where: {} });
        await db.User.destroy({ where: {} });
    }, 5000);

    // Close the database connection after all tests are done
    afterAll(async () => {
        await db.sequelize.close();
    }, 5000);

    test('should return 400 if username is missing or invalid in registration', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                email: 'user@example.com',
                password: 'Password123!',
                phoneNumber: '+154598724'
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Username must be a string.' }),
                expect.objectContaining({ msg: 'Username must be at least 3 characters long.' })
            ])
        );
    });

    test('should return 400 if email is invalid in registration', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'username',
                email: 'invalid-email',
                password: 'Password123!',
                phoneNumber: '+154598724'
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Email must be valid.' })
            ])
        );
    });

    test('should return 400 if password is weak in registration', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'username',
                email: 'user@example.com',
                password: 'weakpass',
                phoneNumber: '+154598724'
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Password must be between 8-16 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.' })
            ])
        );
    });

    test('should return 400 if title is missing or invalid in task creation', async () => {
        const response = await request(app)
            .post('/api/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'Task description',
                dueDate: '2024-05-31',
                status: 'pending'
            })
            .expect('Content-Type', /json/)
            .expect(400);   

        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Title must be a string.' }),
                expect.objectContaining({ msg: 'Title must be at least 3 characters long.' })
            ])
        );
    });

    test('should return 200 if valid task is created', async () => {
        const taskData = {
            title: 'Valid Task Title',
            description: 'Task description',
            dueDate: '2024-05-31',
            status: 'pending'
        }
        const response = await request(app)
            .post('/api/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send(taskData)
            .expect('Content-Type', /json/)
            .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe(taskData.title);
    });

});
