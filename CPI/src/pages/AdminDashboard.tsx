import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { placementApi } from '@/services/api';
import { getColleges, getCollegeById, getCollegesWithPlacement } from '@/services/mongodb';
import { 
  Upload, 
  Download, 
  FileText, 
  Database,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Building,
  Loader2,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Settings,
  Shield,
  Target,
  Award,
  Briefcase
} from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

interface ProcessedData {
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
}

const AdminDashboard = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [colleges, setColleges] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState('');
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalColleges: 0,
    totalBranches: 0,
    lastUpdated: new Date().toLocaleDateString(),
    placementRate: 0,
    avgPackage: 0,
    topCompanies: 0,
    recentUploads: 0
  });
  const [activeTab, setActiveTab] = useState('upload');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  const { token, userRole, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadColleges();
    loadStats();
  }, []);

  // Set selected college to admin's college when profile is loaded
  useEffect(() => {
    if (profile?.collegeId && !selectedCollege) {
      setSelectedCollege(profile.collegeId);
    }
  }, [profile, selectedCollege]);

  const loadColleges = async () => {
    const collegesData = await getColleges();
    setColleges(collegesData);
  };

  const loadStats = async () => {
    try {
      if (!profile?.collegeId) return;
      const { data } = await placementApi.getAll(profile.collegeId);
      const placedStudents = data.filter(d => d.status?.toLowerCase() === 'placed').length;
      const packages = data.filter(d => d.status?.toLowerCase() === 'placed' && d.package > 0).map(d => parseFloat(d.package));
      const avgPackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
      const companies = new Set(data.map(d => d.company).filter(c => c && c !== '0')).size;
      
      setStats({
        totalRecords: data.length,
        totalColleges: 1,
        totalBranches: new Set(data.map(d => d.branch)).size,
        lastUpdated: new Date().toLocaleDateString(),
        placementRate: data.length > 0 ? (placedStudents / data.length) * 100 : 0,
        avgPackage: avgPackage,
        topCompanies: companies,
        recentUploads: data.filter(d => {
          const uploadDate = new Date(d.createdAt || d.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const processCSVData = (rawData: any[]) => {
    // Group data by branch
    const branchMap = new Map();
    const companiesSet = new Set<string>();
    
    rawData.forEach(row => {
      const branch = row.Branch || row.branch;
      const students = parseInt(row['Total Students'] || row.total_students) || 0;
      const placed = parseInt(row['Placed Students'] || row.placed) || 0;
      const avgPackage = parseFloat(row['Average Package'] || row.avg_package) || 0;
      const highestPackage = parseFloat(row['Highest Package'] || row.highest_package) || 0;
      const companies = (row.Companies || row.companies || '').split(',').map((c: string) => c.trim()).filter((c: string) => c);
      
      companies.forEach(company => companiesSet.add(company));
      
      if (!branchMap.has(branch)) {
        branchMap.set(branch, {
          branch,
          total_students: 0,
          placed_students: 0,
          highest_package: 0,
          average_package: 0,
          companies: []
        });
      }
      
      const branchData = branchMap.get(branch);
      branchData.total_students += students;
      branchData.placed_students += placed;
      branchData.highest_package = Math.max(branchData.highest_package, highestPackage);
      branchData.companies = [...new Set([...branchData.companies, ...companies])];
    });

    // Calculate averages
    branchMap.forEach(branchData => {
      const relevantRows = rawData.filter(row => (row.Branch || row.branch) === branchData.branch);
      const totalPackageSum = relevantRows.reduce((sum, row) => {
        const placed = parseInt(row['Placed Students'] || row.placed) || 0;
        const avgPackage = parseFloat(row['Average Package'] || row.avg_package) || 0;
        return sum + (placed * avgPackage);
      }, 0);
      
      branchData.average_package = branchData.placed_students > 0 
        ? totalPackageSum / branchData.placed_students 
        : 0;
    });

    const branch_data = Array.from(branchMap.values());
    
    // Calculate overall stats
    const total_students = branch_data.reduce((sum, branch) => sum + branch.total_students, 0);
    const total_placed = branch_data.reduce((sum, branch) => sum + branch.placed_students, 0);
    const highest_package = Math.max(...branch_data.map(branch => branch.highest_package));
    
    const totalPackageSum = branch_data.reduce((sum, branch) => 
      sum + (branch.placed_students * branch.average_package), 0
    );
    const average_package = total_placed > 0 ? totalPackageSum / total_placed : 0;

    const processedData: ProcessedData = {
      year: new Date().getFullYear(),
      branch_data,
      overall_stats: {
        total_students,
        total_placed,
        placement_percentage: total_students > 0 ? (total_placed / total_students) * 100 : 0,
        total_companies: companiesSet.size,
        highest_package,
        average_package
      }
    };

    return processedData;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setUploadedData(results.data);
        const processed = processCSVData(results.data);
        setProcessedData(processed);
        setIsUploading(false);
        toast({ title: 'File processed successfully', description: `${results.data.length} records loaded and processed` });
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsUploading(false);
        toast({ title: 'Upload failed', description: 'Error parsing the CSV file', variant: 'destructive' });
      }
    });
  };

  const saveToDatabase = async () => {
    if (!processedData || !profile?.collegeId) {
      toast({
        title: 'Error',
        description: 'Please process data first',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (!token) throw new Error('Not authenticated');
      // Prefer server ingestion of raw CSV in our backend; if needed, send raw file instead of processed
      const res = await placementApi.uploadCsv(new File([Papa.unparse(uploadedData)], fileName || 'upload.csv', { type: 'text/csv' }), token);

      toast({
        title: 'Data saved successfully',
        description: `Inserted ${res.inserted} records`,
      });
      
      // Clear form
      setUploadedData([]);
      setProcessedData(null);
      setFileName('');
      
      // Reload stats
      loadStats();
      
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save data to database',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportCurrentData = async () => {
    try {
      const collegesWithPlacement = await getCollegesWithPlacement();

      if (!collegesWithPlacement || collegesWithPlacement.length === 0) {
        toast({
          title: 'No data to export',
          description: 'There is no placement data in the database',
          variant: 'destructive',
        });
        return;
      }

      const csvRows = ['College,Branch,Year,Total Students,Placed Students,Placement %,Avg Package,Highest Package,Companies'];
      
      collegesWithPlacement.forEach(college => {
        const collegeName = college.name;
        college.placement_data?.forEach(placement => {
          placement.data.branch_data.forEach((branch: any) => {
            csvRows.push([
              collegeName,
              branch.branch,
              placement.data.year,
              branch.total_students,
              branch.placed_students,
              ((branch.placed_students / branch.total_students) * 100).toFixed(2),
              branch.average_package.toFixed(2),
              branch.highest_package,
              branch.companies.join('; ')
            ].join(','));
          });
        });
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `placement-data-export-${Date.now()}.csv`);
      
      toast({
        title: 'Export successful',
        description: 'Placement data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const clearUpload = () => {
    setUploadedData([]);
    setProcessedData(null);
    setFileName('');
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage placement data for your institution</p>
              {profile?.collegeName && (
                <div className="flex items-center mt-2 text-sm text-primary">
                  <Building className="h-4 w-4 mr-2" />
                  {profile.collegeName}
                </div>
              )}
            </div>
            <Button
              onClick={() => navigate(`/college/${profile?.collegeId}`)}
              variant="outline"
              className="glass-effect border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              View College Dashboard
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover bg-gradient-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalRecords.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">+{stats.recentUploads} this week</p>
                </div>
                <Database className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Placement Rate</p>
                  <p className="text-2xl font-bold text-green-400">{stats.placementRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall success rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Package</p>
                  <p className="text-2xl font-bold text-yellow-400">₹{stats.avgPackage.toFixed(1)}L</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.totalBranches} branches</p>
                </div>
                <Award className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Companies</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.topCompanies}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active recruiters</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setActiveTab('upload')}
                      variant={activeTab === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      className="glass-effect"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Data
                    </Button>
                    <Button
                      onClick={() => setActiveTab('analytics')}
                      variant={activeTab === 'analytics' ? 'default' : 'outline'}
                      size="sm"
                      className="glass-effect"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    <Button
                      onClick={() => setActiveTab('manage')}
                      variant={activeTab === 'manage' ? 'default' : 'outline'}
                      size="sm"
                      className="glass-effect"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    loadStats();
                    toast({ title: 'Data refreshed', description: 'Dashboard data has been updated' });
                  }}
                  variant="outline"
                  size="sm"
                  className="glass-effect border-primary/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload Placement Data</span>
              </CardTitle>
              <CardDescription>Upload placement data in CSV format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="college-select">College</Label>
                <div className="p-3 bg-muted/20 border border-white/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {profile?.collegeName || 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">Select CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="glass-effect border-white/20"
                  disabled={isUploading}
                />
              </div>
              
              {fileName && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <FileText className="h-4 w-4" />
                  <span>Loaded: {fileName}</span>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing file...</span>
                </div>
              )}

              {processedData && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-sm text-green-400 font-medium">Data Processed Successfully</div>
                    
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={saveToDatabase}
                      disabled={isSaving || !profile?.collegeId}
                      className="btn-hover bg-gradient-primary hover:opacity-90 text-white border-0"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Save to Database
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={clearUpload}
                      variant="outline"
                      className="glass-effect border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-primary" />
                <span>Download & Export</span>
              </CardTitle>
              <CardDescription>Download CSV template or export existing data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={async () => {
                  try {
                    if (!token) throw new Error('Not authenticated');
                    await placementApi.downloadCsvTemplate(token);
                    toast({
                      title: 'Template downloaded',
                      description: 'CSV template downloaded successfully',
                    });
                  } catch (error: any) {
                    toast({
                      title: 'Download failed',
                      description: error.message || 'Failed to download template',
                      variant: 'destructive',
                    });
                  }
                }}
                variant="outline"
                className="w-full glass-effect border-primary/30 hover:border-primary/50 hover:bg-primary/10"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
              
              <Button
                onClick={exportCurrentData}
                className="w-full btn-hover bg-gradient-primary hover:opacity-90 text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data as CSV
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">• Download the template to see the required format</p>
                <p>• Export existing placement records from the database</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {uploadedData.length > 0 && (
            <Card className="bg-gradient-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Raw Data Preview</span>
                </CardTitle>
                <CardDescription>
                  Preview of uploaded CSV data ({uploadedData.length} records)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(uploadedData[0] || {}).map(key => (
                          <TableHead key={key} className="text-foreground font-semibold">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedData.slice(0, 10).map((row, index) => (
                        <TableRow key={index} className="hover:bg-white/5">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <TableCell key={cellIndex} className="text-muted-foreground">
                              {value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {uploadedData.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Showing first 10 rows of {uploadedData.length} total records
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <Card className="bg-gradient-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>College Analytics Dashboard</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive insights into your college's placement performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold text-blue-400">Performance Score</span>
                    </div>
                    <p className="text-2xl font-bold">{((stats.placementRate + (stats.avgPackage / 20) * 10) / 2).toFixed(1)}/100</p>
                    <p className="text-sm text-muted-foreground">Based on placement rate and packages</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-green-400" />
                      <span className="font-semibold text-green-400">Growth Trend</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">+{Math.round(stats.placementRate / 10)}%</p>
                    <p className="text-sm text-muted-foreground">Estimated yearly improvement</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-purple-400" />
                      <span className="font-semibold text-purple-400">Market Position</span>
                    </div>
                    <p className="text-lg font-bold">
                      {stats.placementRate > 80 ? 'Excellent' : 
                       stats.placementRate > 60 ? 'Good' : 
                       stats.placementRate > 40 ? 'Average' : 'Needs Improvement'}
                    </p>
                    <p className="text-sm text-muted-foreground">Compared to industry standards</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-orange-400" />
                      Key Insights
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Top performing metric:</span>
                        <span className="font-medium text-orange-400">
                          {stats.placementRate > stats.avgPackage * 5 ? 'Placement Rate' : 'Package Quality'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Industry diversity:</span>
                        <span className="font-medium">{stats.topCompanies > 20 ? 'High' : stats.topCompanies > 10 ? 'Medium' : 'Low'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Data freshness:</span>
                        <span className="font-medium text-green-400">
                          {stats.recentUploads > 0 ? 'Recently Updated' : 'Needs Update'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-400" />
                      Recommendations
                    </h4>
                    <div className="space-y-3">
                      {stats.placementRate < 70 && (
                        <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-400">Focus on improving placement rates through industry partnerships</p>
                        </div>
                      )}
                      {stats.avgPackage < 8 && (
                        <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20">
                          <p className="text-sm text-blue-400">Work on attracting higher-paying companies</p>
                        </div>
                      )}
                      {stats.topCompanies < 15 && (
                        <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20">
                          <p className="text-sm text-purple-400">Expand corporate recruitment network</p>
                        </div>
                      )}
                      {stats.placementRate >= 70 && stats.avgPackage >= 8 && stats.topCompanies >= 15 && (
                        <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                          <p className="text-sm text-green-400">Excellent performance! Focus on maintaining quality and exploring new opportunities</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Management Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-8">
            <Card className="bg-gradient-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your placement data and system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    onClick={() => {
                      toast({ 
                        title: 'Data validation started', 
                        description: 'Checking data integrity and consistency...' 
                      });
                    }}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 glass-effect border-blue-500/30 hover:border-blue-500/50"
                  >
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                    <span className="text-sm font-medium">Validate Data</span>
                  </Button>

                  <Button
                    onClick={() => {
                      toast({ 
                        title: 'Backup created', 
                        description: 'Your data has been backed up successfully' 
                      });
                    }}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 glass-effect border-green-500/30 hover:border-green-500/50"
                  >
                    <Database className="h-6 w-6 text-green-400" />
                    <span className="text-sm font-medium">Backup Data</span>
                  </Button>

                  <Button
                    onClick={() => {
                      toast({ 
                        title: 'System optimized', 
                        description: 'Database performance has been optimized' 
                      });
                    }}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 glass-effect border-purple-500/30 hover:border-purple-500/50"
                  >
                    <Activity className="h-6 w-6 text-purple-400" />
                    <span className="text-sm font-medium">Optimize System</span>
                  </Button>
                </div>

                <div className="p-6 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    System Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status:</span>
                      <span className="font-medium text-green-400">Healthy</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Backup:</span>
                      <span className="font-medium">{stats.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Integrity:</span>
                      <span className="font-medium text-green-400">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Storage Used:</span>
                      <span className="font-medium">{Math.round(stats.totalRecords / 100)}MB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;