// Debug script to check placement data
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/college-placement-insights');

// Define schema (same as your model)
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

const PlacementData = mongoose.model('PlacementData', PlacementDataSchema);

async function debugData() {
  try {
    console.log('=== PLACEMENT DATA DEBUG ===\n');
    
    // Get all colleges
    const colleges = await PlacementData.distinct('collegeId');
    console.log('Colleges found:', colleges);
    
    for (const collegeId of colleges) {
      console.log(`\n--- ${collegeId} ---`);
      
      const placements = await PlacementData.find({ collegeId }).lean();
      console.log(`Total records: ${placements.length}`);
      
      // Check status values
      const statusCounts = {};
      const packageValues = [];
      
      placements.forEach(p => {
        const status = String(p.status || '').toLowerCase().trim();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        
        const pkg = parseFloat(String(p.package));
        if (!isNaN(pkg) && pkg > 0) {
          packageValues.push(pkg);
        }
      });
      
      console.log('Status distribution:', statusCounts);
      console.log(`Valid packages: ${packageValues.length}`);
      if (packageValues.length > 0) {
        const avgPkg = packageValues.reduce((a, b) => a + b, 0) / packageValues.length;
        console.log(`Average package: ${avgPkg.toFixed(2)}`);
        console.log(`Package range: ${Math.min(...packageValues)} - ${Math.max(...packageValues)}`);
      }
      
      // Count "placed" students
      const placedCount = placements.filter(p => {
        const status = String(p.status || '').toLowerCase().trim();
        return status === 'placed' || status.includes('placed');
      }).length;
      
      const placementRate = placements.length > 0 ? (placedCount / placements.length) * 100 : 0;
      console.log(`Placed students: ${placedCount}/${placements.length} (${placementRate.toFixed(1)}%)`);
      
      // Show sample records
      console.log('\nSample records:');
      placements.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i+1}. Status: "${p.status}", Package: "${p.package}", Branch: "${p.branch}"`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugData();
