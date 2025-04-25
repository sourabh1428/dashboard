import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast, ToastContainer } from "@/Components/ui/toast";  // Import ToastContainer
import { Loader2, LogIn } from 'lucide-react';
import { getApiKey } from '@/configApi';
import { useEffect } from 'react';




const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '',token:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();  // Extract toasts and removeToast here

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(formData);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': getApiKey(),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('apiKey', result.user.apiKey);
        addToast({
          title: "Success",
          description: "You have successfully signed in.",
          duration: 5000,
        });
        navigate('/');
      } else {
        throw new Error(result.msg || 'Invalid credentials');
      }
    } catch (err) {
      addToast({
        title: "Error",
        description: err.message || 'An error occurred during sign-in',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{
    if(localStorage.getItem('token')){
      setFormData({...formData, 'token': localStorage.getItem('token')});
    }

  },[])
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* Pass toasts and removeToast to ToastContainer */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />  
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-gray-700 bg-gray-800 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white flex items-center justify-center">
              <LogIn className="mr-2 h-6 w-6 text-blue-400" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-400 text-center w-full">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="text-blue-400 hover:text-blue-300 p-0 font-normal"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignIn;
