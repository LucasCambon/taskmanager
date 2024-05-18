const db = require('../../../src/database/models');

describe('BlacklistedToken Model', () => {
    
    

    test('Create a valid blacklisted token', async () => {
        const tokenData = {
            token: 'sample_token_123',
            expiryDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        };

        const blacklistedToken = await db.BlacklistedToken.create(tokenData);

        expect(blacklistedToken).toHaveProperty('id');
        expect(blacklistedToken.token).toBe(tokenData.token);
        expect(blacklistedToken.expiryDate).toEqual(tokenData.expiryDate);
    });

    test('Find a blacklisted token by token value', async () => {
        const tokenValue = 'sample_token_123';
        const blacklistedToken = await db.BlacklistedToken.findOne({ where: { token: tokenValue } });

        expect(blacklistedToken).not.toBeNull();
        expect(blacklistedToken.token).toBe(tokenValue);
    });

    test('Delete a blacklisted token', async () => {
        const tokenValue = 'sample_token_123';
        const deletedRows = await db.BlacklistedToken.destroy({ where: { token: tokenValue } });

        expect(deletedRows).toBe(1);
    });
});