const mongoose = require('mongoose');
require('dotenv').config();

// Sample colleges data
const colleges = [
  { id: '1', name: 'IIT Delhi', location: 'Delhi' },
  { id: '2', name: 'IIT Bombay', location: 'Mumbai' },
  { id: '3', name: 'IIT Madras', location: 'Chennai' },
  { id: '4', name: 'IIT Kanpur', location: 'Kanpur' },
  { id: '5', name: 'NIT Trichy', location: 'Trichy' },
  { id: '6', name: 'BITS Pilani', location: 'Pilani' },
  { id: '7', name: 'DTU', location: 'Delhi' },
  { id: '8', name: 'NSIT', location: 'Delhi' }
];

// College Admin Key Schema
const CollegeAdminKeySchema = new mongoose.Schema({
  collegeId: { type: String, required: true, unique: true, index: true },
  collegeName: { type: String, required: true },
  adminKey: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CollegeAdminKey = mongoose.model('CollegeAdminKey', CollegeAdminKeySchema);

// Generate a unique admin key for a college
const generateAdminKey = (collegeName, collegeId) => {
  const prefix = collegeName.replace(/\s+/g, '').toUpperCase().substring(0, 3);
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${collegeId.substring(0, 3)}${randomSuffix}`;
};

async function generateAdminKeys() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college-placement-insights';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Generating admin keys for colleges...\n');

    for (const college of colleges) {
      try {
        // Check if key already exists
        const existingKey = await CollegeAdminKey.findOne({ collegeId: college.id });
        
        if (existingKey) {
          console.log(`✅ ${college.name} - Key already exists: ${existingKey.adminKey}`);
          continue;
        }

        // Generate unique admin key
        let adminKey = generateAdminKey(college.name, college.id);
        
        // Ensure key is unique
        let attempts = 0;
        while (await CollegeAdminKey.findOne({ adminKey }) && attempts < 10) {
          adminKey = generateAdminKey(college.name, college.id);
          attempts++;
        }

        if (attempts >= 10) {
          console.log(`❌ ${college.name} - Failed to generate unique key`);
          continue;
        }

        // Create admin key
        const collegeAdminKey = await CollegeAdminKey.create({
          collegeId: college.id,
          collegeName: college.name,
          adminKey,
          createdBy: 'system',
          isActive: true
        });

        console.log(`✅ ${college.name} - Generated key: ${collegeAdminKey.adminKey}`);
      } catch (error) {
        console.log(`❌ ${college.name} - Error: ${error.message}`);
      }
    }

    console.log('\n🎉 Admin key generation completed!');
    console.log('\n📋 Summary of generated keys:');
    
    const allKeys = await CollegeAdminKey.find({ isActive: true }).sort({ collegeName: 1 });
    allKeys.forEach(key => {
      console.log(`${key.collegeName}: ${key.adminKey}`);
    });

  } catch (error) {
    console.error('Error generating admin keys:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
generateAdminKeys();
