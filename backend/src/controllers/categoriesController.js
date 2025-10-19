const { Category, Product } = require('../models')

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    // ...existing query building (filters, includeInactive, pagination) ...

    const includeInactive = req.query.includeInactive === 'true' && req.user && req.user.role === 'admin'
    const where = includeInactive ? {} : { isActive: true }

    const categories = await Category.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      // ...any includes...
    })

    // attach productCount for each (avoid N+1 if your DB supports a join/count; this is simple fallback)
    const data = await Promise.all(categories.map(async (c) => {
      const count = await Product.count({ where: { category_id: c.id } })
      return {
        ...(c.toJSON ? c.toJSON() : c),
        productCount: count
      }
    }))

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/categories/:id
async function getCategory(req, res, next) {
  try {
    const id = req.params.id
    // Accept id or slug if you implemented slug support elsewhere
    const category = await Category.findOne({
      where: { id } // modify to handle slug if needed
    })

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    // Respect isActive for non-admins
    if (!category.isActive && !(req.user && req.user.role === 'admin')) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    const productCount = await Product.count({ where: { category_id: category.id } })

    return res.status(200).json({
      success: true,
      data: {
        ...(category.toJSON ? category.toJSON() : category),
        productCount
      }
    })
  } catch (err) {
    next(err)
  }
}

// ...existing exports...
module.exports = {
  // ...existing exports...
  getCategories,
  getCategory,
  // ...existing exports...
}