import { Router } from 'express';
import multer from 'multer';
import { authAdmin } from '../middleware/auth.js';
import { uploadCsv, downloadCsvTemplate } from '../controllers/upload.controller.js';
import { getAllPlacements, getPlacementStats } from '../controllers/placement.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/admin/csv-template', authAdmin, downloadCsvTemplate);
router.post('/admin/upload', authAdmin, upload.single('file'), uploadCsv);

router.get('/placements/:collegeId', getAllPlacements);
router.get('/placements/:collegeId/stats', getPlacementStats);

export default router;


