import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, FormControl, FormLabel, Input, Text, Link, useToast, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading animation
    console.log(import.meta.env);
    
    console.log(`${import.meta.env.VITE_API_URL}/auth/signin`);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
    
         
              'x-api-key': `123`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.token) {
        setSuccess('Sign-in successful!');
        setError('');
        localStorage.setItem('token', result.token);
        toast({
          title: 'Success',
          description: 'Sign-in successful!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      } else {
        setError(result.msg || 'Invalid credentials');
        setSuccess('');
      }
    } catch (err) {
      setError('An error occurred');
      setSuccess('');
    } finally {
      setLoading(false); // Hide loading animation
    }
  };

  return (
    <Container maxW="md" p={4} centerContent>
      <MotionBox
        borderWidth={1}
        borderRadius="lg"
        overflow="hidden"
        p={6}
        bg="white"
        boxShadow="md"
        width="full"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Text fontSize="2xl" mb={6} textAlign="center">Sign In</Text>
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </FormControl>
          <FormControl mb={6}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </FormControl>
          {error && <Text color="red.500" mb={4}>{error}</Text>}
          {success && <Text color="green.500" mb={4}>{success}</Text>}
          <Button
            type="submit"
            colorScheme="teal"
            width="full"
            mb={4}
            isDisabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Sign In'}
          </Button>
          <Text textAlign="center">
            Don't have an account? <Link color="teal.500" onClick={() => navigate('/signup')}>Sign Up</Link>
          </Text>
        </form>
      </MotionBox>
    </Container>
  );
};

export default SignIn;
