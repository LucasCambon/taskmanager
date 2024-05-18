module.exports = (sequelize, dataTypes) => {
    let alias = 'Task';
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: dataTypes.STRING,
            allowNull: false
        },
        description: {
            type: dataTypes.TEXT,
            allowNull: true
        },
        dueDate: {
            type: dataTypes.DATE,
            allowNull: true
        },
        status: {
            type: dataTypes.ENUM('pending', 'in_progress', 'completed'),
            allowNull: false,
            defaultValue: 'pending'
        },
        notified: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        tableName: "tasks",
        timestamps: true,
        paranoid: true,
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
    const Task = sequelize.define(alias, cols, config);
    
    Task.associate = function(models) {
        Task.belongsTo(models.User, {
            foreignKey: {name: "userId", type: dataTypes.INTEGER}
        })
    }

    return Task
};