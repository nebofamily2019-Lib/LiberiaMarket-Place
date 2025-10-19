const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Rating must be at least 1' },
        max: { args: [5], msg: 'Rating must be at most 5' },
        isInt: { msg: 'Rating must be a whole number' }
      }
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: { args: [0, 1000], msg: 'Review must be less than 1000 characters' }
      }
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['rater_id', 'rated_user_id'],
        name: 'unique_user_rating'
      }
    ]
  })

  return Rating
}