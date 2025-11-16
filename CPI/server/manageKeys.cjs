const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://DeepVegad:143@cluster0.q8fenbd.mongodb.net/college-placement-insights?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

async function listKeys() {
  try {
    await connectDB();
    
    console.log('\n📋 Current Admin Keys:');
    console.log('='.repeat(50));
    
    const allKeys = await CollegeAdminKey.find({ isActive: true }).sort({ collegeName: 1 });
    allKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.collegeName}`);
      console.log(`   ID: ${key.collegeId}`);
      console.log(`   Key: ${key.adminKey}`);
      console.log(`   Status: ${key.isActive ? 'Active' : 'Inactive'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error listing keys:', error);
  } finally {
    await disconnectDB();
  }
}

async function updateKey(collegeId, newKey) {
  try {
    await connectDB();
    
    const key = await CollegeAdminKey.findOne({ collegeId });
    if (!key) {
      console.log(`❌ No admin key found for college ID: ${collegeId}`);
      return;
    }
    
    // Check if new key already exists
    const existingKey = await CollegeAdminKey.findOne({ adminKey: newKey, collegeId: { $ne: collegeId } });
    if (existingKey) {
      console.log(`❌ Key "${newKey}" is already used by ${existingKey.collegeName}`);
      return;
    }
    
    const oldKey = key.adminKey;
    key.adminKey = newKey;
    key.updatedAt = new Date();
    await key.save();
    
    console.log(`✅ Updated admin key for ${key.collegeName}:`);
    console.log(`   Old Key: ${oldKey}`);
    console.log(`   New Key: ${newKey}`);
    
  } catch (error) {
    console.error('Error updating key:', error);
  } finally {
    await disconnectDB();
  }
}

async function addCollege(collegeId, collegeName, adminKey) {
  try {
    await connectDB();
    
    // Check if college already exists
    const existing = await CollegeAdminKey.findOne({ collegeId });
    if (existing) {
      console.log(`❌ College with ID ${collegeId} already exists: ${existing.collegeName}`);
      return;
    }
    
    // Check if key already exists
    const existingKey = await CollegeAdminKey.findOne({ adminKey });
    if (existingKey) {
      console.log(`❌ Key "${adminKey}" is already used by ${existingKey.collegeName}`);
      return;
    }
    
    const newCollege = await CollegeAdminKey.create({
      collegeId,
      collegeName,
      adminKey,
      createdBy: 'manual',
      isActive: true
    });
    
    console.log(`✅ Added new college: ${newCollege.collegeName}`);
    console.log(`   ID: ${newCollege.collegeId}`);
    console.log(`   Key: ${newCollege.adminKey}`);
    
  } catch (error) {
    console.error('Error adding college:', error);
  } finally {
    await disconnectDB();
  }
}

async function toggleKeyStatus(collegeId) {
  try {
    await connectDB();
    
    const key = await CollegeAdminKey.findOne({ collegeId });
    if (!key) {
      console.log(`❌ No admin key found for college ID: ${collegeId}`);
      return;
    }
    
    key.isActive = !key.isActive;
    key.updatedAt = new Date();
    await key.save();
    
    console.log(`✅ ${key.isActive ? 'Activated' : 'Deactivated'} admin key for ${key.collegeName}`);
    console.log(`   Status: ${key.isActive ? 'Active' : 'Inactive'}`);
    
  } catch (error) {
    console.error('Error toggling key status:', error);
  } finally {
    await disconnectDB();
  }
}

async function exportKeys() {
  try {
    await connectDB();
    
    const allKeys = await CollegeAdminKey.find({}).sort({ collegeName: 1 });
    const exportData = {
      colleges: allKeys.map(key => ({
        id: key.collegeId,
        name: key.collegeName,
        adminKey: key.adminKey,
        isActive: key.isActive
      }))
    };
    
    const exportPath = path.join(__dirname, 'admin-keys-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Exported ${allKeys.length} admin keys to: ${exportPath}`);
    
  } catch (error) {
    console.error('Error exporting keys:', error);
  } finally {
    await disconnectDB();
  }
}

// Command line interface
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];
const arg3 = process.argv[5];

switch (command) {
  case 'list':
    listKeys();
    break;
  case 'update':
    if (!arg1 || !arg2) {
      console.log('Usage: node manageKeys.cjs update <collegeId> <newKey>');
      console.log('Example: node manageKeys.cjs update 1 IIT_DELHI_2025');
    } else {
      updateKey(arg1, arg2);
    }
    break;
  case 'add':
    if (!arg1 || !arg2 || !arg3) {
      console.log('Usage: node manageKeys.cjs add <collegeId> <collegeName> <adminKey>');
      console.log('Example: node manageKeys.cjs add 9 "IIT Roorkee" IIT_ROORKEE_2024');
    } else {
      addCollege(arg1, arg2, arg3);
    }
    break;
  case 'toggle':
    if (!arg1) {
      console.log('Usage: node manageKeys.cjs toggle <collegeId>');
      console.log('Example: node manageKeys.cjs toggle 1');
    } else {
      toggleKeyStatus(arg1);
    }
    break;
  case 'export':
    exportKeys();
    break;
  default:
    console.log('🔑 Admin Key Management Tool');
    console.log('============================');
    console.log('');
    console.log('Available commands:');
    console.log('  list                    - List all admin keys');
    console.log('  update <id> <key>       - Update admin key for a college');
    console.log('  add <id> <name> <key>   - Add new college with admin key');
    console.log('  toggle <id>             - Toggle key status (active/inactive)');
    console.log('  export                  - Export all keys to JSON file');
    console.log('');
    console.log('Examples:');
    console.log('  node manageKeys.cjs list');
    console.log('  node manageKeys.cjs update 1 IIT_DELHI_2025');
    console.log('  node manageKeys.cjs add 9 "IIT Roorkee" IIT_ROORKEE_2024');
    console.log('  node manageKeys.cjs toggle 1');
    console.log('  node manageKeys.cjs export');
    break;
}
