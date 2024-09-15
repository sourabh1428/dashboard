import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Image, SkeletonText ,Skeleton, Container, Stack, Alert, AlertIcon, AlertTitle, AlertDescription, Flex, Button, VStack, Icon } from '@chakra-ui/react';
import moment from 'moment-timezone';
import axios from 'axios';
import { FaCalendarAlt, FaTrashAlt } from 'react-icons/fa';

async function getParticularCampaign(data) {
  try {
    const response = await axios.post("https://marketme.site/campaigns/getParticularCampaign", {
      cid: data
    }, {
      headers: {
           'x-api-key': `123`
      }});
    return response.data; // Return the actual data
  } catch (error) {
    console.error("Error fetching campaign:", error); // Log the error
    throw error; // Optionally, rethrow the error if you want to handle it further up the chain
  }
}

async function deleteCampaign(cid) {
  try {
    await axios.delete("https://marketme.site/campaigns/deleteCampaign", {
      headers: {
           'x-api-key': `123`
      },
      data: { cid }
    });
    return true;
  } catch (error) {
    console.error("Error deleting campaign:", error); // Log the error
    throw error; // Optionally, rethrow the error if you want to handle it further up the chain
  }
}

const SingleCampaign = () => {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const data = await getParticularCampaign(cid);
        if (data) {
          setCampaign(data);
        } else {
          setError("No data found for the provided ID.");
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
        setError("An error occurred while fetching campaign details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [cid]);

  const formatDate = (epochTime) => {
    const formatDate = (epochTime) => {
      // Check if epochTime is in milliseconds and convert it to seconds
      const timeInSeconds = epochTime > 10000000000 ? epochTime / 1000 : epochTime;
      return moment.unix(timeInSeconds).tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm A');
    };
    
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign(cid);
      navigate('/');
    } catch (error) {
      setError("An error occurred while deleting the campaign.");
    }
  };

  if (error) {
    return (
      <Container centerContent p={4}>
        <Alert status="error" variant="subtle" borderRadius="md" p={4} width="full">
          <AlertIcon />
          <Stack spacing={2}>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" p={4} centerContent>
      <Flex
        direction="column"
        align="center"
        justify="center"
        w="full"
        h="full"
        textAlign="center"
        borderWidth={1}
        borderRadius="lg"
        overflow="hidden"
        p={4}
        bg="white"
        boxShadow="lg"
      >
        {loading ? (
          <Stack spacing={4} w="full" align="center">
            <Skeleton height="300px" width="full" />
            <SkeletonText mt="4" noOfLines={4} spacing="4" />
          </Stack>
        ) : (
          <VStack spacing={4} align="stretch" w="full">
            <Heading mb={4} size="lg">{campaign.name}</Heading>
            <Text fontSize="lg" color="gray.600">Type: {campaign.type}</Text>
            <Text fontSize="lg" color="gray.600">Event name: {campaign.event}</Text>
            <Text fontSize="md" color="gray.700" mb={4}>{campaign.description || "No description available"}</Text>
            <Image
              src={campaign.imageURL || 'path/to/default-image.jpg'}
              alt={campaign.name}
              borderRadius="md"
              boxSize="300px"
              objectFit="cover"
              mb={4}
            />
            <Box p={4} borderRadius="md" bg="gray.50" boxShadow="md" w="full">
              <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight="bold" color="teal.600">Analytics</Text>
                <Box
                  bg="teal.500"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="lg"
                  fontWeight="bold"
                  boxShadow="sm"
                >
                  Impressions: {campaign.analytics?.impression || 0}
                </Box>
              </Flex>
            </Box>
            <Flex
              direction="row"
              justify="space-between"
              align="center"
              w="full"
            >
              <Flex align="center">
                <Icon as={FaCalendarAlt} color="gray.500" mr={2} />
                <Text fontSize="sm" color="gray.500">{formatDate(campaign.createdAt)}</Text>
              </Flex>
              <Button colorScheme="red" leftIcon={<FaTrashAlt />} onClick={handleDelete}>
                Delete Campaign
              </Button>
            </Flex>
          </VStack>
        )}
      </Flex>
    </Container>
  );
};

export default SingleCampaign;
