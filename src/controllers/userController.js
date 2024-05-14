const db = require("../database/models");
const sequelize = db.sequelize;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    const t = await db.sequelize.transaction(); // Iniciar transacción

    try {
      const { username, email, password } = req.body;

      // Verificar si el usuario o el correo ya existen en la base de datos
      const existingUser = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }],
        },
        transaction: t, // Asociar transacción
      });

      if (existingUser) {
        await t.rollback(); // Rollback en caso de error
        return res.status(400).json({ message: 'El usuario o el correo electrónico ya están en uso.' });
      }

      // Crear un hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el nuevo usuario
      const newUser = await db.User.create({
        username,
        email,
        password: hashedPassword,
      }, { transaction: t }); // Asociar transacción

      await t.commit(); // Commit de la transacción

      res.status(201).json({ message: 'Usuario registrado exitosamente.', user: newUser });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      await t.rollback(); // Rollback en caso de error
      res.status(500).json({ message: 'Error al registrar usuario. Por favor, inténtelo de nuevo más tarde.' });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Buscar el usuario en la base de datos
      const user = await db.User.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }

      // Generar token de autenticación
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'Inicio de sesión exitoso.', token });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.' });
    }
  },
};

module.exports = userController;