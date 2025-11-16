const { Model, DataTypes } = require('sequelize');

class Notification extends Model {
  static init(sequelize) {
    return super.init({
      // ...existing fields...
    }, {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true
    });
  }

  static associate(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

module.exports = Notification;
