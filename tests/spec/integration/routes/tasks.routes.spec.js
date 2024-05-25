const request = require('supertest');
const app = require('../../../../src/app'); // Asegúrate de que este sea el path correcto a tu archivo principal de la aplicación
const db = require('../../../../src/database/models');

describe('Tasks Routes', () => {
    let token;

    // Set up the database before running the tests
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        const user = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuserRoute',
                email: 'testuserRoute@example.com',
                password: 'Test@1234',
                phoneNumber: '+14579514657'
            })
        // Simulate logging in to get a token
        const response = await request(app)
            .post('/api/users/login')
            .send({
                username: 'testuserRoute',
                password: 'Test@1234'
            });

        token = response.body.token;
    });

    // Clean up tasks after each test
    afterEach(async () => {
        await db.Task.destroy({ where: {} });
    });

    // Close the database connection after all tests are done
    afterAll(async () => {
        await db.sequelize.close();
    });

    test('GET /api/tasks - should return an empty array initially', async () => {
        const response = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(404);
        expect(response.body).toEqual({ message: 'No tasks found.' });
    });

    test('POST /api/tasks/create - should create a new task', async () => {
        const taskData = {
            title: 'New Task',
            description: 'This is a new task',
            dueDate: '2024-05-31',
            status: 'pending', 
        };
        const response = await request(app)
            .post('/api/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send(taskData)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(taskData.title);
    });

    test('GET /api/tasks/:id - should return a task by ID', async () => {
        const task = {
            title: 'Find me',
            description: 'Find this task by ID.',
            dueDate: '2024-05-31',
            status: 'pending',
        }
        const responseCreate = await request(app)
            .post('/api/tasks/create')
            .set('Authorization', `Bearer ${token}`)
            .send(task)
            .expect('Content-Type', /json/)
            .expect(201);
        const response = await request(app)
            .get(`/api/tasks/${responseCreate.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body.id).toBe(responseCreate.body.id);
        expect(response.body.title).toBe(responseCreate.body.title);
    });

    test('PUT /api/tasks/edit/:id - should update a task by ID', async () => {
        const task = await db.Task.create({
            title: 'Update me',
            description: 'Update this task.',
            dueDate: '2024-05-31',
            status: 'pending',
        });
        const updatedTaskData = { title: 'Updated title' };
        const response404 = await request(app)
            .put(`/api/tasks/edit/${task.id+1}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTaskData)
            .expect('Content-Type', /json/)
            .expect(404);
        expect(response404.body).toEqual({ message: 'Task not found with the provided ID.' });
        const response = await request(app)
            .put(`/api/tasks/edit/${task.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTaskData)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual({ message: 'Task updated successfully.' });
    });

    test('DELETE /api/tasks/delete/:id - should delete a task by ID', async () => {
        const task = await db.Task.create({
            title: 'Delete me',
            description: 'Delete this task.',
            dueDate: '2024-05-31',
            status: 'pending',
        });
        const response404 = await request(app)
            .delete(`/api/tasks/delete/${task.id+10}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        expect(response404.body).toEqual({ message: 'Task not found with the provided ID.'  });

        await request(app)
            .delete(`/api/tasks/delete/${task.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const foundTask = await db.Task.findByPk(task.id);
        expect(foundTask).toBeNull();
    });

    describe('Task Controller 500 error', () => {

        let token;
        let idTask;
        beforeAll(async () => {
            // Register and login a user to get a token
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'testuserTaskerror',
                    email: 'testuserTaskerror@example.com',
                    password: 'Test@1234',
                    phoneNumber: '+14579514657'
                });

            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({
                    username: 'testuserTaskerror',
                    password: 'Test@1234'
                });
            
            token = loginResponse.body.token;

            const taskData = {
                title: 'New Task',
                description: 'This is a new task',
                dueDate: '2024-05-31',
                status: 'pending', 
            };
            const response = await request(app)
                .post('/api/tasks/create')
                .set('Authorization', `Bearer ${token}`)
                .send(taskData)
                .expect('Content-Type', /json/)
                .expect(201);
            idTask = response.body.id
        });
        
        test('should handle error 500 in get tasks', async () => {
            jest.spyOn(db.Task, 'findAll').mockImplementation(() => {
                throw new Error('Error getting tasks. Please try again later.');
            });
            // Mock the post function of /api/tasks route to return a 500 error
            app.get('/api/tasks', (req, res) => {
                res.status(500).json({ message: 'Error getting tasks. Please try again later.' });
            });
    
            // Make a request to /api/tasks route
            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${token}`);
            // Verify the response has the expected status code and message
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error getting tasks. Please try again later.' });
        });

        test('should handle error 500 in get task by id', async () => {
            jest.spyOn(db.Task, 'findOne').mockImplementation(() => {
                throw new Error('Error getting task. Please try again later.');
            });
            // Mock the post function of /api/tasks/:id route to return a 500 error
            app.post(`/api/tasks/${idTask}`, (req, res) => {
                res.status(500).json({ message: 'Error getting task. Please try again later.' });
            });
    
            const response = await request(app)
                .get(`/api/tasks/${idTask}`)
                .set('Authorization', `Bearer ${token}`);
            // Verify the response has the expected status code and message
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error getting task. Please try again later.' });
        });

        test('should handle error 500 in create task', async () => {
            jest.spyOn(db.Task, 'create').mockImplementation(() => {
                throw new Error('Error creating task. Please try again later.');
            });
            // Mock the post function of /api/users/register route to return a 500 error
            app.post('/api/tasks/create', (req, res) => {
                res.status(500).json({ message: 'Error creating task. Please try again later.' });
            });
            const response = await request(app)
                .post('/api/tasks/create')
                .send({
                    title: 'New Task',
                    description: 'This is a new task',
                    dueDate: '2024-05-31',
                    status: 'pending', 
                })
                .set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Error creating task. Please try again later.' });
        });

        test('should handle error 500 in update task', async () => {
            jest.spyOn(db.Task, 'findByPk').mockImplementation(() => {
                throw new Error('Error updating task. Please try again later.');
            });
            // Mock the post function of /api/users/register route to return a 500 error
            app.put(`/api/tasks/edit/${idTask}`, (req, res) => {
                res.status(500).json({ message: 'Error updating task. Please try again later.' });
            });
            const response = await request(app)
                .put(`/api/tasks/edit/${idTask}`)
                .send({
                    title: 'New Task',
                    description: 'This is a new task',
                    dueDate: '2024-05-31',
                    status: 'pending', 
                })
                .set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Error updating task. Please try again later.' });
        });

        test('should handle error 500 in delete task', async () => {
            jest.spyOn(db.Task, 'findByPk').mockImplementation(() => {
                throw new Error('Error deleting task. Please try again later.');
            });
            // Mock the post function of /api/users/register route to return a 500 error
            app.delete(`/api/tasks/delete/${idTask}`, (req, res) => {
                res.status(500).json({ message: 'Error deleting task. Please try again later.' });
            });
            const response = await request(app)
                .delete(`/api/tasks/delete/${idTask}`)
                .set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Error deleting task. Please try again later.' });
        });
        
    });
});