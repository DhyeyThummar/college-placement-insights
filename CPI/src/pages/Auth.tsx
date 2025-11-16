import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getColleges } from '@/services/mongodb';
import { 
  User, 
  Shield, 
  Mail, 
  Lock, 
  LogIn,
  GraduationCap,
  UserPlus,
  Building
} from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [specialKey, setSpecialKey] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const [accountType, setAccountType] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  
  const { signInAdmin, signUpAdmin, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, userRole, navigate]);

  // Load colleges for admin signup
  useEffect(() => {
    const loadColleges = async () => {
      const collegesData = await getColleges();
      setColleges(collegesData);
    };
    loadColleges();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signInAdmin(email, password);
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password || !fullName) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!collegeName || !specialKey) {
      toast({
        title: 'Error',
        description: 'Please fill in college name and special key',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUpAdmin(fullName, email, password, collegeName, specialKey);
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign up',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Admin account created successfully',
      });
      setActiveTab('signin');
    }
    
    setIsLoading(false);
  };


  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {activeTab === 'signin' ? 'Admin Sign In' : 'Admin Registration'}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === 'signin' 
                ? 'Sign in to access admin dashboard' 
                : 'Create admin account for college placement management'
              }
            </p>
          </div>

          <Card className="glass-effect border-white/10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-foreground">
                {activeTab === 'signin' ? 'Admin Sign In' : 'Admin Sign Up'}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'signin' 
                  ? 'Enter your admin credentials to access dashboard'
                  : 'Create admin account for your college'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 glass-effect border-white/20 focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 glass-effect border-white/20 focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full btn-hover bg-gradient-primary hover:opacity-90 text-white border-0"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <LogIn className="h-4 w-4" />
                          <span>Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>

                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="glass-effect border-white/20 focus:border-primary/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 glass-effect border-white/20 focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 glass-effect border-white/20 focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="college-name">College Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="college-name"
                          type="text"
                          placeholder="Enter college name"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          className="pl-10 glass-effect border-white/20 focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special-key">Special Key</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="special-key"
                          type="password"
                          placeholder="Enter special admin key"
                          value={specialKey}
                          onChange={(e) => setSpecialKey(e.target.value)}
                          className="pl-10 glass-effect border-white/20 focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full btn-hover bg-gradient-primary hover:opacity-90 text-white border-0"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <UserPlus className="h-4 w-4" />
                          <span>Create Account</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;