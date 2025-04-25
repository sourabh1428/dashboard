import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const UserDetailsPopup = ({ user, onClose }) => {
  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{user.customer[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.customer}</h3>
              <p className="text-sm ">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium ">Mobile Number</p>
              <p>{user.mobile_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium ">Last Transaction</p>
              <p>{user.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium ">Amount</p>
              <p>{user.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium ">Status</p>
              <p>{user.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsPopup

