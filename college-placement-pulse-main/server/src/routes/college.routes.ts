import { Router } from 'express';
import { 
  getAllColleges, 
  getCollegeById, 
  getCollegesWithPlacement,
  createCollege,
  updateCollege,
  deleteCollege
} from '../controllers/college.controller.js';

const router = Router();

// Get all colleges
router.get('/', getAllColleges);

// Get colleges with placement data
router.get('/with-placement', getCollegesWithPlacement);

// Get college by ID
router.get('/:id', getCollegeById);

// Create new college
router.post('/', createCollege);

// Update college
router.put('/:id', updateCollege);

// Delete college
router.delete('/:id', deleteCollege);

export default router;
