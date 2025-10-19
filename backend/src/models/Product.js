const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product title is required' },
        len: { args: [3, 200], msg: 'Title must be between 3 and 200 characters' }
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product slug is required' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product description is required' },
        len: { args: [10, 2000], msg: 'Description must be between 10 and 2000 characters' }
      }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Category is required' }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Price must be a valid decimal number' },
        min: { args: [0], msg: 'Price must be greater than 0' }
      }
    },
    condition: {
      type: DataTypes.ENUM('new', 'like-new', 'good', 'fair', 'poor'),
      defaultValue: 'good',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'sold', 'inactive', 'pending'),
      defaultValue: 'active',
      allowNull: false
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isValidImageArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Images must be an array')
          }
          if (value.length > 10) {
            throw new Error('Maximum 10 images allowed')
          }
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Location is required' },
        len: { args: [2, 100], msg: 'Location must be between 2 and 100 characters' }
      }
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Contact phone is required' },
        isValidPhone(value) {
          // Remove spaces and non-digits
          const cleaned = value.replace(/\D/g, '');

          // Must be 9-10 digits for Liberian numbers
          if (cleaned.length < 9 || cleaned.length > 10) {
            throw new Error('Please provide a valid phone number (9-10 digits)');
          }

          // Normalize: remove leading 0 if present
          const normalized = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

          // After normalization, must be exactly 9 digits
          if (normalized.length !== 9) {
            throw new Error('Please provide a valid phone number');
          }

          // Must start with valid Liberian prefix (without leading 0)
          const validPrefixes = /^(77|76|88|86|87|55|44|33|22)/;
          if (!validPrefixes.test(normalized)) {
            throw new Error('Invalid Liberian phone number prefix');
          }
        }
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Views cannot be negative' }
      }
    },
    featuredUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isNegotiable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    specifications: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    hooks: {
      beforeValidate: (product) => {
        if (product.title && !product.slug) {
          const raw = product.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
          // trim leading/trailing hyphens
          const trimmed = raw.replace(/(^-+|-+$)/g, '')
          product.slug = `${trimmed}-${Date.now()}`
        }
      }
    },
    scopes: {
      active: {
        where: {
          status: 'active'
        }
      },
      withSeller: {
        include: [
          {
            model: sequelize.models.User,
            as: 'seller',
            attributes: ['id', 'name', 'phone', 'location', 'avatar']
          }
        ]
      },
      withCategory: {
        include: [
          {
            model: sequelize.models.Category,
            as: 'category',
            attributes: ['id', 'name', 'slug', 'icon', 'color']
          }
        ]
      }
    }
  })

  return Product
}