import { Router } from 'express';
import { adminLogin, adminSignup } from '../controllers/auth.controller.js';

const router = Router();

router.post('/admin/signup', adminSignup);
router.post('/admin/login', adminLogin);

export default router;


