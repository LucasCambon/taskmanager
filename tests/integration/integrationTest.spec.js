const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/models');

describe('Integration Tests', () => {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
    }, 5000);

    afterAll(async () => {
        await db.sequelize.close();
    }, 5000);
    test('Register, Login, and Create Task', async () => {
        // Register a new user
        let response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'integrationUser',
                email: 'integrationUser@example.com',
                password: 'Integration@1234',
                phoneNumber: '+15487654'
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User registered successfully.');

        // Login the user
        response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'integrationUser',
                password: 'Integration@1234'
            });
        expect(response.status).toBe(200);
        const token = response.body.token;

        response = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        response = await request(app)
            .get('/api/tasks/1')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        // Create a new task
        const taskData = {
            title: 'Integration Task',
            description: 'This is a task created during an integration test.',
            dueDate: '2024-12-31',
            status: 'pending'
        };
        response = await request(app)
            .post('/api/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send(taskData)
            .expect(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(taskData.title);
        
        response = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
            
    });
});
