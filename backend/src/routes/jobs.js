const express = require('express')
const router = express.Router()
const { protect, authorize, checkOwnership } = require('../middleware/auth')
// const { Job } = require('../models') // Uncomment when Job model is created
// const jobController = require('../controllers/jobController') // Uncomment when controller is created

// Public routes
// router.get('/', jobController.getJobs) // Browse all active jobs
// router.get('/:id', jobController.getJob) // Get single job details

// Protected routes - require authentication
// router.post('/', protect, authorize('seller', 'admin'), jobController.createJob) // Only sellers/admins can post jobs
// router.get('/user/:userId', protect, jobController.getUserJobs) // Get user's own jobs (with ownership check)

// Protected routes - require ownership
// router.put('/:id', protect, checkOwnership(Job, 'id', 'poster_id'), jobController.updateJob)
// router.delete('/:id', protect, checkOwnership(Job, 'id', 'poster_id'), jobController.deleteJob)
// router.patch('/:id/status', protect, checkOwnership(Job, 'id', 'poster_id'), jobController.updateJobStatus)

module.exports = router
