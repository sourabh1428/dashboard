import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Image,
  VStack,
  Heading,
  Progress,
  useToast,
  Text,
  HStack,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase/supabaseClient.js'; // Import the initialized Supabase client

import axios from 'axios'

async function postCampaign(type,event,description,name,imageURL){
  
  try{


      const response = await axios.post(`${import.meta.env.VITE_API_URL}/campaigns/postCampaign`,{
          type:type,
          event:event,
          description:description,
          name:name,
          imageURL:imageURL
      }, {
          headers: {
                'x-api-key': `123`
          }});
     

      let users=await UIS(response.data);
      const campaigns = await response.data;
      if(users && campaigns){
      console.log("Campaign created successfully",users);
  }
      return campaigns;


  }catch(error){
      console.log(error);
  }



}




const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    campaignName: '',
    campaignType: '',
    description: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true); // Show loading screen
    try {
      // Upload image to Supabase storage
      const imageName = `${formData.campaignName}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('Campaign images') // Replace with your Supabase bucket name
        .upload(imageName, formData.image, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded image
      const { data: publicURLData, error: urlError } = supabase
      .storage
      .from('Campaign images')
      .getPublicUrl(imageName);
    
    if (urlError) {
      throw urlError;
    }
    
    const publicURL = publicURLData.publicUrl;
    console.log('Public URL:', publicURL);
    
      
      // Post the campaign using the SDK with the image URL
      await postCampaign("Event", formData.campaignType, formData.description, formData.campaignName, publicURL);
      
      toast({
        title: 'Campaign Published',
        description: "Your campaign has been published successfully.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: "There was an error uploading your image. Please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false); // Hide loading screen
    }
  };

  // Animation Variants
  const variants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <Box
      p={8}
      maxWidth="600px"
      mx="auto"
      borderRadius="lg"
      boxShadow="2xl"
      color="white"
      textAlign="center"
      position="relative"
    >
      <Heading color="gray" as="h2" size="xl" mb={6}>
        Create Your Campaign
      </Heading>

      <Progress
        value={(step / 3) * 100}
        mb={6}
        colorScheme="blue"
        size="lg"
        borderRadius="lg"
      />

      <Box
        bg="white"
        color="gray.800"
        p={6}
        borderRadius="lg"
        textAlign="left"
        filter={loading ? 'blur(4px)' : 'none'}
      >
        <motion.div
          key={step}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.5 }}
        >
          {step === 1 && (
            <VStack spacing={5} align="stretch">
              <FormControl id="campaignName" isRequired>
                <FormLabel>Campaign Name</FormLabel>
                <Input
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleChange}
                  placeholder="Enter your campaign name"
                  variant="filled"
                  focusBorderColor="teal.500"
                />
              </FormControl>
              <FormControl id="campaignType" isRequired>
                <FormLabel>Event type</FormLabel>
                <Select
                  name="campaignType"
                  value={formData.campaignType}
                  onChange={handleChange}
                  placeholder="Select type"
                  variant="filled"
                  focusBorderColor="teal.500"
                >
                  <option value="Add to cart">Add to cart</option>
                  <option value="Product Purchase">Product Purchase</option>
                  <option value="viewedPage">viewedPage</option>
                </Select>
              </FormControl>
              <FormControl id="description">
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your campaign"
                  variant="filled"
                  focusBorderColor="teal.500"
                />
              </FormControl>
              <Button
                colorScheme="teal"
                onClick={handleNextStep}
                alignSelf="flex-end"
                size="lg"
                mt={4}
              >
                Next
              </Button>
            </VStack>
          )}

          {step === 2 && (
            <VStack spacing={5} align="stretch">
              <FormControl id="image" isRequired>
                <FormLabel>Upload Image</FormLabel>
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  variant="filled"
                  focusBorderColor="teal.500"
                />
              </FormControl>
              {formData.image && (
                <Image
                  boxSize="300px"
                  objectFit="cover"
                  src={URL.createObjectURL(formData.image)}
                  alt="Campaign"
                  borderRadius="lg"
                  mt={4}
                />
              )}
              <HStack spacing={4} justify="space-between">
                <Button variant="ghost" onClick={handlePrevStep} size="lg">
                  Previous
                </Button>
                <Button colorScheme="teal" onClick={handleNextStep} size="lg">
                  Next
                </Button>
              </HStack>
            </VStack>
          )}

          {step === 3 && (
            <VStack spacing={5} align="stretch">
              <Heading as="h3" size="md" mb={4}>
                Review and Confirm
              </Heading>
              <Text fontSize="lg">
                <strong>Campaign Name:</strong> {formData.campaignName}
              </Text>
              <Text fontSize="lg">
                <strong>Campaign Type:</strong> {formData.campaignType}
              </Text>
              <Text fontSize="lg">
                <strong>Description:</strong> {formData.description}
              </Text>
              {formData.image && (
                <Image
                  boxSize="300px"
                  objectFit="cover"
                  src={URL.createObjectURL(formData.image)}
                  alt="Campaign"
                  borderRadius="lg"
                  mt={4}
                />
              )}
              <HStack spacing={4} justify="space-between">
                <Button variant="ghost" onClick={handlePrevStep} size="lg">
                  Previous
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSubmit}
                  size="lg"
                  leftIcon={<Icon as={FiCheckCircle} />}
                >
                  Publish
                </Button>
              </HStack>
            </VStack>
          )}
        </motion.div>
      </Box>

      {loading && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0, 0, 0, 0.5)"
          borderRadius="lg"
          zIndex="10"
        >
          <Spinner size="xl" color="white" />
        </Box>
      )}
    </Box>
  );
};

export default MultiStepForm;