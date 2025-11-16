import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  GitCompare, 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Building2,
  GraduationCap,
  Trophy,
  Target,
  Star,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
  ArrowRight,
  Award,
  Briefcase,
  IndianRupee
} from 'lucide-react';
import { getCollegeWiseData, getCollegeAnalytics, getCollegeById } from '@/services/mongodb';
import { saveAs } from 'file-saver';

const Compare = () => {
  const [collegeA, setCollegeA] = useState('');
  const [collegeB, setCollegeB] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [comparisonCategory, setComparisonCategory] = useState('overall');
  const [insightLevel, setInsightLevel] = useState('detailed');
  // Removed comparisonMetric state as it's not needed
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeAData, setCollegeAData] = useState<any>(null);
  const [collegeBData, setCollegeBData] = useState<any>(null);
  const [collegeAAnalytics, setCollegeAAnalytics] = useState<any>(null);
  const [collegeBAnalytics, setCollegeBAnalytics] = useState<any>(null);

  // Fetch available colleges from database
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        console.log('Fetching colleges for comparison...');
        const collegeData = await getCollegeWiseData();
        console.log('Colleges fetched:', collegeData);
        setColleges(collegeData);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Fetch college A data with year filtering
  useEffect(() => {
    const fetchCollegeAData = async () => {
      if (!collegeA) {
        setCollegeAData(null);
        setCollegeAAnalytics(null);
        return;
      }

      try {
        console.log('Fetching data for college A:', collegeA, 'Year:', selectedYear);
        const [collegeInfo, analytics] = await Promise.all([
          getCollegeById(collegeA),
          getCollegeAnalytics(collegeA, selectedYear)
        ]);
        setCollegeAData(collegeInfo);
        setCollegeAAnalytics(analytics);
        console.log('College A data:', collegeInfo, analytics);
      } catch (error) {
        console.error('Error fetching college A data:', error);
      }
    };

    fetchCollegeAData();
  }, [collegeA, selectedYear]);

  // Fetch college B data with year filtering
  useEffect(() => {
    const fetchCollegeBData = async () => {
      if (!collegeB) {
        setCollegeBData(null);
        setCollegeBAnalytics(null);
        return;
      }

      try {
        console.log('Fetching data for college B:', collegeB, 'Year:', selectedYear);
        const [collegeInfo, analytics] = await Promise.all([
          getCollegeById(collegeB),
          getCollegeAnalytics(collegeB, selectedYear)
        ]);
        setCollegeBData(collegeInfo);
        setCollegeBAnalytics(analytics);
        console.log('College B data:', collegeInfo, analytics);
      } catch (error) {
        console.error('Error fetching college B data:', error);
      }
    };

    fetchCollegeBData();
  }, [collegeB, selectedYear]);

  // Enhanced comparison data processing
  const comparisonData = useMemo(() => {
    if (!collegeAAnalytics || !collegeBAnalytics) return [];
    
    return [
      {
        metric: 'Placement Rate (%)',
        collegeA: collegeAAnalytics.placementRate || 0,
        collegeB: collegeBAnalytics.placementRate || 0,
        unit: '%'
      },
      {
        metric: 'Avg Package (LPA)',
        collegeA: collegeAAnalytics.avgPackage || 0,
        collegeB: collegeBAnalytics.avgPackage || 0,
        unit: 'LPA'
      },
      {
        metric: 'Highest Package (LPA)',
        collegeA: collegeAAnalytics.highestPackage || 0,
        collegeB: collegeBAnalytics.highestPackage || 0,
        unit: 'LPA'
      },
      {
        metric: 'Total Students',
        collegeA: collegeAAnalytics.totalStudents || 0,
        collegeB: collegeBAnalytics.totalStudents || 0,
        unit: ''
      },
      {
        metric: 'Total Companies',
        collegeA: collegeAAnalytics.totalCompanies || 0,
        collegeB: collegeBAnalytics.totalCompanies || 0,
        unit: ''
      }
    ];
  }, [collegeAAnalytics, collegeBAnalytics]);

  // Radar chart data for comprehensive comparison
  const radarData = useMemo(() => {
    if (!collegeAAnalytics || !collegeBAnalytics) return [];
    
    const normalizeValue = (value: number, max: number) => Math.min((value / max) * 100, 100);
    
    return [
      {
        subject: 'Placement Rate',
        collegeA: collegeAAnalytics.placementRate || 0,
        collegeB: collegeBAnalytics.placementRate || 0,
        fullMark: 100
      },
      {
        subject: 'Avg Package',
        collegeA: normalizeValue(collegeAAnalytics.avgPackage || 0, 30),
        collegeB: normalizeValue(collegeBAnalytics.avgPackage || 0, 30),
        fullMark: 100
      },
      {
        subject: 'Industry Reach',
        collegeA: normalizeValue(collegeAAnalytics.totalCompanies || 0, 50),
        collegeB: normalizeValue(collegeBAnalytics.totalCompanies || 0, 50),
        fullMark: 100
      },
      {
        subject: 'Student Volume',
        collegeA: normalizeValue(collegeAAnalytics.totalStudents || 0, 500),
        collegeB: normalizeValue(collegeBAnalytics.totalStudents || 0, 500),
        fullMark: 100
      }
    ];
  }, [collegeAAnalytics, collegeBAnalytics]);

  // Branch comparison data
  const branchComparisonData = useMemo(() => {
    if (!collegeAAnalytics?.branchWise || !collegeBAnalytics?.branchWise) return [];
    
    const branchesA = collegeAAnalytics.branchWise || [];
    const branchesB = collegeBAnalytics.branchWise || [];
    
    const allBranches = [...new Set([
      ...branchesA.map((b: any) => b.branch),
      ...branchesB.map((b: any) => b.branch)
    ])];
    
    return allBranches.map(branch => {
      const branchA = branchesA.find((b: any) => b.branch === branch);
      const branchB = branchesB.find((b: any) => b.branch === branch);
      
      return {
        branch,
        collegeA: branchA?.placementRate || 0,
        collegeB: branchB?.placementRate || 0
      };
    });
  }, [collegeAAnalytics, collegeBAnalytics]);

  const exportComparison = () => {
    if (!collegeAData || !collegeBData || !collegeAAnalytics || !collegeBAnalytics) return;
    
    const csvContent = [
      ['Metric', collegeAData.name || 'College A', collegeBData.name || 'College B'],
      ['Total Students', collegeAAnalytics.totalStudents || 0, collegeBAnalytics.totalStudents || 0],
      ['Placed Students', collegeAAnalytics.placedStudents || 0, collegeBAnalytics.placedStudents || 0],
      ['Placement Rate (%)', collegeAAnalytics.placementRate || 0, collegeBAnalytics.placementRate || 0],
      ['Average Package (LPA)', collegeAAnalytics.avgPackage || 0, collegeBAnalytics.avgPackage || 0],
      ['Highest Package (LPA)', collegeAAnalytics.highestPackage || 0, collegeBAnalytics.highestPackage || 0],
      ['Total Companies', collegeAAnalytics.totalCompanies || 0, collegeBAnalytics.totalCompanies || 0]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `college-comparison-${collegeAData.name}-vs-${collegeBData.name}-${Date.now()}.csv`);
  };

  const chartColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  // Advanced Insight Generation
  const generateInsights = useMemo(() => {
    if (!collegeAAnalytics || !collegeBAnalytics || !collegeAData || !collegeBData) return null;

    const insights = {
      winner: {
        overall: null as string | null,
        placement: null as string | null,
        package: null as string | null,
        companies: null as string | null,
        branches: null as string | null
      },
      differences: {
        placementRate: Math.abs((collegeAAnalytics.placementRate || 0) - (collegeBAnalytics.placementRate || 0)),
        avgPackage: Math.abs((collegeAAnalytics.avgPackage || 0) - (collegeBAnalytics.avgPackage || 0)),
        totalCompanies: Math.abs((collegeAAnalytics.totalCompanies || 0) - (collegeBAnalytics.totalCompanies || 0))
      },
      strengths: {
        collegeA: [] as string[],
        collegeB: [] as string[]
      },
      recommendations: {
        collegeA: [] as string[],
        collegeB: [] as string[]
      },
      marketPosition: {
        collegeA: '',
        collegeB: ''
      }
    };

    // Determine winners
    insights.winner.placement = (collegeAAnalytics.placementRate || 0) > (collegeBAnalytics.placementRate || 0) ? collegeAData.name : collegeBData.name;
    insights.winner.package = (collegeAAnalytics.avgPackage || 0) > (collegeBAnalytics.avgPackage || 0) ? collegeAData.name : collegeBData.name;
    insights.winner.companies = (collegeAAnalytics.totalCompanies || 0) > (collegeBAnalytics.totalCompanies || 0) ? collegeAData.name : collegeBData.name;

    // Calculate overall winner based on weighted score
    const scoreA = (collegeAAnalytics.placementRate || 0) * 0.4 + 
                   ((collegeAAnalytics.avgPackage || 0) / 30) * 100 * 0.3 + 
                   ((collegeAAnalytics.totalCompanies || 0) / 50) * 100 * 0.3;
    const scoreB = (collegeBAnalytics.placementRate || 0) * 0.4 + 
                   ((collegeBAnalytics.avgPackage || 0) / 30) * 100 * 0.3 + 
                   ((collegeBAnalytics.totalCompanies || 0) / 50) * 100 * 0.3;
    
    insights.winner.overall = scoreA > scoreB ? collegeAData.name : collegeBData.name;

    // Identify strengths
    if ((collegeAAnalytics.placementRate || 0) > 85) {
      insights.strengths.collegeA.push('Excellent placement rate');
    }
    if ((collegeAAnalytics.avgPackage || 0) > 12) {
      insights.strengths.collegeA.push('High average packages');
    }
    if ((collegeAAnalytics.totalCompanies || 0) > 30) {
      insights.strengths.collegeA.push('Strong industry connections');
    }

    if ((collegeBAnalytics.placementRate || 0) > 85) {
      insights.strengths.collegeB.push('Excellent placement rate');
    }
    if ((collegeBAnalytics.avgPackage || 0) > 12) {
      insights.strengths.collegeB.push('High average packages');
    }
    if ((collegeBAnalytics.totalCompanies || 0) > 30) {
      insights.strengths.collegeB.push('Strong industry connections');
    }

    // Generate recommendations
    if ((collegeAAnalytics.placementRate || 0) < 70) {
      insights.recommendations.collegeA.push('Focus on improving placement rates through enhanced industry partnerships');
    }
    if ((collegeAAnalytics.avgPackage || 0) < 8) {
      insights.recommendations.collegeA.push('Work on attracting higher-paying companies for better packages');
    }
    if ((collegeAAnalytics.totalCompanies || 0) < 20) {
      insights.recommendations.collegeA.push('Expand corporate recruitment network');
    }

    if ((collegeBAnalytics.placementRate || 0) < 70) {
      insights.recommendations.collegeB.push('Focus on improving placement rates through enhanced industry partnerships');
    }
    if ((collegeBAnalytics.avgPackage || 0) < 8) {
      insights.recommendations.collegeB.push('Work on attracting higher-paying companies for better packages');
    }
    if ((collegeBAnalytics.totalCompanies || 0) < 20) {
      insights.recommendations.collegeB.push('Expand corporate recruitment network');
    }

    // Market positioning
    const positionA = scoreA > 80 ? 'Premium' : scoreA > 60 ? 'Competitive' : 'Developing';
    const positionB = scoreB > 80 ? 'Premium' : scoreB > 60 ? 'Competitive' : 'Developing';
    insights.marketPosition.collegeA = positionA;
    insights.marketPosition.collegeB = positionB;

    return insights;
  }, [collegeAAnalytics, collegeBAnalytics, collegeAData, collegeBData]);

  // Year-based filtering and insights
  const yearBasedInsights = useMemo(() => {
    if (!collegeAAnalytics || !collegeBAnalytics) return null;

    const currentYear = parseInt(selectedYear);
    const insights = {
      trend: '',
      yearPerformance: {
        collegeA: '',
        collegeB: ''
      },
      futureProjection: '',
      industryAlignment: ''
    };

    // Generate year-specific insights
    if (currentYear === 2024) {
      insights.trend = 'Latest placement data shows current market conditions and industry demands';
      insights.futureProjection = 'Based on 2024 trends, expect continued growth in tech placements';
    } else if (currentYear === 2023) {
      insights.trend = 'Post-pandemic recovery period with stabilizing placement rates';
      insights.futureProjection = 'Historical data indicates steady improvement trajectory';
    } else {
      insights.trend = 'Historical baseline data for trend analysis';
      insights.futureProjection = 'Foundational performance metrics for comparison';
    }

    return insights;
  }, [selectedYear, collegeAAnalytics, collegeBAnalytics]);

  // Category-specific insights
  const categoryInsights = useMemo(() => {
    if (!collegeAAnalytics || !collegeBAnalytics) return null;

    const insights: any = {};

    switch (comparisonCategory) {
      case 'overall':
        insights.focus = 'Comprehensive performance analysis across all metrics';
        insights.keyMetric = 'Overall placement success and industry readiness';
        insights.recommendation = 'Consider both placement rates and package quality for holistic comparison';
        break;
      case 'branch':
        insights.focus = 'Academic department performance and specialization strength';
        insights.keyMetric = 'Branch-wise placement rates and industry alignment';
        insights.recommendation = 'Choose based on your academic interests and branch performance';
        break;
      case 'package':
        insights.focus = 'Salary expectations and financial outcomes analysis';
        insights.keyMetric = 'Package distribution and earning potential';
        insights.recommendation = 'Consider package consistency and growth potential, not just averages';
        break;
      case 'companies':
        insights.focus = 'Industry connections and recruitment diversity';
        insights.keyMetric = 'Company variety and recruitment strength';
        insights.recommendation = 'Look for diverse company portfolio and strong industry relationships';
        break;
    }

    return insights;
  }, [comparisonCategory, collegeAAnalytics, collegeBAnalytics]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Compare Colleges</h1>
          <p className="text-muted-foreground">Side-by-side comparison of placement statistics</p>
        </div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitCompare className="h-5 w-5 text-primary" />
                <span>Advanced College Comparison</span>
              </CardTitle>
              <CardDescription>Select colleges from your database and customize comparison filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    College A
                  </Label>
                  <Select value={collegeA} onValueChange={setCollegeA} disabled={loading}>
                    <SelectTrigger className="glass-effect border-white/20">
                      <SelectValue placeholder={loading ? "Loading colleges..." : "Select College A"} />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map(college => (
                        <SelectItem key={college.id} value={college.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{college.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {college.placementRate?.toFixed(1) || '0'}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    College B
                  </Label>
                  <Select value={collegeB} onValueChange={setCollegeB} disabled={loading}>
                    <SelectTrigger className="glass-effect border-white/20">
                      <SelectValue placeholder={loading ? "Loading colleges..." : "Select College B"} />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map(college => (
                        <SelectItem key={college.id} value={college.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{college.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {college.placementRate?.toFixed(1) || '0'}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    Comparison Category
                  </Label>
                  <Select value={comparisonCategory} onValueChange={setComparisonCategory}>
                    <SelectTrigger className="glass-effect border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall Performance</SelectItem>
                      <SelectItem value="branch">Branch-wise Analysis</SelectItem>
                      <SelectItem value="package">Package Analysis</SelectItem>
                      <SelectItem value="companies">Company Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Academic Year
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="glass-effect border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Data Till Date</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Quick Stats Preview */}
              {colleges.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span className="font-medium">Available Colleges: {colleges.length}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Avg Placement Rate: {(colleges.reduce((sum, c) => sum + (c.placementRate || 0), 0) / colleges.length).toFixed(1)}%</span>
                      <span>Avg Package: ₹{(colleges.reduce((sum, c) => sum + (c.avgPackage || 0), 0) / colleges.length).toFixed(1)}L</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Comparison Results */}
        <AnimatePresence>
          {collegeA && collegeB && collegeAData && collegeBData && collegeAAnalytics && collegeBAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* College Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-effect border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-blue-400">{collegeAData.name}</h3>
                          <p className="text-sm text-muted-foreground">{collegeAData.location}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          College A
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{collegeAAnalytics.placementRate?.toFixed(1) || 0}%</p>
                          <p className="text-xs text-muted-foreground">Placement Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">₹{collegeAAnalytics.avgPackage?.toFixed(1) || 0}L</p>
                          <p className="text-xs text-muted-foreground">Avg Package</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass-effect border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-purple-400">{collegeBData.name}</h3>
                          <p className="text-sm text-muted-foreground">{collegeBData.location}</p>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          College B
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">{collegeBAnalytics.placementRate?.toFixed(1) || 0}%</p>
                          <p className="text-xs text-muted-foreground">Placement Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">₹{collegeBAnalytics.avgPackage?.toFixed(1) || 0}L</p>
                          <p className="text-xs text-muted-foreground">Avg Package</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Tabbed Comparison Views */}
              <Tabs value={comparisonCategory} onValueChange={setComparisonCategory} className="mb-8">
                <TabsList className="grid w-full grid-cols-4 glass-effect">
                  <TabsTrigger value="overall" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Overall
                  </TabsTrigger>
                  <TabsTrigger value="branch" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Branches
                  </TabsTrigger>
                  <TabsTrigger value="package" className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Packages
                  </TabsTrigger>
                  <TabsTrigger value="companies" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Companies
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overall" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Overall Metrics Bar Chart */}
                    <Card className="glass-effect border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Overall Performance Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                              dataKey="metric" 
                              stroke="#888" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                              }}
                              formatter={(value: any, name: string, props: any) => {
                                const unit = props.payload?.unit || '';
                                const collegeName = name === 'collegeA' ? collegeAData?.name : collegeBData?.name;
                                return [`${value}${unit}`, collegeName];
                              }}
                            />
                            <Bar 
                              dataKey="collegeA" 
                              fill="#3B82F6" 
                              name="collegeA"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="collegeB" 
                              fill="#8B5CF6" 
                              name="collegeB"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Radar Chart */}
                    <Card className="glass-effect border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Performance Radar
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#888' }} />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 100]} 
                              tick={{ fontSize: 10, fill: '#888' }}
                            />
                            <Radar
                              name={collegeAData.name}
                              dataKey="collegeA"
                              stroke="#3B82F6"
                              fill="#3B82F6"
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                            <Radar
                              name={collegeBData.name}
                              dataKey="collegeB"
                              stroke="#8B5CF6"
                              fill="#8B5CF6"
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white'
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Students', valueA: collegeAAnalytics.totalStudents, valueB: collegeBAnalytics.totalStudents, icon: Users },
                      { label: 'Placed', valueA: collegeAAnalytics.placedStudents, valueB: collegeBAnalytics.placedStudents, icon: TrendingUp },
                      { label: 'Companies', valueA: collegeAAnalytics.totalCompanies, valueB: collegeBAnalytics.totalCompanies, icon: Building2 },
                      { label: 'Highest Package', valueA: collegeAAnalytics.highestPackage, valueB: collegeBAnalytics.highestPackage, icon: Trophy, suffix: 'L' }
                    ].map((metric, index) => (
                      <Card key={index} className="glass-effect border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <metric.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{metric.label}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-blue-400">A</span>
                              <span className="font-bold text-blue-400">
                                {metric.suffix === 'L' ? '₹' : ''}{metric.valueA?.toFixed(metric.suffix === 'L' ? 1 : 0) || 0}{metric.suffix || ''}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-purple-400">B</span>
                              <span className="font-bold text-purple-400">
                                {metric.suffix === 'L' ? '₹' : ''}{metric.valueB?.toFixed(metric.suffix === 'L' ? 1 : 0) || 0}{metric.suffix || ''}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="branch" className="space-y-6">
                  <Card className="glass-effect border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Branch-wise Placement Comparison
                      </CardTitle>
                      <CardDescription>
                        Compare placement rates across different academic branches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={branchComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="branch" 
                            stroke="#888" 
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.9)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: 'white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                            formatter={(value: any, name: string) => {
                              const collegeName = name === 'collegeA' ? collegeAData?.name : collegeBData?.name;
                              return [`${value.toFixed(1)}%`, collegeName];
                            }}
                          />
                          <Bar 
                            dataKey="collegeA" 
                            fill="#3B82F6" 
                            name="collegeA"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            dataKey="collegeB" 
                            fill="#8B5CF6" 
                            name="collegeB"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="package" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Package Distribution Comparison */}
                    <Card className="glass-effect border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IndianRupee className="h-5 w-5 text-primary" />
                          Package Distribution - {collegeAData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={collegeAAnalytics.packageDistribution || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {(collegeAAnalytics.packageDistribution || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(254, 253, 253, 0.95)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                color: '#ffffff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                padding: '8px 12px',
                                fontSize: '14px'
                              }}
                              formatter={(value: any, name: string) => [
                                `${value} students`,
                                name
                              ]}
                              labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IndianRupee className="h-5 w-5 text-primary" />
                          Package Distribution - {collegeBData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={collegeBAnalytics.packageDistribution || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {(collegeBAnalytics.packageDistribution || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                color: '#ffffff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                padding: '8px 12px',
                                fontSize: '14px'
                              }}
                              formatter={(value: any, name: string) => [
                                `${value} students`,
                                name
                              ]}
                              labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="companies" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Companies Comparison */}
                    <Card className="glass-effect border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          Top Companies - {collegeAData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {(collegeAAnalytics.companyWise || []).slice(0, 10).map((company: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <span className="font-medium">{company.company}</span>
                              <Badge className="bg-blue-500/20 text-blue-400">
                                {company.count} students
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          Top Companies - {collegeBData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {(collegeBAnalytics.companyWise || []).slice(0, 10).map((company: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <span className="font-medium">{company.company}</span>
                              <Badge className="bg-purple-500/20 text-purple-400">
                                {company.count} students
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Advanced Insights Panel */}
              {generateInsights && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mb-8"
                >
                  <Card className="glass-effect border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Overall Analysis
                      </CardTitle>
                      <CardDescription>
                        {categoryInsights?.focus} - {selectedYear} Academic Year Analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Winner Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">Overall Winner</span>
                          </div>
                          <p className="text-lg font-bold">{generateInsights.winner.overall}</p>
                          <p className="text-xs text-muted-foreground">Based on weighted performance score</p>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="font-semibold text-green-400">Placement Leader</span>
                          </div>
                          <p className="text-lg font-bold">{generateInsights.winner.placement}</p>
                          <p className="text-xs text-muted-foreground">Highest placement rate</p>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <IndianRupee className="h-4 w-4 text-blue-400" />
                            <span className="font-semibold text-blue-400">Package Leader</span>
                          </div>
                          <p className="text-lg font-bold">{generateInsights.winner.package}</p>
                          <p className="text-xs text-muted-foreground">Higher average packages</p>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-purple-400" />
                            <span className="font-semibold text-purple-400">Industry Leader</span>
                          </div>
                          <p className="text-lg font-bold">{generateInsights.winner.companies}</p>
                          <p className="text-xs text-muted-foreground">More company partnerships</p>
                        </div>
                      </div>

                      {/* Detailed Insights Based on Level */}
                      {insightLevel === 'detailed' || insightLevel === 'advanced' || insightLevel === 'predictive' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Strengths Analysis */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                              <Award className="h-5 w-5 text-primary" />
                              Key Strengths Analysis
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <h5 className="font-medium text-blue-400 mb-2">{collegeAData.name}</h5>
                                <div className="space-y-1">
                                  {generateInsights.strengths.collegeA.length > 0 ? (
                                    generateInsights.strengths.collegeA.map((strength: string, index: number) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <Star className="h-3 w-3 text-blue-400" />
                                        <span>{strength}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">Focus on building core competencies</p>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <Badge className="bg-blue-500/20 text-blue-400">
                                    {generateInsights.marketPosition.collegeA} Tier
                                  </Badge>
                                </div>
                              </div>

                              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                <h5 className="font-medium text-purple-400 mb-2">{collegeBData.name}</h5>
                                <div className="space-y-1">
                                  {generateInsights.strengths.collegeB.length > 0 ? (
                                    generateInsights.strengths.collegeB.map((strength: string, index: number) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <Star className="h-3 w-3 text-purple-400" />
                                        <span>{strength}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">Focus on building core competencies</p>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <Badge className="bg-purple-500/20 text-purple-400">
                                    {generateInsights.marketPosition.collegeB} Tier
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Performance Gaps & Recommendations */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              Performance Gaps & Recommendations
                            </h4>
                            
                            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                              <h5 className="font-medium text-indigo-400 mb-3">Key Differences</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Placement Rate Gap:</span>
                                  <span className="font-bold">{generateInsights.differences.placementRate.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Package Difference:</span>
                                  <span className="font-bold">₹{generateInsights.differences.avgPackage.toFixed(1)}L</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Company Network Gap:</span>
                                  <span className="font-bold">{generateInsights.differences.totalCompanies} companies</span>
                                </div>
                              </div>
                            </div>

                            {/* Category-Specific Insights */}
                            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-teal-600/10 border border-green-500/20">
                              <h5 className="font-medium text-green-400 mb-2">Category Focus: {comparisonCategory.charAt(0).toUpperCase() + comparisonCategory.slice(1)}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{categoryInsights?.keyMetric}</p>
                              <p className="text-sm">{categoryInsights?.recommendation}</p>
                            </div>

                            {/* Year-Based Insights */}
                            {yearBasedInsights && (
                              <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/20">
                                <h5 className="font-medium text-orange-400 mb-2">{selectedYear} Market Context</h5>
                                <p className="text-sm text-muted-foreground mb-2">{yearBasedInsights.trend}</p>
                                <p className="text-sm">{yearBasedInsights.futureProjection}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Advanced & Predictive Insights */}
                      {(insightLevel === 'advanced' || insightLevel === 'predictive') && (
                        <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-600/10 border border-violet-500/20">
                          <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
                            <Briefcase className="h-5 w-5 text-primary" />
                            {insightLevel === 'predictive' ? 'Predictive Analysis & Future Trends' : 'Advanced Strategic Insights'}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-violet-400 mb-2">Strategic Recommendations</h5>
                              <div className="space-y-2">
                                {generateInsights.recommendations.collegeA.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-blue-400">{collegeAData.name}:</p>
                                    {generateInsights.recommendations.collegeA.map((rec: string, index: number) => (
                                      <p key={index} className="text-xs text-muted-foreground ml-2">• {rec}</p>
                                    ))}
                                  </div>
                                )}
                                {generateInsights.recommendations.collegeB.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-purple-400">{collegeBData.name}:</p>
                                    {generateInsights.recommendations.collegeB.map((rec: string, index: number) => (
                                      <p key={index} className="text-xs text-muted-foreground ml-2">• {rec}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {insightLevel === 'predictive' && (
                              <div>
                                <h5 className="font-medium text-violet-400 mb-2">Future Outlook</h5>
                                <div className="space-y-2 text-sm">
                                  <p>• Industry 4.0 alignment will favor tech-focused programs</p>
                                  <p>• Remote work trends may impact location-based advantages</p>
                                  <p>• Skill-based hiring will emphasize practical training</p>
                                  <p>• Startup ecosystem growth creates new opportunities</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Export and Actions */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={exportComparison}
                  className="glass-effect border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Comparison
                </Button>
                <Button
                  onClick={() => {
                    setCollegeA('');
                    setCollegeB('');
                  }}
                  variant="outline"
                  className="glass-effect border-white/20 hover:border-white/30"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  New Comparison
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Empty State */}
        {(!collegeA || !collegeB) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-white/10">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Advanced College Comparison
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Select two colleges from your database to see comprehensive side-by-side analytics including placement rates, package distributions, branch performance, and company insights.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Interactive Charts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Radar Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Performance Metrics</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading colleges from database...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;