const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Category extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Category name already exists'
        },
        validate: {
          notEmpty: { msg: 'Category name is required' },
          len: { args: [2, 50], msg: 'Category name must be between 2 and 50 characters' }
        }
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Category slug already exists'
        },
        validate: {
          notEmpty: { msg: 'Category slug is required' },
          is: {
            args: /^[a-z0-9-]+$/,
            msg: 'Slug must contain only lowercase letters, numbers, and hyphens'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: { args: [0, 100], msg: 'Icon name must be less than 100 characters' }
        }
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: {
            args: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            msg: 'Color must be a valid hex color code'
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'sort_order'
      }
    }, {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        // Unique slug for URL-based lookup
        // Name for search/autocomplete
        // Active category filtering
        {
          name: 'idx_categories_is_active',
          fields: ['is_active']
        },
        // Sort order for display
        {
          name: 'idx_categories_sort_order',
          fields: ['sort_order']
        },
        // Composite: Active categories sorted
        // Removed idx_categories_active_sorted to prevent duplicate index creation crash
      ],
      hooks: {
        beforeValidate: (category) => {
          if (category.name && !category.slug) {
            category.slug = category.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
          }
        }
      }
    });
  }

  static associate(models) {
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products'
    });
  }
}

module.exports = Category;