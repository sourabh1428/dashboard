import { motion } from 'framer-motion';
import { Plus, Globe, Mail, Smartphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const MotionCard = motion(Card);

export const CreateCampaignCard = ({ open, setOpen, navigate }) => {
  const handleOptionClick = (option) => {
    setOpen(false);
    const routes = {
      onsite: '/Createonsite',
      email: '/Createemail',
      whatsapp: '/createWhatsapp'
    };
    navigate(routes[option] || '/');
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Campaign Dashboard</CardTitle>
        <CardDescription>Manage and create new campaigns for your audience</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Campaign Type</DialogTitle>
              <DialogDescription>
                Select a channel to start your campaign creation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Button 
                onClick={() => handleOptionClick('onsite')} 
                variant="outline" 
                className="h-16 gap-3 justify-start"
              >
                <Globe className="h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <p>Onsite Campaign</p>
                  <p className="text-sm text-muted-foreground font-normal">Website popups and banners</p>
                </div>
              </Button>
              <Button 
                onClick={() => handleOptionClick('email')} 
                variant="outline" 
                className="h-16 gap-3 justify-start"
              >
                <Mail className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p>Email Campaign</p>
                  <p className="text-sm text-muted-foreground font-normal">Email marketing campaigns</p>
                </div>
              </Button>
              <Button 
                onClick={() => handleOptionClick('whatsapp')} 
                variant="outline" 
                className="h-16 gap-3 justify-start"
              >
                <Smartphone className="h-5 w-5 text-green-500" />
                <div className="text-left">
                  <p>WhatsApp Campaign</p>
                  <p className="text-sm text-muted-foreground font-normal">WhatsApp template messages</p>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </MotionCard>
  );
};