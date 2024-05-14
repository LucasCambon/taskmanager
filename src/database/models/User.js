module.exports = (sequelize, dataTypes) => {
    let alias = 'User';
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: dataTypes.STRING,
            allowNull: false
        },
        deletedAt: {
            type: dataTypes.DATE
        },
        createdAt: {
            type: dataTypes.DATE
        },
        updatedAt: {
            type: dataTypes.DATE
        }
    };
    let config = {
        tableName: "users",
        timestamps: true,
        paranoid: true,
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
    const User = sequelize.define(alias, cols, config); 

    User.associate = function(models) {
        User.hasMany(models.Task, {
            as: "tasks",
            foreignKey: "userId"
        })
    }

    return User
};