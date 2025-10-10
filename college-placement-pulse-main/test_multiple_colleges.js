// Test script to verify analytics work for multiple colleges
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/college-placement-insights');

// Define schemas
const CollegeSchema = new mongoose.Schema({
  name: String,
  code: String,
  location: String,
  updatedAt: Date
});

const PlacementDataSchema = new mongoose.Schema({
  collegeId: String,
  batchYear: mongoose.Schema.Types.Mixed,
  studentName: String,
  branch: String,
  company: String,
  package: mongoose.Schema.Types.Mixed,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const College = mongoose.model('College', CollegeSchema);
const PlacementData = mongoose.model('PlacementData', PlacementDataSchema);

async function testMultipleColleges() {
  try {
    console.log('=== MULTIPLE COLLEGES TEST ===\n');
    
    // Get all colleges
    const colleges = await College.find({}).lean();
    console.log(`Found ${colleges.length} colleges:`);
    colleges.forEach(c => console.log(`- ${c.name} (${c.code})`));
    
    console.log('\n=== ANALYTICS FOR EACH COLLEGE ===\n');
    
    for (const college of colleges) {
      console.log(`--- ${college.name} (${college.code}) ---`);
      
      const placements = await PlacementData.find({ collegeId: college.code }).lean();
      console.log(`Total records: ${placements.length}`);
      
      if (placements.length === 0) {
        console.log('No placement data found for this college\n');
        continue;
      }
      
      // Calculate placement rate
      const placedStudents = placements.filter(p => {
        const status = String(p.status || '').toLowerCase().trim();
        return status === 'placed';
      }).length;
      
      const placementRate = placements.length > 0 ? (placedStudents / placements.length) * 100 : 0;
      
      // Calculate average package for placed students only
      const placedStudentRecords = placements.filter(p => {
        const status = String(p.status || '').toLowerCase().trim();
        return status === 'placed';
      });
      
      const packages = placedStudentRecords
        .map(p => {
          const pkg = parseFloat(String(p.package));
          return isNaN(pkg) ? 0 : pkg;
        })
        .filter(pkg => pkg > 0);
      
      const avgPackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
      const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
      
      console.log(`Placed students: ${placedStudents}/${placements.length} (${placementRate.toFixed(1)}%)`);
      console.log(`Valid packages: ${packages.length}`);
      console.log(`Average package: ₹${avgPackage.toFixed(1)}L`);
      console.log(`Highest package: ₹${highestPackage.toFixed(1)}L`);
      
      // Show status distribution
      const statusCounts = {};
      placements.forEach(p => {
        const status = String(p.status || '').toLowerCase().trim();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('Status distribution:', statusCounts);
      
      // Show sample records
      console.log('Sample records:');
      placements.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i+1}. ${p.studentName} - ${p.status} - ₹${p.package}L - ${p.branch}`);
      });
      
      console.log('');
    }
    
    // Test All Colleges API simulation
    console.log('=== ALL COLLEGES API SIMULATION ===\n');
    
    const allCollegesData = [];
    for (const college of colleges) {
      const placements = await PlacementData.find({ collegeId: college.code }).lean();
      
      if (placements.length === 0) {
        allCollegesData.push({
          id: college.code,
          name: college.name,
          totalStudents: 0,
          placedStudents: 0,
          placementRate: 0,
          avgPackage: 0,
          highestPackage: 0,
          totalCompanies: 0
        });
        continue;
      }
      
      const placedStudents = placements.filter(p => {
        const status = String(p.status || '').toLowerCase().trim();
        return status === 'placed';
      }).length;
      
      const placementRate = (placedStudents / placements.length) * 100;
      
      const placedStudentRecords = placements.filter(p => {
        const status = String(p.status || '').toLowerCase().trim();
        return status === 'placed';
      });
      
      const packages = placedStudentRecords
        .map(p => parseFloat(String(p.package)))
        .filter(pkg => !isNaN(pkg) && pkg > 0);
      
      const avgPackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
      const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
      
      const companies = [...new Set(placements.map(p => p.company).filter(c => c && c !== '0'))];
      
      allCollegesData.push({
        id: college.code,
        name: college.name,
        totalStudents: placements.length,
        placedStudents: placedStudents,
        placementRate: Math.round(placementRate * 100) / 100,
        avgPackage: Math.round(avgPackage * 100) / 100,
        highestPackage: Math.round(highestPackage * 100) / 100,
        totalCompanies: companies.length
      });
    }
    
    console.log('All Colleges Summary:');
    allCollegesData.forEach(college => {
      console.log(`${college.name}:`);
      console.log(`  - Students: ${college.totalStudents}`);
      console.log(`  - Placement Rate: ${college.placementRate}%`);
      console.log(`  - Avg Package: ₹${college.avgPackage}L`);
      console.log(`  - Companies: ${college.totalCompanies}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testMultipleColleges();
