const { Category, Product } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query
    
    // Build query conditions
    const whereClause = {}
    
    // Only show active categories unless admin requests inactive
    if (!includeInactive || (req.user && req.user.role !== 'admin')) {
      whereClause.isActive = true
    }
    
    const categories = await Category.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      attributes: {
        include: [
          [
            // Count active products in each category
            require('sequelize').literal(`(
              SELECT COUNT(*)
              FROM "Products" AS product
              WHERE product.category_id = "Category".id
              AND product.status = 'active'
            )`),
            'productCount'
          ]
        ]
      }
    });
    
    console.log(`Found ${categories.length} categories`) // Debug log
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error in getCategories:', error)
    next(error);
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:idOrSlug
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    // Try to find by ID first (UUID format), then by slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const category = await Category.findOne({
      where: isUUID ? { id: idOrSlug } : { slug: idOrSlug },
      attributes: {
        include: [
          [
            // Count active products
            require('sequelize').literal(`(
              SELECT COUNT(*)
              FROM "Products" AS product
              WHERE product.category_id = "Category".id
              AND product.status = 'active'
            )`),
            'productCount'
          ]
        ]
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category is active (unless admin)
    if (!category.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, slug, sortOrder, isActive } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      icon,
      color,
      slug,
      sortOrder: sortOrder !== undefined ? sortOrder : 0,
      isActive: isActive !== undefined ? isActive : true
    })

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    })
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message)
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      })
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'A category with this name or slug already exists'
      })
    }

    console.error('Error creating category:', error)
    next(error)
  }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const allowedFields = ['name', 'description', 'icon', 'color', 'isActive', 'sortOrder'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If name is being updated, check for duplicates
    if (updates.name && updates.name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name: updates.name }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }

    await category.update(updates);

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    })
  } catch (error) {
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message)
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      })
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'A category with this name or slug already exists'
      })
    }

    console.error('Error updating category:', error)
    next(error)
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { category_id: req.params.id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category with ${productCount} products. Please reassign or delete the products first.`
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};