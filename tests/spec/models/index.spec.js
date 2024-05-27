const Sequelize = require('sequelize');
const path = require('path');
require('dotenv').config({ path: '.env' });

describe('Database Initialization', () => {
    let originalEnv;

    beforeAll(() => {
        // Save the original state of environment variables
        originalEnv = { ...process.env };
    }, 10000);

    afterAll(() => {
        // Restore the original state of environment variables
        process.env = originalEnv;
    }, 10000);

    beforeEach(() => {
        jest.resetModules(); // Clear the module cache before each test
    }, 10000);

    test('should create Sequelize connection using environment variable', () => {
        process.env.NODE_ENV = 'development';
        // Mock the configuration to use the environment variable
        jest.mock('../../../src/database/config/database.js', () => ({
            development: {
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                host: process.env.DB_HOST,
                dialect: 'postgres',
                port: process.env.DB_PORT,
                use_env_variable: 'DB_CONNECTION',
            },
        }));

        const db = require('../../../src/database/models'); // Import the module after setting the environment variable

        expect(db.sequelize).toBeDefined();
    });

    test('should create Sequelize connection using database config', () => {

        // Mock the configuration to use the database config directly
        jest.mock('../../../src/database/config/database.js', () => ({
            development: {
                username: 'postgres',
                password: 'admin',
                database: 'task_manager',
                host: '127.0.0.1',
                dialect: 'postgres'
            }
        }));

        const db = require('../../../src/database/models'); // Import the module after clearing the environment variable

        expect(db.sequelize).toBeDefined();
    });
});

