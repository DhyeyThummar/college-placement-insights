import { Request, Response } from 'express';
import PlacementData from '../models/PlacementData.js';

export const getCollegeAnalytics = async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params;
    const { year } = req.query;
    
    // Build query with optional year filter
    let query: any = { collegeId };
    if (year && year !== 'all') {
      query.batchYear = year;
    }
    
    // Get placement data for this college with optional year filter
    const placements = await PlacementData.find(query).lean();
    console.log(`Analytics for ${collegeId} - Found ${placements.length} records`);
    
    if (placements.length === 0) {
      return res.json({
        success: true,
        analytics: {
          totalStudents: 0,
          placedStudents: 0,
          placementRate: 0,
          avgPackage: 0,
          highestPackage: 0,
          totalCompanies: 0,
          branchWise: [],
          companyWise: [],
          yearWise: [],
          packageDistribution: []
        }
      });
    }

    // Calculate overall statistics
    const totalStudents = placements.length;
    const placedStudents = placements.filter(p => {
      const status = String(p.status || '').toLowerCase().trim();
      return status === 'placed';
    }).length;
    const placementRate = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

    // Calculate package statistics ONLY for placed students
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
    
    console.log(`College ${collegeId} - Total placements: ${placements.length}, Placed students: ${placedStudents}, Valid packages: ${packages.length}`);
    console.log(`Sample packages:`, packages.slice(0, 5));
    console.log(`Sample placement records:`, placements.slice(0, 3).map(p => ({ 
      status: p.status, 
      package: p.package, 
      branch: p.branch,
      company: p.company 
    })));
    
    const avgPackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    // Get unique companies
    const companies = [...new Set(placements.map(p => p.company).filter(c => c && c !== '0'))];
    const totalCompanies = companies.length;

    // Branch-wise analysis
    const branchMap = new Map();
    placements.forEach(p => {
      const branch = p.branch || 'Unknown';
      if (!branchMap.has(branch)) {
        branchMap.set(branch, {
          branch,
          totalStudents: 0,
          placedStudents: 0,
          packages: []
        });
      }
      
      const branchData = branchMap.get(branch);
      branchData.totalStudents++;
      
      const status = String(p.status || '').toLowerCase().trim();
      if (status === 'placed') {
        branchData.placedStudents++;
        
        // Only add package if student is placed
        const pkg = parseFloat(String(p.package));
        if (!isNaN(pkg) && pkg > 0) {
          branchData.packages.push(pkg);
        }
      }
    });

    const branchWise = Array.from(branchMap.values()).map(branch => ({
      branch: branch.branch,
      totalStudents: branch.totalStudents,
      placedStudents: branch.placedStudents,
      placementRate: branch.totalStudents > 0 ? (branch.placedStudents / branch.totalStudents) * 100 : 0,
      avgPackage: branch.packages.length > 0 ? branch.packages.reduce((a: number, b: number) => a + b, 0) / branch.packages.length : 0,
      highestPackage: branch.packages.length > 0 ? Math.max(...branch.packages) : 0
    }));

    // Company-wise analysis
    const companyMap = new Map();
    placements.forEach(p => {
      const company = p.company || 'Unknown';
      if (company !== '0') {
        companyMap.set(company, (companyMap.get(company) || 0) + 1);
      }
    });

    const companyWise = Array.from(companyMap.entries())
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 companies

    // Year-wise analysis
    const yearMap = new Map();
    placements.forEach(p => {
      const year = String(p.batchYear) || 'Unknown';
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          totalStudents: 0,
          placedStudents: 0,
          packages: []
        });
      }
      
      const yearData = yearMap.get(year);
      yearData.totalStudents++;
      
      const status = String(p.status || '').toLowerCase().trim();
      if (status === 'placed') {
        yearData.placedStudents++;
        
        // Only add package if student is placed
        const pkg = parseFloat(String(p.package));
        if (!isNaN(pkg) && pkg > 0) {
          yearData.packages.push(pkg);
        }
      }
    });

    const yearWise = Array.from(yearMap.values()).map(year => ({
      year: year.year,
      totalStudents: year.totalStudents,
      placedStudents: year.placedStudents,
      placementRate: year.totalStudents > 0 ? (year.placedStudents / year.totalStudents) * 100 : 0,
      avgPackage: year.packages.length > 0 ? year.packages.reduce((a: number, b: number) => a + b, 0) / year.packages.length : 0
    }));

    // Package distribution
    const packageRanges = [
      { range: '0-5 LPA', min: 0, max: 5, count: 0 },
      { range: '5-10 LPA', min: 5, max: 10, count: 0 },
      { range: '10-15 LPA', min: 10, max: 15, count: 0 },
      { range: '15-20 LPA', min: 15, max: 20, count: 0 },
      { range: '20+ LPA', min: 20, max: Infinity, count: 0 }
    ];

    packages.forEach(pkg => {
      for (const range of packageRanges) {
        if (pkg >= range.min && pkg < range.max) {
          range.count++;
          break;
        }
      }
    });

    const packageDistribution = packageRanges.filter(range => range.count > 0);

    res.json({
      success: true,
      analytics: {
        totalStudents,
        placedStudents,
        placementRate: Math.round(placementRate * 100) / 100,
        avgPackage: Math.round(avgPackage * 100) / 100,
        highestPackage: Math.round(highestPackage * 100) / 100,
        totalCompanies,
        branchWise,
        companyWise,
        yearWise,
        packageDistribution
      }
    });

  } catch (error) {
    console.error('Error generating college analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
};

// Get global placement statistics
export const getGlobalPlacementStats = async (req: Request, res: Response) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalOffers: { $sum: 1 },
          placedStudents: {
            $sum: {
              $cond: [
                { $eq: [{ $toLower: { $toString: '$status' } }, 'placed'] },
                1,
                0
              ]
            }
          },
          packages: {
            $push: {
              $cond: [
                { 
                  $and: [
                    { $eq: [{ $toLower: { $toString: '$status' } }, 'placed'] },
                    { $ne: ['$package', null] }, 
                    { $ne: ['$package', 0] }, 
                    { $ne: ['$package', '0'] }
                  ]
                },
                { $toDouble: { $toString: '$package' } },
                null
              ]
            }
          },
          companies: { $addToSet: '$company' }
        }
      },
      {
        $project: {
          totalOffers: 1,
          placedStudents: 1,
          placementRate: {
            $cond: [
              { $gt: ['$totalOffers', 0] },
              { $multiply: [{ $divide: ['$placedStudents', '$totalOffers'] }, 100] },
              0
            ]
          },
          avgPackage: {
            $cond: [
              { $gt: [{ $size: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } }, 0] },
              { $avg: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } },
              0
            ]
          },
          totalCompanies: {
            $size: {
              $filter: {
                input: '$companies',
                cond: { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', '0'] }, { $ne: ['$$this', ''] }] }
              }
            }
          }
        }
      }
    ];

    const [stats] = await PlacementData.aggregate(pipeline);

    res.json({
      totalOffers: stats?.totalOffers || 0,
      placementRate: Math.round((stats?.placementRate || 0) * 100) / 100,
      avgPackage: Math.round((stats?.avgPackage || 0) * 100) / 100,
      totalCompanies: stats?.totalCompanies || 0
    });

  } catch (error) {
    console.error('Error generating global placement stats:', error);
    res.status(500).json({ error: 'Failed to generate global stats' });
  }
};

