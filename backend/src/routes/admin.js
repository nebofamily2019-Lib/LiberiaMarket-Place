const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const {
  getReports,
  updateReportStatus,
  suspendUser,
  reactivateUser,
  getListings
} = require('../controllers/adminController');

// All routes here require the admin role (protect is applied at mount time in server.js)
router.use(authorize('admin'));

router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/reactivate', reactivateUser);

router.get('/listings', getListings);

module.exports = router;
