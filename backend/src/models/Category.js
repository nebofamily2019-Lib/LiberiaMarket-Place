const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
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
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-')
        }
      }
    }
  })

  return Category
}