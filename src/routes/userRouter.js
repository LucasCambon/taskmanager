const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { userValidationRules } = require('../middlewares/validationRules');
const validate = require('../middlewares/dynamicValidation');

router.post('/register', validate(userValidationRules.register), userController.register);
router.post('/login', validate(userValidationRules.login), userController.login);
router.post('/logout', authMiddleware, userController.logout);

module.exports = router;