const { Product, User, Category } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all products with filters and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Build query filters
    const where = { status: 'active' };

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    // Filter by condition
    if (req.query.condition) {
      where.condition = req.query.condition;
    }

    // Filter by location
    if (req.query.location) {
      where.location = { [Op.iLike]: `%${req.query.location}%` };
    }

    // Filter by category
    if (req.query.category) {
      where.category_id = req.query.category;
    }

    // Filter by negotiable
    if (req.query.negotiable) {
      where.isNegotiable = req.query.negotiable === 'true';
    }

    // Sort options
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const order = [[sortBy, sortOrder]];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ],
      limit,
      offset,
      order,
      distinct: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      pagination: {
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar', 'created_at']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Increment view count (skip if owner is viewing)
    if (!req.user || req.user.id !== product.seller_id) {
      await product.increment('views');
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category_id,
      location,
      condition,
      isNegotiable,
      tags,
      contactPhone
    } = req.body;

    // Validate category exists
    if (!category_id) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category selected'
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Selected category is not available'
      });
    }

    // Add seller_id from authenticated user
    const productData = {
      title,
      description,
      price,
      category_id,
      location,
      condition,
      isNegotiable,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      contactPhone,
      seller_id: req.user.id,
      status: 'active'
    };

    // Handle image upload
    if (req.file) {
      // Convert file path to URL format
      // req.file.path is like: uploads/products/image-123456.jpg
      // We need it as: http://localhost:5000/uploads/products/image-123456.jpg
      const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
      productData.images = [imageUrl];
    } else {
      productData.images = [];
    }

    const product = await Product.create(productData);

    // Fetch the created product with associations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    // Validate category if being updated
    if (req.body.category_id) {
      const category = await Category.findByPk(req.body.category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category selected'
        });
      }

      if (!category.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Selected category is not available'
        });
      }
    }

    const allowedFields = [
      'title',
      'description',
      'price',
      'category_id',
      'location',
      'condition',
      'isNegotiable',
      'tags',
      'contactPhone',
      'status'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle image update if provided
    if (req.file) {
      // Convert file path to URL format
      const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
      const currentImages = product.images || [];
      updates.images = [...currentImages, imageUrl];
    }

    await product.update(updates);

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner/Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products by keyword
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res, next) => {
  try {
    const keyword = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    if (!keyword.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search keyword is required'
      });
    }

    const where = {
      status: 'active',
      [Op.or]: [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
        { location: { [Op.iLike]: `%${keyword}%` } }
      ]
    };

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      pagination: {
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category (ID or slug)
// @route   GET /api/products/category/:categoryIdOrSlug
// @access  Public
const getProductsByCategory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const { categoryIdOrSlug } = req.params;

    // Check if it's a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryIdOrSlug);

    // Find the category first
    const category = await Category.findOne({
      where: isUUID ? { id: categoryIdOrSlug } : { slug: categoryIdOrSlug }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        category_id: category.id,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon', 'color']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      pagination: {
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's products
// @route   GET /api/products/user/:userId
// @access  Public
const getUserProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const where = { seller_id: req.params.userId };

    // Only show active products to other users
    if (!req.user || req.user.id !== req.params.userId) {
      where.status = 'active';
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'location', 'avatar']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      pagination: {
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private (Owner/Admin only)
const updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'sold', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    await product.update({ status });

    res.status(200).json({
      success: true,
      message: 'Product status updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getUserProducts,
  updateProductStatus
};