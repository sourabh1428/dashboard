import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../Supabase/supabaseClient.js';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { getApiKey } from '@/configApi.js';

async function postCampaign(type, event, description, name, imageURL) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/campaigns/postCampaign`,
      { type, event, description, name, imageURL },
      { headers: { 'x-api-key': getApiKey() } }
    );
    console.log("Campaign created successfully", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
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

  const navigate = useNavigate();

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      campaignType: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const imageName = `${formData.campaignName}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('Campaign images')
        .upload(imageName, formData.image, {
          cacheControl: '3600',
          upsert: false,
        });
  
      if (error) throw error;
  
      const { data: publicURLData, error: urlError } = supabase
        .storage
        .from('Campaign images')
        .getPublicUrl(imageName);
      
      if (urlError) throw urlError;
      
      const publicURL = publicURLData.publicUrl;
      
      await postCampaign("Event", formData.campaignType, formData.description, formData.campaignName, publicURL);
      
    
  
      navigate('/');
    } catch (error) {
      console.error('Error uploading image:', error);
     
    } finally {
      setLoading(false);
    }
  };

  const fadeInOut = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-8">
      <motion.h2 
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Create Your Campaign
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Progress value={(step / 3) * 100} className="mb-8" />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          {...fadeInOut}
          className={`${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <Card className="backdrop-blur-sm bg-white/10 shadow-xl">
            <CardContent className="space-y-4 pt-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="campaignName">Campaign Name</Label>
                    <Input
                      id="campaignName"
                      name="campaignName"
                      value={formData.campaignName}
                      onChange={handleChange}
                      placeholder="Enter your campaign name"
                      className="bg-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaignType">Event type</Label>
                    <Select onValueChange={handleSelectChange} value={formData.campaignType}>
                      <SelectTrigger className="bg-white/20">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Add to cart">Add to cart</SelectItem>
                        <SelectItem value="Product Purchase">Product Purchase</SelectItem>
                        <SelectItem value="viewedPage">viewedPage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your campaign"
                      className="bg-white/20"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="w-8 h-8 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <motion.img
                      src={URL.createObjectURL(formData.image)}
                      alt="Campaign"
                      className="w-full h-64 object-cover rounded-lg mt-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              )}

              {step === 3 && (
                <>
                  <h3 className="text-xl font-semibold mb-4">Review and Confirm</h3>
                  <p><strong>Campaign Name:</strong> {formData.campaignName}</p>
                  <p><strong>Campaign Type:</strong> {formData.campaignType}</p>
                  <p><strong>Description:</strong> {formData.description}</p>
                  {formData.image && (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Campaign"
                      className="w-full h-64 object-cover rounded-lg mt-4"
                    />
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevStep}>Previous</Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNextStep} className="ml-auto">Next</Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600">
                  <FiCheckCircle className="mr-2" />
                  Publish
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      {loading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-lg font-semibold">Publishing your campaign...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiStepForm;