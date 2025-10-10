import { Router } from 'express';
import { 
  createCollegeAdminKey, 
  getAllCollegeAdminKeys, 
  getCollegeAdminKey, 
  updateCollegeAdminKey, 
  deleteCollegeAdminKey,
  verifyAdminKey
} from '../controllers/collegeAdminKey.controller.js';

const router = Router();

// Create admin key for a college
router.post('/create', createCollegeAdminKey);

// Get all college admin keys
router.get('/all', getAllCollegeAdminKeys);

// Get admin key for a specific college
router.get('/:collegeId', getCollegeAdminKey);

// Update admin key for a college
router.put('/:collegeId', updateCollegeAdminKey);

// Delete admin key for a college
router.delete('/:collegeId', deleteCollegeAdminKey);

// Verify admin key for signup
router.post('/verify', verifyAdminKey);

export default router;
