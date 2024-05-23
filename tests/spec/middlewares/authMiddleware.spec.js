const jwt = require('jsonwebtoken');
const db = require('../../../src/database/models');
const authenticateToken = require('../../../src/middlewares/authMiddleware');

describe('Auth Middleware', () => {

    let token;
    let user;

    beforeAll(async () => {
        await db.sequelize.sync({ force: true });

        user = await db.User.create({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'Test@1234',
            phoneNumber: '+14579514657'
        });

        token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    test('should call next if token is valid', async () => {
        const req = {
            header: jest.fn().mockReturnValue(`Bearer ${token}`)
        };
        const res = {};
        const next = jest.fn();

        await authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('should return 401 if no token is provided', async () => {
        const req = {
            header: jest.fn().mockReturnValue(null)
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
    });

    test('should return 401 if token is invalid', async () => {
        const req = {
            header: jest.fn().mockReturnValue('Bearer invalidtoken')
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token. Please log in again.' });
    });

    test('should return 401 if token is blacklisted', async () => {
        // Add the token to the blacklist
        const decoded = jwt.decode(token);
        const expiryDate = new Date(decoded.exp * 1000);
        await db.BlacklistedToken.create({ token, expiryDate, userId: user.id });
        const req = {
            header: jest.fn().mockReturnValue(`Bearer ${token}`)
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        await authenticateToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token. Please log in again.' });
    });
});