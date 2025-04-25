import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Image, Clock, Send, Eye, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AudienceSelector from './AudienceSelector';
import axios from 'axios';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useNavigate } from 'react-router-dom';
import { getApiKey } from '@/configApi';

const MotionCard = motion(Card);

export default function CreateEmail() {
  const [emailDetails, setEmailDetails] = useState({
    name: '',
    subject: '',
    senderName: '',
    senderEmail: '',
    replyTo: '',
    content: '',
    isImageContent: false,
    schedule: 'now',
    date: '',
    time: '',
    audience: {
      selectionType: '',
      selectedOption: '',
      userInputs: []
    },
    testEmails: [''],
  });

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPopover, setShowPopover] = useState(false);
  const [bunches, setBunches] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!emailDetails.name) newErrors.name = 'Campaign name is required';
    if (!emailDetails.subject) newErrors.subject = 'Email subject is required';
    if (!emailDetails.senderName) newErrors.senderName = 'Sender name is required';
    if (!emailDetails.senderEmail) {
      newErrors.senderEmail = 'Sender email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailDetails.senderEmail)) {
      newErrors.senderEmail = 'Sender email is invalid';
    }
    if (emailDetails.schedule === 'later') {
      if (!emailDetails.date) newErrors.date = 'Date is required for scheduled emails';
      if (!emailDetails.time) newErrors.time = 'Time is required for scheduled emails';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const mappedData = {
      name: emailDetails.name,
      description: emailDetails.audience.selectedOption,
      data: emailDetails.audience,
      emailSubject: emailDetails.subject,
      emailHtmlContent: emailDetails.content,
      senderName: emailDetails.senderName,
      fromAddress: emailDetails.senderEmail,
      recipientType:bunches?"bunch":null,
      recipientData:{bunchID:emailDetails.audience.userInputs[0]},
      recipients: emailDetails.audience.userInputs,
      toAddress: emailDetails.replyTo,
      
    };

    try {
      const response = await axios.post('http://localhost:8080/email/createAndSendEmail', mappedData, {
        headers: {
          'x-api-key':getApiKey(),
          'Content-Type': 'application/json',
        },
      });

      console.log('Success:', response.data);
      setShowPopover(true);
    } catch (error) {
      console.error('Error sending email:', error.response ? error.response.data : error.message);
    }
    navigate("/");
  };

  const handleReset = () => {
    setEmailDetails({
      name: '',
      subject: '',
      senderName: '',
      senderEmail: '',
      replyTo: '',
      content: '',
      isImageContent: false,
      schedule: 'now',
      date: '',
      time: '',
      audience: {
        selectionType: '',
        selectedOption: '',
        userInputs: []
      },
      testEmails: [''],
    });
    setAttachedFiles([]);
    setErrors({});
    setShowPopover(false);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <MotionCard
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Create Email Campaign</CardTitle>
          <CardDescription>Design and schedule your next email campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="recipients">Recipients</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="space-y-6">
                <Input
                  name="name"
                  placeholder="Campaign Name"
                  value={emailDetails.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                <Input
                  name="subject"
                  placeholder="Email Subject"
                  value={emailDetails.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="content-type"
                    checked={emailDetails.isImageContent}
                    onCheckedChange={(checked) =>
                      setEmailDetails((prev) => ({ ...prev, isImageContent: checked }))
                    }
                  />
                  <Label htmlFor="content-type">Use image content</Label>
                </div>
                {emailDetails.isImageContent ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      name="content"
                      placeholder="Image URL"
                      value={emailDetails.content}
                      onChange={handleChange}
                    />
                    <Button type="button" size="icon" variant="outline">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Textarea
                    name="content"
                    placeholder="Email Content (HTML)"
                    value={emailDetails.content}
                    onChange={handleChange}
                    rows={10}
                  />
                )}
              </TabsContent>
              <TabsContent value="design" className="space-y-6">
                <p className="text-sm text-gray-500">Design options coming soon...</p>
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="mt-2 mb-4"
                  />
                </div>
                {attachedFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Attached Files:</p>
                    <ul className="list-disc ml-4">
                      {attachedFiles.map((file, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{file.name}</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="recipients" className="space-y-6">
                <AudienceSelector 
                  audience={emailDetails.audience}
                  setAudience={(updatedAudience) => 
                    setEmailDetails(prev => ({
                      ...prev,
                      audience: updatedAudience,
                    }))
                  }
                  bunches={bunches}
                  setBunches={setBunches}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                />
              </TabsContent>
              <TabsContent value="settings" className="space-y-6">
                <Input
                  name="senderName"
                  placeholder="Sender Name"
                  value={emailDetails.senderName}
                  onChange={handleChange}
                  className={errors.senderName ? 'border-red-500' : ''}
                />
                {errors.senderName && <p className="text-red-500 text-sm">{errors.senderName}</p>}
                <Input
                  name="senderEmail"
                  placeholder="Sender Email"
                  value={emailDetails.senderEmail}
                  onChange={handleChange}
                  className={errors.senderEmail ? 'border-red-500' : ''}
                />
                {errors.senderEmail && <p className="text-red-500 text-sm">{errors.senderEmail}</p>}
                <Input
                  name="replyTo"
                  placeholder="Reply-To Email"
                  value={emailDetails.replyTo}
                  onChange={handleChange}
                />
                <Label htmlFor="schedule" className="flex items-center space-x-2">
                  <Switch
                    id="schedule"
                    checked={emailDetails.schedule === 'later'}
                    onCheckedChange={(checked) => 
                      setEmailDetails(prev => ({ ...prev, schedule: checked ? 'later' : 'now' }))
                    }
                  />
                  <span>Schedule Email</span>
                </Label>
                {emailDetails.schedule === 'later' && (
                  <div className="flex space-x-4">
                    <Input
                      type="date"
                      name="date"
                      value={emailDetails.date}
                      onChange={handleChange}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                    <Input
                      type="time"
                      name="time"
                      value={emailDetails.time}
                      onChange={handleChange}
                      className={errors.time ? 'border-red-500' : ''}
                    />
                    {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <div className="flex space-x-4">
              <Button type="button" onClick={handleReset}>Reset</Button>
              <Button type="submit" variant="primary">Send Email</Button>
            </div>
          </form>
        </CardContent>
      </MotionCard>
      {showPopover && (
        <Popover>
          <PopoverTrigger asChild>
            <Button className="hidden">Show Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <p>Email campaign created successfully!</p>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

