import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FaUser, FaEnvelope, FaCalendarAlt, FaLanguage, FaBell, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { getApiKey } from '@/configApi';

const UserProfile = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/user/${id}`, {
          headers: {
            'x-api-key': getApiKey()
          }
        });
        setUserData(response.data);

        const eventsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/events/userEvents?mmid=${id}`, {
          headers: {
            'x-api-key': getApiKey()
          }
        });
        // Sort events by eventTime in descending order
        const sortedEvents = eventsResponse.data.sort((a, b) => b.eventTime - a.eventTime);
        setUserEvents(sortedEvents);
      } catch (error) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const epochToDate = (epoch) => {
    return new Date(epoch * 1000).toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactive':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationCircle className="text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl mt-8">{error}</div>;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <div className="container mx-auto p-4 space-y-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden shadow-lg">
            <div className="bg-cyan-950 p-6">
              <CardHeader className="flex flex-col sm:flex-row items-center gap-4 text-white">
                <Avatar className="w-24 h-24 border-4 border-white">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userData?.name || 'User'}`} />
                  <AvatarFallback>{userData?.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-3xl font-bold">{userData?.name}</CardTitle>
                  <p className="text-lg opacity-80">{userData?.email}</p>
                </div>
                <Badge variant="outline" className="ml-auto bg-white text-purple-600 px-3 py-1 text-sm font-semibold">
                  {getStatusIcon(userData?.status)}
                  <span className="ml-2">{userData?.status}</span>
                </Badge>
              </CardHeader>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <FaUser className="text-2xl text-blue-500" />
                  <div>
                    <p className="text-sm ">Age</p>
                    <p className="text-lg font-semibold">{userData?.age}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-2xl text-purple-500" />
                  <div>
                    <p className="text-sm ">MMID</p>
                    <p className="text-lg font-semibold">{userData?.MMID}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-2xl text-green-500" />
                  <div>
                    <p className="text-sm ">Joined</p>
                    <p className="text-lg font-semibold">{epochToDate(userData?.createdAt || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaLanguage className="text-2xl text-yellow-500" />
                  <div>
                    <p className="text-sm ">Language</p>
                    <p className="text-lg font-semibold">{userData?.preferences?.language}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaBell className="text-2xl text-red-500" />
                  <div>
                    <p className="text-sm ">Notifications</p>
                    <p className="text-lg font-semibold">{userData?.preferences?.notifications ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-slate-900">
              <CardTitle className="text-2xl font-bold text-white">User Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {userEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-lg">{event.eventName}</span>
                      <div className="flex items-center gap-2 text-sm ">
                        <FaClock className="text-teal-500" />
                        <span>{new Date(event.eventTime * 1000).toLocaleString()}</span>
                      </div>
                    </div>
                    {index < userEvents.length - 1 && <Separator />}
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Suspense>
  );
};

export default UserProfile;
