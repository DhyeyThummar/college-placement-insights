import { Router } from 'express';
import { 
  getCollegeAnalytics, 
  getAllCollegesAnalytics, 
  getGlobalPlacementStats, 
  getGlobalBranchWiseData 
} from '../controllers/analytics.controller.js';

const router = Router();

// Get analytics for specific college
router.get('/college/:collegeId', getCollegeAnalytics);

// Get analytics for all colleges
router.get('/all-colleges', getAllCollegesAnalytics);

// Get global placement statistics
router.get('/placement/stats', getGlobalPlacementStats);

// Get global branch-wise data
router.get('/placement/branch-wise', getGlobalBranchWiseData);

export default router;
