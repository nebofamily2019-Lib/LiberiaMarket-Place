const { Product, Category } = require('../models');

// Create product - ensure response includes success and data with category info
async function createProduct(req, res, next) {
  try {
    const payload = {
      // ...existing payload assembly ...
    }

    const product = await Product.create(payload);

    let category = null
    if (product && product.category_id) {
      category = await Category.findByPk(product.category_id)
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...(product.toJSON ? product.toJSON() : product),
        category_id: product.category_id,
        category: category ? (category.toJSON ? category.toJSON() : category) : null
      }
    })
  } catch (err) {
    next(err)
  }
}

// Get single product - ensure response shape matches tests
async function getProduct(req, res, next) {
  try {
    const id = req.params.id
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' }
      ]
    })

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    let category = product.category || null
    if (!category && product.category_id) {
      category = await Category.findByPk(product.category_id)
    }

    return res.status(200).json({
      success: true,
      data: {
        ...(product.toJSON ? product.toJSON() : product),
        category_id: product.category_id,
        category: category ? (category.toJSON ? category.toJSON() : category) : null
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
	createProduct,
	getProduct,
};