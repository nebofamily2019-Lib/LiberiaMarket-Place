'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Report extends Model {
    static associate(models) {
      // Reporter (User who submitted the report)
      Report.belongsTo(models.User, {
        foreignKey: 'reporter_id',
        as: 'reporter'
      });

      // Reported User (optional, if reporting a profile)
      Report.belongsTo(models.User, {
        foreignKey: 'reported_user_id',
        as: 'reportedUser'
      });

      // Reported Product (optional, if reporting an item)
      Report.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  Report.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      reporter_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reported_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      reason: {
        type: DataTypes.ENUM(
          'scam',
          'harassment',
          'inappropriate_content',
          'counterfeit',
          'other'
        ),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'investigating', 'resolved', 'dismissed'),
        defaultValue: 'pending'
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true
    }
  );

  return Report;
};
