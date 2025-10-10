import College from '../models/College.js';
import PlacementData from '../models/PlacementData.js';

// Get all colleges
export const getAllColleges = async (req: any, res: any) => {
  try {
    const colleges = await College.find({}).sort({ name: 1 });
    const collegesWithId = colleges.map(college => ({
      ...college.toObject(),
      id: college.code
    }));
    res.json({ success: true, colleges: collegesWithId });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

// Get college by ID or code
export const getCollegeById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB ID first, then by code
    let college = await College.findById(id).catch(() => null);
    if (!college) {
      college = await College.findOne({ code: id });
    }
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Get placement data for this college using code
    const placementData = await PlacementData.find({ collegeId: college.code }).sort({ batchYear: -1 });
    
    const collegeWithPlacement = {
      ...college.toObject(),
      id: college.code,
      placement_data: placementData
    };

    res.json({ success: true, college: collegeWithPlacement });
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Failed to fetch college' });
  }
};

// Get colleges with placement data
export const getCollegesWithPlacement = async (req: any, res: any) => {
  try {
    const colleges = await College.find({}).sort({ name: 1 });
    const placementData = await PlacementData.find({});
    
    const collegesWithPlacement = colleges.map(college => {
      const collegePlacementData = placementData.filter(pd => pd.collegeId === (college._id as any).toString());
      return {
        ...college.toObject(),
        placement_data: collegePlacementData
      };
    });

    res.json({ success: true, colleges: collegesWithPlacement });
  } catch (error) {
    console.error('Error fetching colleges with placement:', error);
    res.status(500).json({ error: 'Failed to fetch colleges with placement' });
  }
};

// Create new college
export const createCollege = async (req: any, res: any) => {
  try {
    const { name, location, code, established, ranking, totalStudents, placementOfficer } = req.body;
    
    if (!name || !location || !code) {
      return res.status(400).json({ error: 'Name, location, and code are required' });
    }

    const college = await College.create({
      name,
      location,
      code,
      established,
      ranking,
      totalStudents,
      placementOfficer
    });

    res.status(201).json({ success: true, college });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'College with this name or code already exists' });
    }
    console.error('Error creating college:', error);
    res.status(500).json({ error: 'Failed to create college' });
  }
};

// Update college
export const updateCollege = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const college = await College.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json({ success: true, college });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'College with this name or code already exists' });
    }
    console.error('Error updating college:', error);
    res.status(500).json({ error: 'Failed to update college' });
  }
};

// Delete college
export const deleteCollege = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const college = await College.findByIdAndDelete(id);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Also delete associated placement data
    await PlacementData.deleteMany({ collegeId: id });

    res.json({ success: true, message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ error: 'Failed to delete college' });
  }
};
