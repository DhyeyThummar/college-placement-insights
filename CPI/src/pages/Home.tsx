import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  GitCompare, 
  Settings,
  BarChart3,
  Users,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Building2,
  School
} from 'lucide-react';
import { getPlacementStats } from '@/services/mongodb';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOffers: 0,
    placementRate: 0,
    avgPackage: 0,
    totalCompanies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const placementStats = await getPlacementStats();
        setStats(placementStats);
      } catch (error) {
        console.error('Error fetching placement stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const mainFeatures = [
    {
      icon: BarChart3,
      title: 'Overview Analytics',
      description: 'Comprehensive placement insights across all colleges with interactive charts and trends.',
      action: () => navigate('/overview'),
      gradient: 'from-blue-400 to-sky-500',
      stats: ''
    },
    {
      icon: School,
      title: 'College Explorer',
      description: 'Explore individual colleges, compare placement rates, and find your perfect match.',
      action: () => navigate('/colleges'),
      gradient: 'from-green-400 to-teal-500',

      stats: ''
    }
  ];

  const quickActions = [
    {
      icon: GitCompare,
      title: 'Compare Colleges',
      description: 'Side-by-side comparison of placement statistics.',
      action: () => navigate('/compare'),
      gradient: 'from-lime-400 to-green-500',

    },
   
    // {
    //   icon: TrendingUp,
    //   title: 'Live Monitor',
    //   description: 'Real-time placement tracking and updates.',
    //   action: () => navigate('/live-monitor'),
    //   gradient: 'from-red-500 to-pink-600'
    // },
    {
      icon: Settings,
      title: 'Admin Panel',
      description: 'Manage placement data and system settings.',
      action: () => navigate('/auth'),
      gradient: 'from-blue-400 to-teal-500',

    }
  ];

 

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-bg">
      <section>
        <div className="container mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
            
             <h1 className="text-5xl md:text-7xl font-bold animate-fade-in bg-clip-text text-transparent"
             
             style={{ backgroundImage: "linear-gradient(to right, #d9e3f6ff, #0463f1ff)" }}
             >
              
  College Placement
  <br />
  <span className="bg-clip-text text-transparent"
        style={{ backgroundImage: "linear-gradient(to right, #0463f1ff, #d9e3f6ff)" }}>
    Insights
  </span>
</h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
                Explore placement trends, compare colleges, and gain insights into your career prospects
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mx-auto mb-8 animate-scale-in">
              <SearchBar 
                onSearch={(query) => console.log('Search:', query)}
                placeholder="Search for colleges"
                className="mb-4"
              />
             
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
              <Button
                onClick={() => navigate('/overview')}
                size="lg"
                className="btn-hover bg-gradient-primary hover:opacity-90 text-white border-0 px-8 py-3 text-lg"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate('/colleges')}
                variant="outline"
                size="lg"
                className="btn-hover glass-effect border-primary/30 hover:border-primary/50 hover:bg-primary/10 px-8 py-3 text-lg"
              >
                <School className="h-5 w-5 mr-2" />
                Explore Colleges
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 bg-gradient-primary rounded-full opacity-20"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"></div>
        </div>
      </section>

      {/* Stats Section */}

      {/* Main Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Explore Placement Data
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive analytics and insights for informed career decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                className="card-hover bg-gradient-card border-white/10 cursor-pointer group overflow-hidden relative"
                onClick={feature.action}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-elegant`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-gradient-primary bg-clip-text text-transparent">
                      {feature.stats}
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-muted-foreground leading-relaxed text-base mb-4">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    variant="ghost" 
                    className="group/btn p-0 h-auto font-medium text-primary hover:bg-transparent"
                  >
                    Explore Now
                    <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
             <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 bg-gradient-primary rounded-full opacity-20"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"></div>
        </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="card-hover bg-gradient-card border-white/10 cursor-pointer group"
                onClick={action.action}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{action.title}</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="container mx-auto px-6">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to Explore Placement Data?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and institutions using our platform for placement insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/overview')}
                size="lg"
                className="btn-hover bg-gradient-primary hover:opacity-90 text-white border-0 px-8"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
              <Button
                onClick={() => navigate('/colleges')}
                variant="outline"
                size="lg"
                className="btn-hover glass-effect border-primary/30 hover:border-primary/50 hover:bg-primary/10 px-8"
              >
                <School className="h-5 w-5 mr-2" />
                Explore Colleges
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div>
        <br />
        <br />
      </div>
      </section>
    </div>
  );
};

export default Home;