// Get global branch-wise data
export const getGlobalBranchWiseData = async (req: Request, res: Response) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$branch',
          totalStudents: { $sum: 1 },
          placedStudents: {
            $sum: {
              $cond: [
                { $eq: [{ $toLower: { $toString: '$status' } }, 'placed'] },
                1,
                0
              ]
            }
          },
          packages: {
            $push: {
              $cond: [
                { 
                  $and: [
                    { $eq: [{ $toLower: { $toString: '$status' } }, 'placed'] },
                    { $ne: ['$package', null] }, 
                    { $ne: ['$package', 0] }, 
                    { $ne: ['$package', '0'] }
                  ]
                },
                { $toDouble: { $toString: '$package' } },
                null
              ]
            }
          },
          companies: { $addToSet: '$company' }
        }
      },
      {
        $project: {
          branch: '$_id',
          totalStudents: 1,
          placedStudents: 1,
          placementRate: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$placedStudents', '$totalStudents'] }, 100] },
              0
            ]
          },
          avgPackage: {
            $cond: [
              { $gt: [{ $size: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } }, 0] },
              { $avg: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } },
              0
            ]
          },
          highestPackage: {
            $cond: [
              { $gt: [{ $size: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } }, 0] },
              { $max: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } },
              0
            ]
          },
          companies: {
            $filter: {
              input: '$companies',
              cond: { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', '0'] }, { $ne: ['$$this', ''] }] }
            }
          }
        }
      },
      { $sort: { placementRate: -1 as -1 } }
    ];

    const branchData = await PlacementData.aggregate(pipeline);

    res.json(branchData.map(branch => ({
      branch: branch.branch || 'Unknown',
      totalStudents: branch.totalStudents,
      placedStudents: branch.placedStudents,
      placementRate: Math.round(branch.placementRate * 100) / 100,
      avgPackage: Math.round(branch.avgPackage * 100) / 100,
      highestPackage: Math.round(branch.highestPackage * 100) / 100,
      companies: branch.companies
    })));

  } catch (error) {
    console.error('Error generating global branch-wise data:', error);
    res.status(500).json({ error: 'Failed to generate branch-wise data' });
  }
};

