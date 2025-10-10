import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import College from '../models/College.js';
import { signToken } from '../middleware/auth.js';


export const adminSignup = async (req: any, res: any) => {
  try {
    const { name, email, password, collegeName, specialKey } = req.body;
    if (!name || !email || !password || !collegeName || !specialKey) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    // Validate special key
    const VALID_SPECIAL_KEY = process.env.ADMIN_SPECIAL_KEY || 'ADMIN2025';
    if (specialKey !== VALID_SPECIAL_KEY) {
      return res.status(403).json({ error: 'Invalid special key' });
    }
    
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Admin already exists' });
    
    // Generate collegeId from collegeName (lowercase, replace spaces with hyphens)
    const collegeId = collegeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Create or update college entry
    await College.findOneAndUpdate(
      { code: collegeId },
      { 
        name: collegeName, 
        code: collegeId,
        location: 'Not specified',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed, collegeName, collegeId, role: 'admin' });
    const token = signToken({ id: admin.id, role: 'admin', collegeId: admin.collegeId });
    res.status(201).json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, collegeId: admin.collegeId, collegeName: admin.collegeName } });
  } catch (e) {
    console.error('Admin signup error:', e);
    res.status(500).json({ error: 'Admin signup failed' });
  }
};

export const adminLogin = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: admin.id, role: 'admin', collegeId: admin.collegeId });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, collegeId: admin.collegeId, collegeName: admin.collegeName } });
  } catch (e) {
    res.status(500).json({ error: 'Admin login failed' });
  }
};


