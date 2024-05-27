const db = require('../../../src/database/models');

describe('Task Model', () => {

    let userId;

    // Set up the database before running the tests
    beforeAll(async () => {
        await db.sequelize.sync({ force: true });
        const user = await db.User.create({
            username: 'testuserTask',
            email: 'testuserTask@example.com',
            password: 'Test@1234',
            phoneNumber: '+14579514657'
        });
        userId = user.id;

    }, 5000);

    // Clean up tasks after each test
    afterEach(async () => {
        await db.Task.destroy({ where: {} });
        
    }, 5000);

    // Close the database connection after all tests are done
    afterAll(async () => {
        await db.sequelize.close();
    }, 5000);

    test('Create a valid task', async () => {
        const validTaskData = {
            title: 'Complete project report',
            description: 'Write the final report for the project.',
            dueDate: '2024-05-31',
            status: 'pending',
            userId: userId
        };

        
        const createdTask = await db.Task.create(validTaskData);
        
        expect(createdTask).toBeDefined();
        expect(createdTask.title).toBe(validTaskData.title);
    });

    test('Create a task with missing or invalid data', async () => {
        const invalidTaskData = {
            description: 'Write the final report for the project.',
            dueDate: '2024-05-31',
            status: 'pending',
            userId: userId
        };

        
        await expect(db.Task.create(invalidTaskData)).rejects.toThrow('notNull Violation: Task.title cannot be null');
    });

    test('Find Task by ID', async () => {
        const validTaskData = {
            title: 'Find me',
            description: 'Find this task by ID.',
            dueDate: '2024-05-31',
            status: 'pending',
            userId: userId
        };

        const createdTask = await db.Task.create(validTaskData);
       
        const foundTask = await db.Task.findByPk(createdTask.id);

        
        expect(foundTask).not.toBeNull();
        expect(foundTask.title).toBe(validTaskData.title);
    });

    test('Update Task', async () => {
        const validTaskData = {
            title: 'Update me',
            description: 'Update this task.',
            dueDate: '2024-05-31',
            status: 'pending',
            userId: userId
        };

        const createdTask = await db.Task.create(validTaskData);
        
        const updatedTaskData = { title: 'Updated title' };

        const [updatedRowsCount] = await db.Task.update(updatedTaskData, { where: { id: createdTask.id } });
       
        expect(updatedRowsCount).toEqual(1);

        const updatedTask = await db.Task.findByPk(createdTask.id);
        
        expect(updatedTask.title).toBe(updatedTaskData.title);
    });

    test('Delete Task', async () => {
        const validTaskData = {
            title: 'Delete me',
            description: 'Delete this task.',
            dueDate: '2024-05-31',
            status: 'pending',
            userId: userId
        };

        const createdTask = await db.Task.create(validTaskData);
        
        const deletedRowsCount = await db.Task.destroy({ where: { id: createdTask.id } });
        

        expect(deletedRowsCount).toEqual(1);

        const foundTask = await db.Task.findByPk(createdTask.id);
        
        expect(foundTask).toBeNull();
    });
});
