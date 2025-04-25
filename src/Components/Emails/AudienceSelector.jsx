import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { getApiKey } from '@/configApi';

const AudienceSelector = ({ audience, setAudience, setBunches,bunches,inputValue,setInputValue}) => {
  const [selectionType, setSelectionType] = useState(audience.selectionType || 'events');
  const [selectedOption, setSelectedOption] = useState(audience.selectedOption || '');
 
  const [userInputs, setUserInputs] = useState(audience.userInputs || []);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAudience({ selectionType, selectedOption, userInputs });
  }, [selectionType, selectedOption, userInputs, setAudience]);

  useEffect(() => {
    // Fetch bunches when selectionType is 'segment'
    if (selectionType === 'segment') {
      const fetchBunches = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('http://localhost:8080/users/getAllBunch', {
            method: 'GET',
            headers: {
              'x-api-key': getApiKey(),
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch bunches');
          }

          const data = await response.json();
          setBunches(data); // Assuming the response is an array of bunches
        } catch (error) {
          console.error("Error fetching bunches:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBunches();
    }
  }, [selectionType]);

  const handleSelectionTypeChange = (value) => {
    setSelectionType(value);
    setSelectedOption('');
    setInputValue('');
    setUserInputs([]);
  };

  const handleOptionChange = (value) => {
    setSelectedOption(value);
    setInputValue('');
  };

  const handleBunchSelect = (value) => {
    setUserInputs(prevInputs => [...prevInputs, value]);
    console.log(value);
    
  };

  const handleRemoveUser = (index) => {
    setUserInputs(prevInputs => prevInputs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Audience By</Label>
        <Select onValueChange={handleSelectionTypeChange} value={selectionType}>
          <SelectTrigger>
            <SelectValue placeholder="Select audience type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="segment">By Segment</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="attributes">Attributes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectionType === 'events' && (
        <div>
          <Label>Select Event</Label>
          <Select onValueChange={handleOptionChange} value={selectedOption}>
            <SelectTrigger>
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="productViewed">Product Viewed</SelectItem>
              <SelectItem value="viewedPage">Viewed Page</SelectItem>
              <SelectItem value="addToCart">Add to Cart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {selectionType === 'attributes' && (
        <div className="space-y-4">
          <div>
            <Label>Select Attribute</Label>
            <Select onValueChange={handleOptionChange} value={selectedOption}>
              <SelectTrigger>
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="mmid">MMID</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedOption && (
            <div className="flex space-x-2">
              <Input
                placeholder={`Enter ${selectedOption}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button onClick={handleSubmit}>Add</Button>
            </div>
          )}
        </div>
      )}

      {selectionType === 'segment' && (
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading Bunches...</div>
          ) : (
            <div>
              <Label>Select Bunch</Label>
              <Select onValueChange={handleBunchSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bunch" />
                </SelectTrigger>
                <SelectContent
  style={{
    backgroundColor: '#fff',
    color: '#000',
    padding: '20px',
    border: '1px solid #000',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  }}
>
  {console.log('Rendering SelectContent')}
  {bunches.length > 0 ? (
    bunches.map((bunch) => (
      <SelectItem key={bunch.bunchID} value={bunch.bunchID}>
        <div>{bunch.name}</div>
      </SelectItem>
    ))
  ) : (
    <div>No bunches available</div>
  )}
</SelectContent>



              </Select>
            </div>
          )}
        </div>
      )}

      {userInputs.length > 0 && (
        <div className="space-y-2">
          <Label>Added {selectionType === 'segment' ? 'Segments' : 'Users'}:</Label>
          <div className="flex flex-wrap gap-2">
            {userInputs.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{item}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveUser(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceSelector;
