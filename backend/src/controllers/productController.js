const { Product, User, Category } = require('../models')
const { Op } = require('sequelize')

// @desc    Get all products (with pagination & filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    console.log('📥 GET /products - Query params:', req.query)
    
    // Parse pagination with validation
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const offset = (page - 1) * limit

    console.log('📄 Pagination:', { page, limit, offset })

    // Build where clause
    const where = { status: req.query.status || 'active' }
    
    if (req.query.category_id) {
      where.category_id = req.query.category_id
    }

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ]
    }

    if (req.query.location) {
      where.location = { [Op.iLike]: `%${req.query.location}%` }
    }

    console.log('🔍 Where clause:', where)

    // Get products with associations
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'color'],
          required: false // Allow products without categories
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone'],
          required: false // Allow products without sellers (shouldn't happen, but safe)
        }
      ],
      attributes: {
        exclude: ['deletedAt'] // Don't send soft-deleted timestamp
      }
    })

    console.log(`✅ Found ${count} products, returning ${rows.length}`)

    // Format products for frontend
    const formattedProducts = rows.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      location: product.location,
      condition: product.condition,
      status: product.status,
      contactPhone: product.contactPhone,
      images: product.images || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        icon: product.category.icon,
        color: product.category.color
      } : null,
      seller: product.seller ? {
        id: product.seller.id,
        name: product.seller.name,
        phone: product.seller.phone
      } : null
    }))

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    next(error)
  }
}

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'color']
        }
      ]
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error in getProduct:', error)
    next(error)
  }
}

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    console.log('Received product creation request')
    console.log('Body:', req.body)
    console.log('User:', req.user)
    
    const { title, description, price, category_id, location, condition, contactPhone, tags, isNegotiable } = req.body

    // Use defaults if fields are missing
    const timestamp = Date.now()
    const productTitle = title || `Test Product ${timestamp}`
    const productDescription = description || 'Test description'
    const productPrice = price ? parseFloat(price) : 0
    const productLocation = location || 'Monrovia'
    const productContactPhone = contactPhone || req.user.phone || 'N/A'

    // Validate price is a valid number (allow 0 for testing)
    if (isNaN(productPrice) || productPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a valid number (0 or greater)'
      })
    }

    // Category is optional - if provided, validate it exists
    if (category_id) {
      const categoryExists = await Category.findByPk(category_id)
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category selected'
        })
      }
    }

    // Parse tags if sent as JSON string
    let parsedTags = tags
    if (typeof tags === 'string' && tags.startsWith('[')) {
      try {
        parsedTags = JSON.parse(tags)
      } catch (err) {
        console.warn('Failed to parse tags JSON, using as-is')
      }
    }

    console.log('Creating product with:', {
      title: productTitle,
      description: productDescription,
      price: productPrice,
      seller_id: req.user.id
    })

    // Create product with defaults
    const product = await Product.create({
      title: productTitle.trim ? productTitle.trim() : productTitle,
      description: productDescription.trim ? productDescription.trim() : productDescription,
      price: productPrice,
      category_id: category_id || null,
      location: productLocation.trim(),
      condition: condition || 'good',
      contactPhone: productContactPhone.trim(),
      tags: parsedTags,
      isNegotiable: isNegotiable === 'true' || isNegotiable === true,
      seller_id: req.user.id,
      status: 'active'
    })

    console.log('Product created successfully:', product.id)

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    })
  } catch (error) {
    console.error('Error creating product:', error)
    console.error('Error stack:', error.stack)
    
    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'A product with this title already exists. Please use a different title.'
      })
    }
    
    next(error)
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check if user owns the product
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      })
    }

    await product.update(req.body)

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    })
  } catch (error) {
    console.error('Error in updateProduct:', error)
    next(error)
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check if user owns the product
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      })
    }

    await product.destroy()

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error in deleteProduct:', error)
    next(error)
  }
}

// @desc    Get user's products
// @route   GET /api/products/user/:userId
// @access  Public
const getUserProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit

    const { count, rows: products } = await Product.findAndCountAll({
      where: { seller_id: req.params.userId },
      limit,
      offset,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'color']
        }
      ],
      order: [['created_at', 'DESC']] // Use snake_case column name
    })

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      data: products
    })
  } catch (error) {
    console.error('Error in getUserProducts:', error)
    next(error)
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts
}