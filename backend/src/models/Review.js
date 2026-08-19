'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Review extends Model {
    static associate(models) {
      // Review belongs to reviewer (User)
      Review.belongsTo(models.User, {
        foreignKey: 'reviewer_id',
        as: 'reviewer'
      });

      // Review belongs to reviewee (User)
      Review.belongsTo(models.User, {
        foreignKey: 'reviewee_id',
        as: 'reviewee'
      });

      // Review belongs to Product
      Review.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });

      // Review belongs to Offer
      Review.belongsTo(models.Offer, {
        foreignKey: 'offer_id',
        as: 'offer'
      });
    }
  }

  Review.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      reviewer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reviewee_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      offer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'offers',
          key: 'id'
        }
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      review_type: {
        type: DataTypes.ENUM('seller', 'buyer', 'product'),
        allowNull: false,
        defaultValue: 'seller'
      },
      is_verified_purchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      helpful_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Seller response to review'
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      moderation_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved'
      },
      moderation_notes: {
        type: DataTypes.TEXT,
        allowNull: true
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
      modelName: 'Review',
      tableName: 'reviews',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['reviewer_id']
        },
        {
          fields: ['reviewee_id']
        },
        {
          fields: ['product_id']
        },
        {
          fields: ['offer_id']
        },
        {
          fields: ['rating']
        },
        {
          fields: ['review_type']
        },
        {
          fields: ['is_visible']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );

  return Review;
};
