const { Product, User, Category } = require('../models')
const { Op } = require('sequelize')
const { processAndSaveImage, deleteAllImageSizes } = require('../utils/imageProcessor');
const logger = require('../utils/logger');

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

    // Build where clause
    const where = { status: req.query.status || 'active' }
    
    // Search query (full-text search on title and description)
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      where[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } }
      ];
    }

    // Category filter
    if (req.query.category_id) {
      where.category_id = req.query.category_id;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) {
        where.price[Op.gte] = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        where.price[Op.lte] = parseFloat(req.query.maxPrice);
      }
    }

    // Condition filter
    if (req.query.condition) {
      where.condition = req.query.condition;
    }

    // Location filter (exact match for now, distance-based later)
    if (req.query.location) {
      where.location = { [Op.like]: `%${req.query.location}%` };
    }

    // Sorting
    let order = [['createdAt', 'DESC']]; // Default: newest first

    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          order = [['price', 'ASC']];
          break;
        case 'price_desc':
          order = [['price', 'DESC']];
          break;
        case 'newest':
          order = [['createdAt', 'DESC']];
          break;
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'title':
          order = [['title', 'ASC']];
          break;
        default:
          order = [['createdAt', 'DESC']];
      }
    }

    // Fetch products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order,
      limit,
      offset,
      distinct: true
    });

    logger.info('Products fetched', {
      count: products.length,
      totalProducts: count,
      page,
      filters: {
        search: req.query.search,
        category: req.query.category_id,
        priceRange: [req.query.minPrice, req.query.maxPrice],
        condition: req.query.condition,
        location: req.query.location,
        sort: req.query.sort
      }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts: count,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
        limit
      },
      data: products
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
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'color']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
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
    console.error('❌ Error fetching product:', error)
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
    
    const { title, description, price, category_id, location, condition, contactPhone } = req.body

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

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      logger.info('Processing product images', { count: req.files.length });
      
      for (const file of req.files) {
        try {
          const images = await processAndSaveImage(file.buffer, file.originalname, 'products');
          // Store original size URL (thumbnail and medium are derived)
          imageUrls.push(images.original);
          
          logger.info('Image processed successfully', {
            original: file.originalname,
            url: images.original
          });
        } catch (imgError) {
          logger.error('Failed to process image', {
            error: imgError.message,
            file: file.originalname
          });
          // Continue with other images
        }
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
      images: imageUrls.length > 0 ? imageUrls : null,
      seller_id: req.user.id,
      status: 'active'
    })

    logger.info('Product created', {
      id: product.id,
      title: product.title,
      seller: req.user.id,
      imageCount: imageUrls.length
    });

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
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      })
    }

    // Delete associated images
    if (product.images && Array.isArray(product.images)) {
      logger.info('Deleting product images', {
        productId: product.id,
        imageCount: product.images.length
      });
      
      for (const imageUrl of product.images) {
        await deleteAllImageSizes(imageUrl);
      }
    }

    await product.destroy()

    logger.info('Product deleted', {
      id: product.id,
      title: product.title
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user's products
// @route   GET /api/products/user/:userId
// @access  Public
const getUserProducts = async (req, res, next) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit

    // Build where clause
    const where = { seller_id: userId }
    
    // Only show active products by default
    if (req.query.status) {
      where.status = req.query.status
    } else {
      where.status = 'active'
    }
    
    // Filter out test products (products with titles starting with "Test Product")
    where.title = { [Op.notLike]: 'Test Product%' }
    
    if (req.query.category_id) {
      where.category_id = req.query.category_id
    }

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ]
    }

    if (req.query.location) {
      where.location = { [Op.like]: `%${req.query.location}%` }
    }

    console.log('🔍 Where clause:', JSON.stringify(where, null, 2))

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts: count,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
        limit
      },
      data: products
    })
  } catch (error) {
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