import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/Components/ui/button';
import { jwtDecode } from 'jwt-decode';

const MotionTableRow = motion(TableRow);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-500' },
    paused: { label: 'Paused', color: 'bg-amber-500' },
    draft: { label: 'Draft', color: 'bg-gray-500' }
  };

  const { label, color } = statusConfig[status] || { label: 'Unknown', color: 'bg-gray-500' };

  return (
    <Badge variant="outline" className={`gap-2 ${color.replace('bg', 'text')}`}>
      <div className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </Badge>
  );
};

export const CampaignTable = ({ 
  data, 
  loading, 
  hasMore, 
  handleCardClick, 
  loadMore 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Overview</CardTitle>
        <CardDescription>Manage and monitor your marketing campaigns</CardDescription>
      </CardHeader>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="hidden md:table-cell">Campaign ID</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          <AnimatePresence>
            {loading ? (
              Array(5).fill().map((_, i) => (
                <MotionTableRow
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TableCell colSpan={4}>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[300px]" />
                      <Skeleton className="h-4 w-[150px] hidden md:inline-block" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </TableCell>
                </MotionTableRow>
              ))
            ) : data.length > 0 ? (
                Array.isArray(data)&& data.map((campaign) => (
                <MotionTableRow
                  key={campaign.segment_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCardClick(campaign.segment_id)}
                >
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {campaign.description || "No description"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="font-mono text-muted-foreground">
                      {campaign.segment_id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                </MotionTableRow>
              ))
            ) : (
              <MotionTableRow
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="font-medium">No campaigns found</p>
                      <p className="text-muted-foreground text-sm">
                        Try adjusting your filters or create a new campaign
                      </p>
                    </div>
                  </div>
                </TableCell>
              </MotionTableRow>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {hasMore && (
        <div className="p-4 flex justify-center">
          <Button 
            onClick={loadMore}
            variant="ghost"
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Load More
          </Button>
        </div>
      )}
    </Card>
  );
};