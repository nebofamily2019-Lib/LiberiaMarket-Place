const { Product, User, Category, UserActivity } = require('../models')
const { Op } = require('sequelize')
const { processAndSaveImage, deleteAllImageSizes } = require('../utils/imageProcessor');
const logger = require('../utils/logger');
const { calculatePlatformFee } = require('../utils/platformFee');

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

      // Log search activity
      if (req.user) {
        UserActivity.create({
          user_id: req.user.id,
          activity_type: 'search',
          details: { query: searchTerm }
        }).catch(err => console.error('Error logging search:', err));
      }
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

    // Location filter (Radius search if coords provided, else text search)
    if (req.query.latitude && req.query.longitude) {
      const lat = parseFloat(req.query.latitude);
      const lon = parseFloat(req.query.longitude);
      const radius = parseFloat(req.query.radius) || 10; // Default 10km

      // 1 degree approx 111km
      const deltaLat = radius / 111;
      // Adjust longitude delta based on latitude (approximate)
      const deltaLon = radius / (111 * Math.cos(lat * (Math.PI / 180)));

      where.latitude = {
        [Op.between]: [lat - deltaLat, lat + deltaLat]
      };
      where.longitude = {
        [Op.between]: [lon - deltaLon, lon + deltaLon]
      };
    } else if (req.query.location) {
      where.location = { [Op.like]: `%${req.query.location}%` };
    }

    // Sorting
    let order = [['created_at', 'DESC']]; // Default: newest first

    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          order = [['price', 'ASC']];
          break;
        case 'price_desc':
          order = [['price', 'DESC']];
          break;
        case 'newest':
          order = [['created_at', 'DESC']];
          break;
        case 'oldest':
          order = [['created_at', 'ASC']];
          break;
        case 'title':
          order = [['title', 'ASC']];
          break;
        default:
          order = [['created_at', 'DESC']];
      }
    }

    // Fetch products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color', 'slug']
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
        page: page,
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
    console.log('🔍 Fetching product:', req.params.id); // Debug log
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
          attributes: ['id', 'name', 'phone', 'avg_rating', 'total_reviews', 'is_verified']
        }
      ]
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Track detailed view analytics (asynchronously, don't wait for it)
    try {
      const { trackProductView } = require('./analyticsController');
      const userId = req.user ? req.user.id : null;
      trackProductView(req.params.id, userId, req).catch(err => {
        console.error('Error tracking product view:', err);
      });
    } catch (err) {
      console.warn('Analytics controller not found or failed:', err.message);
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
    const { title, description, price, currency, category_id, location, latitude, longitude, condition, contactPhone } = req.body

    // Use defaults if fields are missing
    const timestamp = Date.now()
    const productTitle = title || `Test Product ${timestamp}`
    const productDescription = description || 'Test description'
    const productPrice = price ? parseFloat(price) : 0
    const productCurrency = currency || 'USD'
    const productLocation = location || 'Monrovia'
    const productContactPhone = contactPhone || req.user.phone || 'N/A'
    const productLat = latitude ? parseFloat(latitude) : null
    const productLon = longitude ? parseFloat(longitude) : null

    // Validate price is a valid number (allow 0 for testing)
    if (isNaN(productPrice) || productPrice < 0) {
      console.log('❌ Invalid price:', productPrice, 'Original:', price); // Debug log
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

    // Create product with defaults
    const product = await Product.create({
      title: productTitle.trim ? productTitle.trim() : productTitle,
      description: productDescription.trim ? productDescription.trim() : productDescription,
      price: productPrice,
      currency: productCurrency,
      category_id: category_id || null,
      location: productLocation.trim ? productLocation.trim() : productLocation,
      latitude: productLat,
      longitude: productLon,
      condition: condition || 'good',
      contactPhone: productContactPhone.trim ? productContactPhone.trim() : productContactPhone,
      images: imageUrls.length > 0 ? imageUrls : null,
      seller_id: req.user.id,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    })

    logger.info('Product created', {
      id: product.id,
      seller_id: req.user.id
    })

    // Log activity
    await UserActivity.create({
      user_id: req.user.id,
      activity_type: 'listed_product',
      entity_id: product.id,
      details: { title: product.title, price: product.price }
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

    // Handle image updates
    let finalImages = []

    // Parse existing images from request
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages)
        if (Array.isArray(existingImages)) {
          finalImages = existingImages
        }
      } catch (e) {
        logger.warn('Failed to parse existingImages', { error: e.message })
      }
    }

    // Process newly uploaded images
    if (req.files && req.files.length > 0) {
      logger.info('Processing new product images', { count: req.files.length })

      for (const file of req.files) {
        try {
          const images = await processAndSaveImage(file.buffer, file.originalname, 'products')
          finalImages.push(images.original)

          logger.info('Image processed successfully', {
            original: file.originalname,
            url: images.original
          })
        } catch (imgError) {
          logger.error('Failed to process image', {
            error: imgError.message,
            file: file.originalname
          })
        }
      }
    }

    // Update product with new data
    const updateData = {
      ...req.body,
      images: finalImages.length > 0 ? finalImages : null
    }

    // Remove existingImages from update data (it's not a product field)
    delete updateData.existingImages

    await product.update(updateData)

    logger.info('Product updated', {
      id: product.id,
      imageCount: finalImages.length
    })

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

    // Check if the requester is the owner
    const isOwner = req.user && req.user.id === userId

    // Show all products to owner, only active products to others
    if (req.query.status) {
      where.status = req.query.status
    } else if (!isOwner) {
      // Only filter to active if NOT the owner
      where.status = 'active'
    }
    // If isOwner is true and no status specified, show all statuses

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

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    res.status(200).json({
      success: true,
      count,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark product as sold
// @route   POST /api/products/:id/sold
// @access  Private (Seller)
const markAsSold = async (req, res, next) => {
  try {
    const { soldPrice, buyerId, paymentMethod } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const finalSoldPrice = soldPrice || product.price;
    const { fee: platformFee, netPayout } = calculatePlatformFee(finalSoldPrice);

    // Update product
    await product.update({
      status: 'sold',
      sold_at: new Date(),
      sold_price: finalSoldPrice,
      buyer_id: buyerId || null,
      payment_method: paymentMethod || null
    });

    // If cash transaction, we could log it to a Payment/Transaction table here
    // For now, the Product update is sufficient for the dashboard

    // Log activity (best-effort — don't fail the sale if logging breaks)
    try {
      await UserActivity.create({
        user_id: req.user.id,
        activity_type: 'sold_product',
        entity_id: product.id,
        details: { sold_price: finalSoldPrice, platform_fee: platformFee, net_payout: netPayout }
      });
    } catch (logErr) {
      logger.warn('Failed to log sold_product activity:', logErr.message);
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product marked as sold'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller dashboard stats
// @route   GET /api/products/stats/seller
// @access  Private (Seller)
const getSellerStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // 1. Total Sales (Revenue)
    const soldProducts = await Product.findAll({
      where: {
        seller_id: sellerId,
        status: 'sold'
      },
      attributes: ['sold_price', 'sold_at']
    });

    const totalRevenue = soldProducts.reduce((sum, p) => sum + (parseFloat(p.sold_price) || 0), 0);
    const totalItemsSold = soldProducts.length;
    const { fee: totalPlatformFees, netPayout: netRevenue } = calculatePlatformFee(totalRevenue);

    // 2. Active Listings
    const activeCount = await Product.count({
      where: {
        seller_id: sellerId,
        status: 'active'
      }
    });

    // 3. Recent Sales (Last 5)
    const recentSales = await Product.findAll({
      where: {
        seller_id: sellerId,
        status: 'sold'
      },
      attributes: ['id', 'title', 'price', 'sold_price', 'sold_at', 'images'],
      order: [['sold_at', 'DESC']],
      limit: 5,
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });

    // Attach the per-sale fee/payout breakdown so the UI doesn't have to recompute it
    const recentSalesWithPayout = recentSales.map((sale) => {
      const { fee, netPayout } = calculatePlatformFee(sale.sold_price);
      return { ...sale.toJSON(), platform_fee: fee, net_payout: netPayout };
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalPlatformFees,
        netRevenue,
        totalItemsSold,
        activeListings: activeCount,
        recentSales: recentSalesWithPayout
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew a product listing
// @route   POST /api/products/:id/renew
// @access  Private (Seller only)
const renewProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to renew this product'
      })
    }

    // Extend expiration by 30 days from NOW
    const newExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await product.update({
      expiresAt: newExpiration,
      status: 'active', // Reactivate if it was expired
      updatedAt: new Date() // Bump to top
    })

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product renewed successfully for 30 days'
    })
  } catch (err) {
    console.error('Error renewing product:', err)
    res.status(500).json({
      success: false,
      error: 'Server Error'
    })
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  markAsSold,
  getSellerStats,
  renewProduct
}