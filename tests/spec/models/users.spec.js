const db = require('../../../src/database/models');

describe('User Model', () => {

    test('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'StrongPassword123@',
        phoneNumber: "+1547972344"
      };
      const newUser = await db.User.create(userData);
      expect(newUser).toBeDefined();
      expect(newUser.username).toBe(userData.username);
      expect(newUser.email).toBe(userData.email);
    });
  
    test('should not create user with missing data', async () => {
      const incompleteUserData = {
        username: 'testuser',
        // Missing email and password
      };
      try {
        const createdUser = await db.User.create(incompleteUserData);
        expect(createdUser).toThrow();
      } catch (error) {
        expect(error).toBeTruthy();
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    test('should find an existing user', async () => {
        const existingUsername = 'testuser'; // Assuming this user exists
        const foundUser = await db.User.findOne({ where: { username: existingUsername } });
        expect(foundUser).toBeDefined();
    });

    test('should not find a non-existing user', async () => {
        const nonExistingUsername = 'nonexistinguser'; // Assuming this user does not exist
        const foundUser = await db.User.findOne({ where: { username: nonExistingUsername } });
        expect(foundUser).toBeNull();
    });

    test('should update user data', async () => {
        const existingUsername = 'testuser'; // Assuming this user exists
        const updatedData = {
            email: 'newemail@example.com',
            // Other fields you want to update
        };
        const [updatedRowsCount, updatedUsers] = await db.User.update(updatedData, { where: { username: existingUsername }, returning: true });
        expect(updatedRowsCount).toBe(1); // Ensure that one user was updated
        expect(updatedUsers.length).toBe(1); // Ensure that one updated user is returned
    });

    test('should delete a user', async () => {
        const existingUsername = 'testuser'; // Assuming this user exists
        const deletedRowsCount = await db.User.destroy({ where: { username: existingUsername } });
        expect(deletedRowsCount).toBe(1); // Ensure that one user was deleted
    });
});
