module.exports = (sequelize, dataTypes) => {
    let alias = 'BlacklistedToken';
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true
        },
        expiryDate: {
            type: dataTypes.DATE,
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
        tableName: "blacklisted_tokens",
        timestamps: true,
        paranoid: true,
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
    const BlacklistedToken = sequelize.define(alias, cols, config); 

    BlacklistedToken.associate = function(models) {
        BlacklistedToken.belongsTo(models.User, {
            foreignKey: "userId"
        })
    }

    return BlacklistedToken
};