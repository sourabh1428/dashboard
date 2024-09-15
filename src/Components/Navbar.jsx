import React from 'react';
import { Flex, Box, Button, ButtonGroup, Avatar, AvatarBadge, IconButton, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaChartLine, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Define a motion component for smooth animations
const MotionButton = motion(Button);

const Navbar = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.clear();
    navigate('/signin');
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      p={4}
      
      color="white"
      boxShadow="md"
      borderBottom="1px"
      borderColor={useColorModeValue('teal.300', 'teal.700')}
    >
      {/* Logo or Title */}
      <Box>
        <Avatar name="User Name" src="./avatar.svg" size="md">
          <AvatarBadge boxSize="1em" bg="green.500" />
        </Avatar>
      </Box>

      {/* Navigation Buttons */}
      <ButtonGroup variant="solid" spacing={4}>
        <MotionButton
          leftIcon={<FaHome />}
          colorScheme="teal"
          onClick={() => navigate('/campaigns')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Campaigns
        </MotionButton>
        <MotionButton
          leftIcon={<FaUser />}
          colorScheme="teal"
          onClick={() => navigate('/users')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Users
        </MotionButton>
        <MotionButton
          leftIcon={<FaChartLine />}
          colorScheme="teal"
          onClick={() => navigate('/analytics')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Analytics
        </MotionButton>
      </ButtonGroup>

      {/* Logout Button */}
      <IconButton
        icon={<FaSignOutAlt />}
        aria-label="Logout"
        colorScheme="red"
        variant="outline"
        onClick={handleClick}
        size="md"
        borderRadius="full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      />
    </Flex>
  );
};

export default Navbar;
