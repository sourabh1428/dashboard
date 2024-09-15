import React from 'react';
import { Box, Button, Stack, Input } from '@chakra-ui/react';

const SearchSort = ({ onSearchChange }) => {
  return (
    <Stack spacing={4} mb={4}>
      {/* Search Box */}
      <Box>
        <Input
          type="text"
          placeholder="Search by name or CID..."
          onChange={onSearchChange}
          style={{ width: '100%', padding: '8px' }}
        />
      </Box>
      
      {/* No sort options here */}
    </Stack>
  );
};

export default SearchSort;
