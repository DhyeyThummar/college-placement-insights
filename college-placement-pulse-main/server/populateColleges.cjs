const mongoose = require('mongoose');
require('dotenv').config();

// College Schema
const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  established: { type: Number },
  type: { type: String, enum: ['Government', 'Private'], default: 'Government' },
  ranking: { type: Number },
  totalStudents: { type: Number },
  placementOfficer: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const College = mongoose.model('College', CollegeSchema);

// College data matching the admin keys
const colleges = [
  {
    name: "Indian Institute of Technology Delhi",
    location: "New Delhi",
    code: "IITD",
    established: 1961,
    type: "Government",
    ranking: 1,
    totalStudents: 8000,
    placementOfficer: "Dr. Rajesh Kumar"
  },
  {
    name: "Indian Institute of Technology Bombay",
    location: "Mumbai",
    code: "IITB",
    established: 1958,
    type: "Government",
    ranking: 2,
    totalStudents: 7500,
    placementOfficer: "Prof. Meera Sharma"
  },
  {
    name: "Indian Institute of Technology Kanpur",
    location: "Kanpur",
    code: "IITK",
    established: 1959,
    type: "Government",
    ranking: 3,
    totalStudents: 7000,
    placementOfficer: "Dr. Anil Verma"
  },
  {
    name: "Indian Institute of Technology Madras",
    location: "Chennai",
    code: "IITM",
    established: 1959,
    type: "Government",
    ranking: 4,
    totalStudents: 7200,
    placementOfficer: "Prof. Priya Nair"
  },
  {
    name: "Indian Institute of Technology Kharagpur",
    location: "Kharagpur",
    code: "IITKGP",
    established: 1951,
    type: "Government",
    ranking: 5,
    totalStudents: 8500,
    placementOfficer: "Dr. Suresh Reddy"
  },
  {
    name: "National Institute of Technology Karnataka",
    location: "Surathkal",
    code: "NITK",
    established: 1960,
    type: "Government",
    ranking: 8,
    totalStudents: 6500,
    placementOfficer: "Prof. Deepak Singh"
  },
  {
    name: "National Institute of Technology Trichy",
    location: "Tiruchirappalli",
    code: "NITT",
    established: 1964,
    type: "Government",
    ranking: 6,
    totalStudents: 6000,
    placementOfficer: "Dr. Kavita Patel"
  },
  {
    name: "Birla Institute of Technology and Science",
    location: "Pilani",
    code: "BITS",
    established: 1964,
    type: "Private",
    ranking: 15,
    totalStudents: 4200,
    placementOfficer: "Prof. Rajesh Gupta"
  },
  {
    name: "Delhi Technological University",
    location: "New Delhi",
    code: "DTU",
    established: 1941,
    type: "Government",
    ranking: 12,
    totalStudents: 5500,
    placementOfficer: "Dr. Sunita Agarwal"
  },
  {
    name: "Netaji Subhas University of Technology",
    location: "New Delhi",
    code: "NSUT",
    established: 1983,
    type: "Government",
    ranking: 18,
    totalStudents: 4800,
    placementOfficer: "Prof. Vikram Joshi"
  }
];

async function populateColleges() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://DeepVegad:143@cluster0.q8fenbd.mongodb.net/college-placement-insights?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Populating colleges in MongoDB...\n');

    // Clear existing colleges
    await College.deleteMany({});
    console.log('Cleared existing colleges\n');

    for (const collegeData of colleges) {
      try {
        const college = await College.create(collegeData);
        console.log(`✅ Created: ${college.name} (${college.code})`);
      } catch (error) {
        console.log(`❌ Error creating ${collegeData.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 College population completed!');
    console.log('\n📋 Colleges in database:');
    
    const allColleges = await College.find({}).sort({ name: 1 });
    allColleges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.name} (${college.code}) - ${college.location}`);
    });

  } catch (error) {
    console.error('Error populating colleges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
populateColleges();