export const getAllCollegesAnalytics = async (req: Request, res: Response) => {
  try {
    // Get all colleges with their placement data
    const pipeline = [
      {
        $group: {
          _id: '$collegeId',
          totalStudents: { $sum: 1 },
          placedStudents: {
            $sum: {
              $cond: [
                { $eq: [{ $toLower: { $toString: '$status' } }, 'placed'] },
                1,
                0
              ]
            }
          },
          packages: {
            $push: {
              $cond: [
                { 
                  $and: [
                    { $eq: [{ $toLower: { $toString: '$status' } }, 'placed'] },
                    { $ne: ['$package', null] }, 
                    { $ne: ['$package', 0] }, 
                    { $ne: ['$package', '0'] }
                  ]
                },
                { $toDouble: { $toString: '$package' } },
                null
              ]
            }
          },
          companies: { $addToSet: '$company' }
        }
      },
      {
        $project: {
          collegeId: '$_id',
          totalStudents: 1,
          placedStudents: 1,
          placementRate: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $multiply: [{ $divide: ['$placedStudents', '$totalStudents'] }, 100] },
              0
            ]
          },
          avgPackage: {
            $cond: [
              { $gt: [{ $size: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } }, 0] },
              { $avg: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } },
              0
            ]
          },
          highestPackage: {
            $cond: [
              { $gt: [{ $size: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } }, 0] },
              { $max: { $filter: { input: '$packages', cond: { $ne: ['$$this', null] } } } },
              0
            ]
          },
          totalCompanies: {
            $size: {
              $filter: {
                input: '$companies',
                cond: { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', '0'] }, { $ne: ['$$this', ''] }] }
              }
            }
          }
        }
      }
    ];

    const analytics = await PlacementData.aggregate(pipeline);

    res.json({
      success: true,
      colleges: analytics.map(college => ({
        id: college.collegeId,
        collegeId: college.collegeId,
        totalStudents: college.totalStudents,
        placedStudents: college.placedStudents,
        placementRate: Math.round(college.placementRate * 100) / 100,
        avgPackage: Math.round(college.avgPackage * 100) / 100,
        highestPackage: Math.round(college.highestPackage * 100) / 100,
        totalCompanies: college.totalCompanies
      }))
    });

  } catch (error) {
    console.error('Error generating all colleges analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
};
