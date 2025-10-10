import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TestDashboard = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        <Button 
          onClick={() => navigate("/colleges")}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Colleges
        </Button>
        
        <h1 className="text-4xl font-bold mb-8">Test Dashboard</h1>
        <p className="text-xl">College ID: {collegeId}</p>
        <p className="text-lg">This is a test dashboard to verify routing works.</p>
        
        <div className="mt-8 p-4 bg-blue-100 rounded">
          <h2 className="text-2xl font-bold mb-4">Debug Info</h2>
          <p>URL Parameter: {collegeId}</p>
          <p>Current URL: {window.location.href}</p>
          <p>Time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
