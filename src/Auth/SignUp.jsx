import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, FormControl, FormLabel, Input, Text, Link, useToast, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const SignUp = () => {
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
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '123'
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
      console.log(result);
  
      if (result.success) {
        setSuccess('Sign-up successful!');
        setError('');
        toast({
          title: 'Success',
          description: 'Verification request sent to admin , Please sign in after getting verified.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/signin');
      } else {
        setError(result.msg || 'Sign-up failed');
        setSuccess('');
      }
    } catch (err) {
      setError('An error occurred');
      setSuccess('');
    } finally {
      setLoading(false);
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
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        



        <Text fontSize="2xl" mb={6} textAlign="center">Sign Up</Text>
        <form onSubmit={handleSubmit}>


        <FormControl mb={4}>
            <FormLabel>User Name</FormLabel>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="User Name"
              required
            />

            </FormControl>
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
            {loading ? <Spinner size="sm" /> : 'Sign Up'}
          </Button>
          <Text textAlign="center">
            Already have an account? <Link color="teal.500" onClick={() => navigate('/signin')}>Sign In</Link>
          </Text>
        </form>
      </MotionBox>
    </Container>
  );
};

export default SignUp;
