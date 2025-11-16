const { Model, DataTypes } = require('sequelize');

class Message extends Model {
  static init(sequelize) {
    return super.init({
      // ...existing fields...
    }, {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      timestamps: true
    });
  }

  static associate(models) {
    Message.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    Message.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  }
}

module.exports = Message;
