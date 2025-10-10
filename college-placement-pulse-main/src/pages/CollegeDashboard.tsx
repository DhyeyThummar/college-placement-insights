import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Users, GraduationCap, Building2, Award, Download, 
  MapPin, Calendar, Star, Briefcase, DollarSign, ArrowLeft, Loader2
} from "lucide-react";
import { getCollegeById, getCollegeAnalytics, type CollegeWithPlacement } from "@/services/mongodb";

const CollegeDashboard = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [college, setCollege] = useState<CollegeWithPlacement | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear] = useState("2024");

  useEffect(() => {
    const fetchCollegeData = async () => {
      if (!collegeId) {
        setError('No college ID provided');
        setLoading(false);
        return;
      }
      
      console.log('Fetching data for college ID:', collegeId);
      setLoading(true);
      setError(null);
      
      try {
        const [collegeData, analyticsData] = await Promise.all([
          getCollegeById(collegeId),
          getCollegeAnalytics(collegeId)
        ]);
        
        console.log('College data:', collegeData);
        console.log('Analytics data:', analyticsData);
        
        if (!collegeData) {
          setError(`College with ID "${collegeId}" not found`);
        } else {
          setCollege(collegeData);
          setAnalytics(analyticsData);
        }
        
        if (!analyticsData) {
          console.warn('No analytics data received for college:', collegeId);
        } else if (analyticsData.totalStudents === 0) {
          console.warn('Analytics received but no students found for college:', collegeId);
        }
      } catch (error) {
        console.error('Error fetching college data:', error);
        setError(`Failed to load college data: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeData();
  }, [collegeId]);

  const branchWiseData = useMemo(() => {
    if (!analytics?.branchWise) return [];
    
    return analytics.branchWise.map((branch: any) => ({
      branch: branch.branch,
      total_students: branch.totalStudents,
      placed_students: branch.placedStudents,
      placement_rate: branch.placementRate,
      average_package: branch.avgPackage,
      highest_package: branch.highestPackage,
      placementRate: branch.placementRate
    }));
  }, [analytics]);

  const packageDistribution = useMemo(() => {
    if (!analytics?.packageDistribution) return [];
    
    return analytics.packageDistribution.map((range: any) => ({
      range: range.range,
      count: range.count
    }));
  }, [analytics]);

  const companyWiseData = useMemo(() => {
    if (!analytics?.companyWise) return [];
    
    return analytics.companyWise.slice(0, 10); // Top 10 companies
  }, [analytics]);

  const yearWiseData = useMemo(() => {
    if (!analytics?.yearWise) return [];
    
    return analytics.yearWise.map((year: any) => ({
      year: year.year,
      totalStudents: year.totalStudents,
      placedStudents: year.placedStudents,
      placementRate: year.placementRate,
      avgPackage: year.avgPackage
    }));
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading college dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
            <Button onClick={() => navigate("/colleges")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Colleges
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">College Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested college dashboard could not be found.
          </p>
          <Button onClick={() => navigate("/colleges")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </Button>
        </Card>
      </div>
    );
  }

  const stats = analytics;
  const chartColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-gray-800 rounded text-white text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>College ID: {collegeId}</p>
          <p>College Data: {college ? 'Loaded' : 'Not loaded'}</p>
          <p>Analytics Data: {analytics ? 'Loaded' : 'Not loaded'}</p>
          <p>Total Students: {analytics?.totalStudents || 'N/A'}</p>
          <p>Error: {error || 'None'}</p>
        </div>

        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button 
            onClick={() => navigate("/colleges")}
            variant="outline"
            className="mb-4 glass-effect border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Colleges
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {college?.name || 'Loading...'}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {college?.location || 'Loading...'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Academic Year {selectedYear}
                </span>
                {college?.code && (
                  <Badge variant="outline">{college.code}</Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {!analytics || analytics.totalStudents === 0 ? (
          <Card className="p-8 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Placement Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Placement data for this college is not currently available. Please upload placement data through the admin dashboard.
            </p>
            <Button onClick={() => navigate("/admin")} variant="outline">
              Go to Admin Dashboard
            </Button>
          </Card>
        ) : (
          <>
            {/* Key Statistics */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              <Card className="glass-effect border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold text-blue-400">{stats?.totalStudents || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Placed Students</p>
                      <p className="text-3xl font-bold text-green-400">{stats?.placedStudents || 0}</p>
                      <p className="text-sm text-green-300">{stats?.placementRate ? stats.placementRate.toFixed(1) : 0}% rate</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Package</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        ₹{stats?.avgPackage ? stats.avgPackage.toFixed(1) : 0}L
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Highest Package</p>
                      <p className="text-3xl font-bold text-purple-400">
                        ₹{stats?.highestPackage ? stats.highestPackage.toFixed(1) : 0}L
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Simple Data Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Branch-wise Data */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Branch-wise Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {branchWiseData.length > 0 ? (
                    <div className="space-y-4">
                      {branchWiseData.map((branch, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                          <div>
                            <p className="font-semibold">{branch.branch}</p>
                            <p className="text-sm text-gray-400">
                              {branch.total_students} students, {branch.placed_students} placed
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">{branch.placementRate.toFixed(1)}%</p>
                            <p className="text-sm text-gray-400">₹{branch.average_package.toFixed(1)}L avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No branch data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Company-wise Data */}
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Top Recruiting Companies
                  </CardTitle>
                  <CardDescription>
                    Companies with highest student placements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {companyWiseData.length > 0 ? (
                    <div className="space-y-4">
                      {companyWiseData.map((company, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{company.company}</p>
                              <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-400 text-lg">{company.count}</p>
                            <p className="text-xs text-muted-foreground">students</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Summary Stats */}
                      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-400">
                              {companyWiseData.reduce((sum, company) => sum + company.count, 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Placements</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-400">{companyWiseData.length}</p>
                            <p className="text-xs text-muted-foreground">Active Companies</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No company data available</p>
                      <p className="text-sm text-muted-foreground mt-1">Upload placement data to see company statistics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Package Distribution */}
            <Card className="glass-effect border-white/10 mb-8">
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {packageDistribution.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {packageDistribution.map((range, index) => (
                      <div key={index} className="text-center p-4 bg-gray-800 rounded">
                        <p className="font-semibold text-purple-400">{range.range}</p>
                        <p className="text-2xl font-bold">{range.count}</p>
                        <p className="text-sm text-gray-400">students</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No package distribution data available</p>
                )}
              </CardContent>
            </Card>

            {/* Old Charts Grid - Commented Out */}
            <div className="hidden">
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"> */}
              {/* Branch-wise Placement Chart */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-effect border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Branch-wise Placement Rate
                    </CardTitle>
                    <CardDescription>
                      Placement success rate across different branches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={branchWiseData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="branch" 
                          stroke="#888"
                          fontSize={12}
                          tickFormatter={(value) => value.split(' ')[0]}
                        />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'Placement Rate']}
                        />
                        <Bar 
                          dataKey="placementRate" 
                          fill="url(#branchGradient)" 
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Package Distribution Chart */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-effect border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Package Distribution
                    </CardTitle>
                    <CardDescription>
                      Average, median, and highest packages by branch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={packageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="branch" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value: any, name: string) => [
                            `₹${value.toFixed(1)}L`, 
                            name === 'avg' ? 'Average' : name === 'highest' ? 'Highest' : 'Median'
                          ]}
                        />
                        <Bar dataKey="avg" stackId="a" fill="#8B5CF6" />
                        <Bar dataKey="highest" stackId="b" fill="#06B6D4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Branch Details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Branch-wise Details
                  </CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of placement statistics by branch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {branchWiseData.map((branch, index) => (
                      <Card key={branch.branch} className="glass-effect border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-sm">{branch.branch}</h4>
                            <Badge 
                              style={{ 
                                backgroundColor: `${chartColors[index % chartColors.length]}20`,
                                color: chartColors[index % chartColors.length],
                                border: `1px solid ${chartColors[index % chartColors.length]}30`
                              }}
                            >
                              {branch.placementRate.toFixed(1)}%
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Students:</span>
                              <span>{branch.placed_students}/{branch.total_students}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg Package:</span>
                              <span>₹{(branch.average_package / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Highest:</span>
                              <span>₹{(branch.highest_package / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Companies:</span>
                              <span>{branch.companies.length}</span>
                            </div>
                          </div>

                          <Separator className="my-3" />
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Top Recruiters:</p>
                            <div className="flex flex-wrap gap-1">
                              {branch.companies.slice(0, 3).map((company) => (
                                <Badge key={company} variant="outline" className="text-xs">
                                  {company}
                                </Badge>
                              ))}
                              {branch.companies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{branch.companies.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollegeDashboard;