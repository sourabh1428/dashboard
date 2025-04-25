import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  CreditCard, 
  Check, 
  Package,
  Sparkles,
  Rocket,
  CreditCardIcon,
  Clock,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Basic features for small teams",
    price: 0,
    features: [
      "Up to 500 emails per month",
      "5 campaigns",
      "Basic analytics",
      "Email support"
    ],
    icon: Package
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for growing teams",
    price: 29,
    features: [
      "Up to 5,000 emails per month",
      "Unlimited campaigns",
      "Advanced analytics",
      "Priority support",
      "WhatsApp integration"
    ],
    icon: Sparkles
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for larger organizations",
    price: 99,
    features: [
      "Unlimited emails",
      "Unlimited campaigns",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced security features",
      "SLA guarantee"
    ],
    icon: Rocket
  }
]

const BillingSettings = ({ data, onSave }) => {
  const [selectedPlan, setSelectedPlan] = useState(data?.plan || "free")
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  })

  const currentPlan = PLANS.find(plan => plan.id === selectedPlan) || PLANS[0]
  
  const handleChangePlan = (planId) => {
    setSelectedPlan(planId)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // If upgrading to a paid plan, show payment dialog
      if ((selectedPlan === "pro" || selectedPlan === "enterprise") && 
          (data?.plan === "free" || !data?.plan)) {
        setShowPaymentDialog(true)
        setIsLoading(false)
        return
      }
      
      const success = await onSave({
        ...data,
        plan: selectedPlan,
        nextBilling: data?.nextBilling || getNextBillingDate()
      })
      
      if (success) {
        toast.success(`Plan updated to ${currentPlan.name}`)
      }
    } catch (error) {
      toast.error(error.message || "Failed to update billing information")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validate card details (simple validation for demo)
    if (
      paymentDetails.cardNumber.length < 16 ||
      paymentDetails.cardName.length < 3 ||
      paymentDetails.expiryDate.length < 5 ||
      paymentDetails.cvv.length < 3
    ) {
      toast.error("Please enter valid payment details")
      setIsLoading(false)
      return
    }
    
    try {
      // In a real app, you would process payment here
      
      const success = await onSave({
        ...data,
        plan: selectedPlan,
        nextBilling: getNextBillingDate(),
        // Don't save full card details in a real app
        paymentMethod: {
          last4: paymentDetails.cardNumber.slice(-4),
          brand: getCardBrand(paymentDetails.cardNumber),
          expiryDate: paymentDetails.expiryDate
        }
      })
      
      if (success) {
        toast.success(`Subscribed to ${currentPlan.name} plan`)
        setShowPaymentDialog(false)
        
        // Reset payment form
        setPaymentDetails({
          cardNumber: "",
          cardName: "",
          expiryDate: "",
          cvv: ""
        })
      }
    } catch (error) {
      toast.error(error.message || "Failed to process payment")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
    
    // Format card number with spaces every 4 digits
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .substring(0, 19)
    }
    
    // Format expiry date as MM/YY
    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1/$2")
        .substring(0, 5)
    }
    
    // Limit CVV to 3-4 digits
    if (name === "cvv") {
      formattedValue = value
        .replace(/\D/g, "")
        .substring(0, 4)
    }
    
    setPaymentDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const getNextBillingDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split("T")[0]
  }

  const getCardBrand = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === "4") return "Visa"
    if (firstDigit === "5") return "Mastercard"
    if (firstDigit === "3") return "Amex"
    return "Unknown"
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <currentPlan.icon className="h-5 w-5 text-primary" />
            Current Plan: {currentPlan.name}
          </CardTitle>
          <CardDescription>
            {data?.nextBilling && (
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Next billing: {new Date(data.nextBilling).toLocaleDateString()}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-3xl font-bold">
              ${currentPlan.price}
              <span className="text-base font-normal text-muted-foreground">
                /month
              </span>
            </div>
            
            <div className="space-y-2">
              {currentPlan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            {data?.paymentMethod && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-1">
                  Payment Method
                </div>
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="h-4 w-4 text-primary" />
                  <span>
                    {data.paymentMethod.brand} •••• {data.paymentMethod.last4}
                  </span>
                  <Badge variant="outline" className="ml-1">
                    Expires {data.paymentMethod.expiryDate}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Available Plans</h3>
          <Badge variant="outline">
            {data?.plan === selectedPlan 
              ? "Current" 
              : (PLANS.find(p => p.id === selectedPlan)?.price || 0) > 
                (PLANS.find(p => p.id === data?.plan)?.price || 0) 
                ? "Upgrade" 
                : "Downgrade"}
          </Badge>
        </div>

        <RadioGroup 
          value={selectedPlan} 
          onValueChange={handleChangePlan}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {PLANS.map((plan) => (
            <div key={plan.id} className="relative">
              <RadioGroupItem
                value={plan.id}
                id={`plan-${plan.id}`}
                className="absolute opacity-0"
              />
              <Label
                htmlFor={`plan-${plan.id}`}
                className={`flex flex-col h-full p-4 rounded-lg border-2 cursor-pointer ${
                  selectedPlan === plan.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <plan.icon className={`h-5 w-5 ${
                      selectedPlan === plan.id ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  
                  {selectedPlan === plan.id && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="text-xl font-bold mb-2">
                  ${plan.price}
                  <span className="text-xs font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {plan.description}
                </p>
                
                <Separator className="my-2" />
                
                <ul className="text-xs space-y-1 mt-2 text-muted-foreground flex-grow">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-primary">+{plan.features.length - 3} more</li>
                  )}
                </ul>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || selectedPlan === data?.plan}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : data?.plan === selectedPlan 
            ? "Current Plan" 
            : (PLANS.find(p => p.id === selectedPlan)?.price || 0) > 
              (PLANS.find(p => p.id === data?.plan)?.price || 0) 
              ? "Upgrade Plan" 
              : "Downgrade Plan"
          }
        </Button>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter your payment information to subscribe to the {currentPlan.name} plan.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={handlePaymentInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                name="cardName"
                placeholder="John Doe"
                value={paymentDetails.cardName}
                onChange={handlePaymentInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={handlePaymentInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={handlePaymentInputChange}
                  required
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              You will be charged ${currentPlan.price} immediately and monthly thereafter.
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : `Pay $${currentPlan.price}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BillingSettings 