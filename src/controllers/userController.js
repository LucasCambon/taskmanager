const db = require("../database/models");
const sequelize = db.sequelize;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    const t = await db.sequelize.transaction(); // Start transaction

    try {
      const { username, email, password } = req.body;

      // Check if the username or email already exists in the database
      const existingUser = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }],
        },
        transaction: t, // Associate transaction
      });

      if (existingUser) {
        await t.rollback(); // Rollback in case of error
        return res.status(400).json({ message: 'The username or email is already in use.' });
      }

      // Create a hash of the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user
      const newUser = await db.User.create({
        username,
        email,
        password: hashedPassword,
      }, { transaction: t }); // Associate transaction

      await t.commit(); // Commit the transaction

      res.status(201).json({ message: 'User registered successfully.', user: newUser });
    } catch (error) {
      console.error('Error registering user:', error);
      await t.rollback(); // Rollback in case of error
      res.status(500).json({ message: 'Error registering user. Please try again later.' });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find the user in the database
      const user = await db.User.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      // Generate authentication token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in. Please try again later.' });
    }
  },
};

module.exports = userController;