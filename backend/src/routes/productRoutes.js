const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
+const { upload, handleMulterError } = require('../middleware/imageUpload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
-router.post('/', protect, authorize(['seller', 'admin']), createProduct);
+router.post(
+  '/',
+  protect,
+  authorize(['seller', 'admin']),
+  upload.array('images', 5), // Accept up to 5 images
+  handleMulterError,
+  createProduct
+);

-router.put('/:id', protect, authorize(['seller', 'admin']), updateProduct);
+router.put(
+  '/:id',
+  protect,
+  authorize(['seller', 'admin']),
+  upload.array('images', 5),
+  handleMulterError,
+  updateProduct
+);

router.delete('/:id', protect, authorize(['seller', 'admin']), deleteProduct);

module.exports = router;
