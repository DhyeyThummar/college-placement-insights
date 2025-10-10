import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, GraduationCap, Building2, Award, 
  MapPin, Calendar, DollarSign, ArrowLeft, Loader2,
  BarChart3, PieChart, Target, Briefcase, Star, Trophy
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area
} from "recharts";
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

  const companyWiseData = useMemo(() => {
    if (!analytics?.companyWise) return [];
    
    return analytics.companyWise.slice(0, 10); // Top 10 companies
  }, [analytics]);

  const packageDistribution = useMemo(() => {
    if (!analytics?.packageDistribution) return [];
    
    return analytics.packageDistribution.map((range: any) => ({
      range: range.range,
      count: range.count
    }));
  }, [analytics]);

  // Enhanced data processing for charts
  const chartColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B', '#EC4899'];
  
  const placementStatusData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'Placed', value: analytics.placedStudents || 0, color: '#10B981' },
      { name: 'Not Placed', value: (analytics.totalStudents || 0) - (analytics.placedStudents || 0), color: '#EF4444' }
    ];
  }, [analytics]);

  const topCompanies = useMemo(() => {
    if (!companyWiseData.length) return [];
    return companyWiseData.slice(0, 8).map((company, index) => ({
      ...company,
      color: chartColors[index % chartColors.length]
    }));
  }, [companyWiseData]);

  const branchPerformance = useMemo(() => {
    if (!branchWiseData.length) return [];
    return branchWiseData.map((branch, index) => ({
      ...branch,
      color: chartColors[index % chartColors.length],
      efficiency: branch.placementRate > 80 ? 'High' : branch.placementRate > 60 ? 'Medium' : 'Low'
    }));
  }, [branchWiseData]);

  const packageTrends = useMemo(() => {
    if (!packageDistribution.length) return [];
    return packageDistribution.map((pkg, index) => ({
      ...pkg,
      percentage: analytics?.totalStudents ? ((pkg.count / analytics.totalStudents) * 100).toFixed(1) : 0,
      color: chartColors[index % chartColors.length]
    }));
  }, [packageDistribution, analytics]);

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

            {/* Enhanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Placement Status Pie Chart */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-effect border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Placement Overview
                    </CardTitle>
                    <CardDescription>
                      Overall placement distribution for {selectedYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={placementStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {placementStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value: any, name: string) => [
                            `${value} students (${((value / (analytics?.totalStudents || 1)) * 100).toFixed(1)}%)`,
                            name
                          ]}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      {placementStatusData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm">{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Branch-wise Performance Chart */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-effect border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Branch-wise Placement Rate
                    </CardTitle>
                    <CardDescription>
                      Placement success rate across different branches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={branchPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="branch" 
                          stroke="#888"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
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
            </div>

            {/* Package Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Package Distribution Chart */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Package Distribution Analysis
                    </CardTitle>
                    <CardDescription>
                      Salary range distribution among placed students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={packageTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="range" 
                          stroke="#888"
                          fontSize={12}
                        />
                        <YAxis stroke="#888" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value: any, name: string) => [
                            `${value} students (${packageTrends.find(p => p.count === value)?.percentage}%)`,
                            'Students'
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#8B5CF6"
                          fill="url(#packageGradient)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="packageGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Package Insights */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Package Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold text-yellow-400">Highest Package</span>
                      </div>
                      <p className="text-2xl font-bold">₹{stats?.highestPackage ? stats.highestPackage.toFixed(1) : 0}L</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-400">Average Package</span>
                      </div>
                      <p className="text-2xl font-bold">₹{stats?.avgPackage ? stats.avgPackage.toFixed(1) : 0}L</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold text-blue-400">Total Companies</span>
                      </div>
                      <p className="text-2xl font-bold">{analytics?.totalCompanies || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Company Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Top Recruiting Companies */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Top Recruiting Companies
                    </CardTitle>
                    <CardDescription>
                      Companies with highest student intake
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topCompanies} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#888" fontSize={12} />
                        <YAxis 
                          type="category" 
                          dataKey="company" 
                          stroke="#888" 
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          formatter={(value: any) => [`${value} students`, 'Hired']}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="url(#companyGradient)" 
                          radius={[0, 4, 4, 0]}
                        />
                        <defs>
                          <linearGradient id="companyGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#06B6D4" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Branch Performance Insights */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="glass-effect border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Branch Performance Analysis
                    </CardTitle>
                    <CardDescription>
                      Detailed breakdown by academic branch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {branchPerformance.map((branch, index) => (
                        <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/30 border border-gray-600/30">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{branch.branch}</h4>
                              <p className="text-sm text-gray-400">
                                {branch.total_students} total students
                              </p>
                            </div>
                            <Badge 
                              variant={branch.efficiency === 'High' ? 'default' : branch.efficiency === 'Medium' ? 'secondary' : 'destructive'}
                              className="ml-2"
                            >
                              {branch.efficiency} Performance
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-green-400 font-bold text-xl">{branch.placed_students}</p>
                              <p className="text-gray-400">Placed</p>
                            </div>
                            <div className="text-center">
                              <p className="text-blue-400 font-bold text-xl">{branch.placementRate.toFixed(1)}%</p>
                              <p className="text-gray-400">Success Rate</p>
                            </div>
                            <div className="text-center">
                              <p className="text-yellow-400 font-bold text-xl">₹{branch.average_package.toFixed(1)}L</p>
                              <p className="text-gray-400">Avg Package</p>
                            </div>
                          </div>
                          
                          {/* Progress bar for placement rate */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${branch.placementRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Key Insights and Recommendations */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Key Insights & Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Data-driven insights and recommendations for {college?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Placement Success Rate */}
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="font-semibold text-green-400 mb-2">Placement Success</h3>
                      <p className="text-3xl font-bold mb-2">{stats?.placementRate ? stats.placementRate.toFixed(1) : 0}%</p>
                      <p className="text-sm text-gray-400">
                        {stats?.placementRate > 80 ? 'Excellent' : stats?.placementRate > 60 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </div>

                    {/* Top Performing Branch */}
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Star className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-blue-400 mb-2">Top Branch</h3>
                      <p className="text-lg font-bold mb-2">
                        {branchPerformance.length > 0 ? branchPerformance.sort((a, b) => b.placementRate - a.placementRate)[0]?.branch.split(' ')[0] : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {branchPerformance.length > 0 ? `${branchPerformance.sort((a, b) => b.placementRate - a.placementRate)[0]?.placementRate.toFixed(1)}% placement` : 'No data'}
                      </p>
                    </div>

                    {/* Industry Diversity */}
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-purple-400 mb-2">Industry Reach</h3>
                      <p className="text-3xl font-bold mb-2">{analytics?.totalCompanies || 0}</p>
                      <p className="text-sm text-gray-400">
                        {(analytics?.totalCompanies || 0) > 30 ? 'Diverse' : (analytics?.totalCompanies || 0) > 15 ? 'Moderate' : 'Limited'} network
                      </p>
                    </div>

                    {/* Package Performance */}
                    <div className="text-center p-6 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/20">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-yellow-400" />
                      </div>
                      <h3 className="font-semibold text-yellow-400 mb-2">Package Range</h3>
                      <p className="text-lg font-bold mb-2">
                        ₹{stats?.avgPackage ? stats.avgPackage.toFixed(1) : 0}L - ₹{stats?.highestPackage ? stats.highestPackage.toFixed(1) : 0}L
                      </p>
                      <p className="text-sm text-gray-400">
                        {(stats?.avgPackage || 0) > 12 ? 'Premium' : (stats?.avgPackage || 0) > 8 ? 'Competitive' : 'Standard'} packages
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                    <h4 className="font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Strategic Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-white mb-2">Strengths to Leverage:</h5>
                        <ul className="space-y-1 text-gray-300">
                          {(stats?.placementRate || 0) > 80 && <li>• Excellent overall placement rate</li>}
                          {(stats?.avgPackage || 0) > 10 && <li>• Competitive salary packages</li>}
                          {(analytics?.totalCompanies || 0) > 25 && <li>• Strong industry connections</li>}
                          {branchPerformance.some(b => b.placementRate > 90) && <li>• High-performing academic branches</li>}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-white mb-2">Areas for Improvement:</h5>
                        <ul className="space-y-1 text-gray-300">
                          {(stats?.placementRate || 0) < 70 && <li>• Focus on improving placement rates</li>}
                          {(stats?.avgPackage || 0) < 8 && <li>• Enhance industry partnerships for better packages</li>}
                          {(analytics?.totalCompanies || 0) < 20 && <li>• Expand corporate recruitment network</li>}
                          {branchPerformance.some(b => b.placementRate < 60) && <li>• Support underperforming branches</li>}
                        </ul>
                      </div>
                    </div>
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
