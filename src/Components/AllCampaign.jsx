import React, { useEffect, useState, useCallback } from 'react';

import { Box, Container, Heading, Text, IconButton, Stack, Image, Center, Skeleton, SkeletonText } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correct import
import CreateCampaign from './../Campaigns/CreateCampaign';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import { FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa';

import axios from 'axios'


async function getAllCampaigns(){
  console.log("getting all campaign");
  
  try{
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/campaigns/getAllCampaign`, {
          headers: {
               'x-api-key': `123`
          }});
  
      const campaigns = await response.data;
      console.log("called");
      
      console.log(campaigns);
      return campaigns;


  }catch(error){
      console.log(error);
  }
}






// Define a motion.div for animations
const MotionBox = motion(Box);

const AllCampaign = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [loading, setLoading] = useState(true); // Loading state
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); // For pagination
  const navigate = useNavigate();











  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Invalid token:', error);
      return true; // If the token is invalid, consider it expired
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  useEffect(() => {
    // Check token expiration when the page loads
    if (isTokenExpired()) {
      logout();
    }

    // Set up an interval to check token expiration every minute
    const checkTokenInterval = setInterval(() => {
      if (isTokenExpired()) {
        logout();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(checkTokenInterval);
  }, []); // Run once when the component mounts

  const fetchData = useCallback(async () => {
    setLoading(true); // Set loading state to true before fetching
    try {
      const result = await getAllCampaigns();

      // Filter and sort campaigns based on search term and sort order
      const filteredData = result.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.segment_id.includes(searchTerm.toLowerCase())
      );

      const sortedData = filteredData.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt;
      });

      // Handle pagination
      const itemsPerPage = 10;
      const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

      setData(paginatedData);
      setHasMore(sortedData.length > page * itemsPerPage);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false); // Set loading state to false after fetching
    }
  }, [searchTerm, sortOrder, page]); // Run whenever searchTerm, sortOrder, or page changes

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Fetch data whenever page changes

  const handleBoxClick = (id) => {
    navigate(`/campaign/${id}`);
  };

  // Debounced search function
  const debouncedSearch = debounce((term) => setSearchTerm(term), 300);

  return (
    <Container maxW="container.lg" p={4}>
      <CreateCampaign />
      <Stack spacing={4} mb={4}>
        {/* Search Box */}
        <Box>
          <Box display="flex" alignItems="center">
            <IconButton
              icon={<FaSearch />}
              aria-label="Search"
              variant="outline"
              mr={2}
            />
            <input
              type="text"
              placeholder="Search by name or CID..."
              onChange={(e) => debouncedSearch(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </Box>
        </Box>

        {/* Sort Options */}
        <Box>
          Sort by date
          <IconButton
            icon={<FaSortUp />}
            aria-label="Sort by Date Ascending"
            onClick={() => setSortOrder('asc')}
            mr={2}
          />
          <IconButton
            icon={<FaSortDown />}
            aria-label="Sort by Date Descending"
            onClick={() => setSortOrder('desc')}
          />
        </Box>
      </Stack>

      <Center>
        <Stack spacing={4} width="full" maxW="md">
          {loading ? (
            Array(10).fill().map((_, index) => (
              <Box key={index} borderWidth={1} borderRadius="lg" overflow="hidden" p={4} bg="white" boxShadow="md">
                <Skeleton height="80px" width="80px" mr={4} />
                <Skeleton height="40px" width="full" mb={2} />
                <Skeleton height="20px" width="full" />
              </Box>
            ))
          ) : data.length > 0 ? (
            data.map((campaign, index) => (
              <MotionBox
                key={index}
                borderWidth={1}
                borderRadius="lg"
                overflow="hidden"
                p={4}
                bg="white"
                boxShadow="md"
                cursor="pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                display="flex"
                alignItems="center"
                onClick={() => handleBoxClick(campaign.segment_id)}
              >
                <Image
                  src={campaign.imageURL || 'path/to/default-image.jpg'}
                  alt={campaign.name}
                  boxSize="80px"
                  objectFit="cover"
                  mr={4}
                />
                <Box flex="1">
                  <Heading size="md" mb={2}>{campaign.name}</Heading>
                  <Text noOfLines={2}>{campaign.description || "No description available"}</Text>
                </Box>
              </MotionBox>
            ))
          ) : (
            <Box textAlign="center" p={6} borderWidth={1} borderRadius="md" boxShadow="md" bg="white">
              <Heading size="lg" mb={4}>No Campaigns Available</Heading>
              <Text color="gray.600">It looks like there are no campaigns to display. Try adjusting your search criteria or come back later.</Text>
            </Box>
          )}
        </Stack>
      </Center>
    </Container>
  );
};

export default AllCampaign;
