import CollegeAdminKey from '../models/CollegeAdminKey.js';

// Generate a unique admin key for a college
const generateAdminKey = (collegeName: string, collegeId: string): string => {
  const prefix = collegeName.replace(/\s+/g, '').toUpperCase().substring(0, 3);
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${collegeId.substring(0, 3)}${randomSuffix}`;
};

// Create admin key for a college
export const createCollegeAdminKey = async (req: any, res: any) => {
  try {
    const { collegeId, collegeName, createdBy } = req.body;
    
    if (!collegeId || !collegeName || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if key already exists for this college
    const existingKey = await CollegeAdminKey.findOne({ collegeId });
    if (existingKey) {
      return res.status(409).json({ 
        error: 'Admin key already exists for this college',
        existingKey: existingKey.adminKey
      });
    }

    // Generate unique admin key
    let adminKey = generateAdminKey(collegeName, collegeId);
    
    // Ensure key is unique
    let attempts = 0;
    while (await CollegeAdminKey.findOne({ adminKey }) && attempts < 10) {
      adminKey = generateAdminKey(collegeName, collegeId);
      attempts++;
    }

    if (attempts >= 10) {
      return res.status(500).json({ error: 'Failed to generate unique admin key' });
    }

    const collegeAdminKey = await CollegeAdminKey.create({
      collegeId,
      collegeName,
      adminKey,
      createdBy,
      isActive: true
    });

    res.status(201).json({
      success: true,
      collegeAdminKey: {
        collegeId: collegeAdminKey.collegeId,
        collegeName: collegeAdminKey.collegeName,
        adminKey: collegeAdminKey.adminKey,
        isActive: collegeAdminKey.isActive
      }
    });
  } catch (error) {
    console.error('Error creating college admin key:', error);
    res.status(500).json({ error: 'Failed to create admin key' });
  }
};

// Get all college admin keys
export const getAllCollegeAdminKeys = async (req: any, res: any) => {
  try {
    const keys = await CollegeAdminKey.find({ isActive: true })
      .select('collegeId collegeName adminKey isActive createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, keys });
  } catch (error) {
    console.error('Error fetching college admin keys:', error);
    res.status(500).json({ error: 'Failed to fetch admin keys' });
  }
};

// Get admin key for a specific college
export const getCollegeAdminKey = async (req: any, res: any) => {
  try {
    const { collegeId } = req.params;
    
    const key = await CollegeAdminKey.findOne({ collegeId, isActive: true });
    
    if (!key) {
      return res.status(404).json({ error: 'Admin key not found for this college' });
    }

    res.json({ 
      success: true, 
      collegeAdminKey: {
        collegeId: key.collegeId,
        collegeName: key.collegeName,
        adminKey: key.adminKey,
        isActive: key.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching college admin key:', error);
    res.status(500).json({ error: 'Failed to fetch admin key' });
  }
};

// Update admin key for a college
export const updateCollegeAdminKey = async (req: any, res: any) => {
  try {
    const { collegeId } = req.params;
    const { isActive } = req.body;
    
    const key = await CollegeAdminKey.findOneAndUpdate(
      { collegeId },
      { isActive, updatedAt: new Date() },
      { new: true }
    );
    
    if (!key) {
      return res.status(404).json({ error: 'Admin key not found for this college' });
    }

    res.json({ 
      success: true, 
      message: 'Admin key updated successfully',
      collegeAdminKey: {
        collegeId: key.collegeId,
        collegeName: key.collegeName,
        adminKey: key.adminKey,
        isActive: key.isActive
      }
    });
  } catch (error) {
    console.error('Error updating college admin key:', error);
    res.status(500).json({ error: 'Failed to update admin key' });
  }
};

// Delete admin key for a college
export const deleteCollegeAdminKey = async (req: any, res: any) => {
  try {
    const { collegeId } = req.params;
    
    const key = await CollegeAdminKey.findOneAndDelete({ collegeId });
    
    if (!key) {
      return res.status(404).json({ error: 'Admin key not found for this college' });
    }

    res.json({ 
      success: true, 
      message: 'Admin key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting college admin key:', error);
    res.status(500).json({ error: 'Failed to delete admin key' });
  }
};

// Verify admin key for signup
export const verifyAdminKey = async (req: any, res: any) => {
  try {
    const { adminKey, collegeId } = req.body;
    
    if (!adminKey || !collegeId) {
      return res.status(400).json({ error: 'Admin key and college ID are required' });
    }

    const key = await CollegeAdminKey.findOne({ 
      adminKey, 
      collegeId, 
      isActive: true 
    });
    
    if (!key) {
      return res.status(401).json({ error: 'Invalid admin key for this college' });
    }

    res.json({ 
      success: true, 
      message: 'Admin key is valid',
      collegeName: key.collegeName
    });
  } catch (error) {
    console.error('Error verifying admin key:', error);
    res.status(500).json({ error: 'Failed to verify admin key' });
  }
};
