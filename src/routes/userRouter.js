const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { userValidationRules } = require('../middlewares/validationRules');
const validate = require('../middlewares/dynamicValidation');

router.post('/register', validate(userValidationRules.register), userController.register);
router.post('/login', validate(userValidationRules.login), userController.login);

module.exports = router;