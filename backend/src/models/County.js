'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class County extends Model {
    static associate(models) {
      // County has many users
      County.hasMany(models.User, {
        foreignKey: 'county_id',
        as: 'users'
      });

      // County has many products
      County.hasMany(models.Product, {
        foreignKey: 'county_id',
        as: 'products'
      });
    }
  }

  County.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
      },
      capital: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      population: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      coordinates: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '{ lat: number, lng: number }'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'County',
      tableName: 'counties',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return County;
};
