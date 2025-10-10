import { apiFetch } from './api';

export interface College {
  id: string;
  name: string;
  location?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlacementData {
  id: string;
  college_id: string;
  file_name: string;
  data: {
    year: number;
    branch_data: Array<{
      branch: string;
      total_students: number;
      placed_students: number;
      highest_package: number;
      average_package: number;
      median_package?: number;
      companies: string[];
    }>;
    overall_stats: {
      total_students: number;
      total_placed: number;
      placement_percentage: number;
      total_companies: number;
      highest_package: number;
      average_package: number;
    };
  };
  upload_date: string;
}

export interface CollegeWithPlacement extends College {
  placement_data?: PlacementData[];
}

// Get all colleges from MongoDB
export const getColleges = async (): Promise<College[]> => {
  try {
    const response = await apiFetch<{ colleges: College[] }>('/colleges');
    return response.colleges || [];
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }
};

// Get college by ID from MongoDB
export const getCollegeById = async (id: string): Promise<CollegeWithPlacement | null> => {
  try {
    const response = await apiFetch<{ college: CollegeWithPlacement }>(`/colleges/${id}`);
    return response.college || null;
  } catch (error) {
    console.error('Error fetching college:', error);
    return null;
  }
};

// Get college analytics
export const getCollegeAnalytics = async (collegeId: string, year?: string) => {
  try {
    const url = year && year !== 'all' 
      ? `/analytics/college/${collegeId}?year=${year}`
      : `/analytics/college/${collegeId}`;
    const response = await apiFetch<{ analytics: any }>(url);
    return response.analytics || null;
  } catch (error) {
    console.error('Error fetching college analytics:', error);
    return null;
  }
};

// Get colleges with their placement data from MongoDB
export const getCollegesWithPlacement = async (): Promise<CollegeWithPlacement[]> => {
  try {
    const response = await apiFetch<{ colleges: CollegeWithPlacement[] }>('/colleges/with-placement');
    return response.colleges || [];
  } catch (error) {
    console.error('Error fetching colleges with placement:', error);
    return [];
  }
};

// Get overall placement statistics from MongoDB
export const getPlacementStats = async () => {
  try {
    const response = await apiFetch<{
      totalOffers: number;
      placementRate: number;
      avgPackage: number;
      totalCompanies: number;
    }>('/analytics/placement/stats');
    return response;
  } catch (error) {
    console.error('Error fetching placement stats:', error);
    return {
      totalOffers: 0,
      placementRate: 0,
      avgPackage: 0,
      totalCompanies: 0
    };
  }
};

// Get branch-wise data across all colleges from MongoDB
export const getBranchWiseData = async () => {
  try {
    const response = await apiFetch<Array<{
      branch: string;
      totalStudents: number;
      placedStudents: number;
      placementRate: number;
      avgPackage: number;
      highestPackage: number;
      companies: string[];
    }>>('/analytics/placement/branch-wise');
    return response || [];
  } catch (error) {
    console.error('Error fetching branch-wise data:', error);
    return [];
  }
};

// Get college-wise placement data from MongoDB
export const getCollegeWiseData = async () => {
  try {
    // First get basic college info
    const collegesResponse = await apiFetch<{ colleges: any[] }>('/colleges');
    const colleges = collegesResponse.colleges || [];
    
    // Then get analytics for all colleges
    const analyticsResponse = await apiFetch<{ colleges: any[] }>('/analytics/all-colleges');
    const analytics = analyticsResponse.colleges || [];
    
    // Merge college info with analytics
    const mergedData = colleges.map(college => {
      const collegeAnalytics = analytics.find(a => a.collegeId === college.code) || {};
      return {
        ...college,
        totalStudents: collegeAnalytics.totalStudents || 0,
        placedStudents: collegeAnalytics.placedStudents || 0,
        placementRate: collegeAnalytics.placementRate || 0,
        avgPackage: collegeAnalytics.avgPackage || 0,
        highestPackage: collegeAnalytics.highestPackage || 0,
        totalCompanies: collegeAnalytics.totalCompanies || 0
      };
    });
    
    return mergedData;
  } catch (error) {
    console.error('Error fetching college-wise data:', error);
    return [];
  }
};
