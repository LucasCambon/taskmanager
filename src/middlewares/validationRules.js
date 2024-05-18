const { body } = require('express-validator');

const userValidationRules = {
    register: [
        body('username')
            .isString()
            .withMessage('Username must be a string.')
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long.'),
        body('email')
            .isEmail()
            .withMessage('Email must be valid.'),
        body('password')
            .isStrongPassword({
                minLength: 8,
                maxLength: 16,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage('Password must be between 8-16 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character.')
    ],
    login: [
        body('username')
            .notEmpty()
            .withMessage('Username is required.'),
        body('password')
            .notEmpty()
            .withMessage('Password is required.')
    ]
};

const taskValidationRules = {
    createTask: [
        body('title')
            .isString()
            .withMessage('Title must be a string.')
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long.'),
        body('description')
            .isString()
            .withMessage('Description must be a string.')
            .optional(),
        body('dueDate')
            .isISO8601()
            .toDate()
            .withMessage('Due date must be a valid date.'),
        body('status')
            .isString()
            .withMessage('Status must be a string.')
            .isIn(['pending', 'completed'])
            .withMessage('Status must be either "pending" or "completed".'),
    ],
    updateTask: [
        body('title')
            .optional()
            .isString()
            .withMessage('Title must be a string.')
            .isLength({ min: 3 })
            .withMessage('Title must be at least 3 characters long.'),
        body('description')
            .optional()
            .isString()
            .withMessage('Description must be a string.'),
        body('dueDate')
            .optional()
            .isISO8601()
            .toDate()
            .withMessage('Due date must be a valid date.'),
        body('status')
            .optional()
            .isString()
            .withMessage('Status must be a string.')
            .isIn(['pending', 'completed'])
            .withMessage('Status must be either "pending" or "completed".'),
    ]
};

module.exports = { userValidationRules, taskValidationRules };