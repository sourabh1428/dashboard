import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from './Spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../Components/ui/avatar';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { getApiKey } from '@/configApi';

// API function that supports pagination
async function getAllUsers(page = 1, limit = 20) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users?page=${page}&limit=${limit}`,
      {
        headers: {
          'x-api-key': getApiKey(),
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Assuming your backend returns an object with a "users" array and optionally "total"
    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }
}

export default function AllUsers() {
  const [users, setUsers] = useState([]);       // All loaded users
  const [loading, setLoading] = useState(true);   // Loading indicator
  const [searchTerm, setSearchTerm] = useState(''); // For client-side filtering
  const [page, setPage] = useState(1);            // Current page
  const [hasMore, setHasMore] = useState(true);     // Flag indicating if more users are available
  const navigate = useNavigate();
  const USERS_PER_PAGE = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch the users for the current page
        const result = await getAllUsers(page, USERS_PER_PAGE);
        // Append or set the users based on page number
        setUsers(prevUsers => (page === 1 ? result.users : [...prevUsers, ...result.users]));
        // If the returned users are fewer than the limit, assume no more data
        if (result.users.length < USERS_PER_PAGE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  // Handle navigating to the user details page.
  const handleUserClick = (userId) => {
    console.log('Selected user:', userId);
    navigate(`/user/${userId}`);
  };

  // Client-side filtering of loaded users.
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Increment page number to load more users.
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Users</CardTitle>
          <CardDescription>Manage and view all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => navigate('/userUpload')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
          {/* Show spinner only on first page load */}
          {loading && page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user.ID || user.mmid}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleUserClick(user.mmid)}
                >
                  <CardContent className="flex items-center p-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">{user.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Total Users: {users.length}</p>
          {/* Show "Load More" button if more users are available and not currently loading */}
          {hasMore && !loading && (
            <Button onClick={handleLoadMore} variant="outline">
              Load More
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
