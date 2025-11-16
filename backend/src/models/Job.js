const { Model, DataTypes } = require('sequelize');

class Job extends Model {
  static init(sequelize) {
    return super.init({
      // ...existing fields...
    }, {
      sequelize,
      modelName: 'Job',
      tableName: 'jobs',
      timestamps: true,
      paranoid: true
    });
  }

  static associate(models) {
    Job.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

module.exports = Job;
