import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

export const CampaignControls = ({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  selectedStatus,
  setSelectedStatus,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <Input
        type="text"
        placeholder="Search campaigns..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </Select>
     
    </div>
  )
}

