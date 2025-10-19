const { sequelize } = require('../config/database')
const UserModel = require('./User')
const CategoryModel = require('./Category')
const ProductModel = require('./Product')
const RatingModel = require('./Rating')

// Initialize models
const User = UserModel(sequelize)
const Category = CategoryModel(sequelize)
const Product = ProductModel(sequelize)
const Rating = RatingModel(sequelize)

// Define associations
// User associations
User.hasMany(Product, {
  foreignKey: 'seller_id',
  as: 'products',
  onDelete: 'CASCADE'
})

User.hasMany(Rating, {
  foreignKey: 'rater_id',
  as: 'givenRatings',
  onDelete: 'CASCADE'
})

User.hasMany(Rating, {
  foreignKey: 'rated_user_id',
  as: 'receivedRatings',
  onDelete: 'CASCADE'
})

// Product associations
Product.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
})

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
})

// Category associations
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
  onDelete: 'SET NULL'
})

// Rating associations
Rating.belongsTo(User, {
  foreignKey: 'rater_id',
  as: 'rater'
})

Rating.belongsTo(User, {
  foreignKey: 'rated_user_id',
  as: 'ratedUser'
})

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Rating
}