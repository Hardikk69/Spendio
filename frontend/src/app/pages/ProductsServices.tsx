import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/Dialog";
import { MoreVertical, Check, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import { Label } from "../components/ui/Label";
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup";
import { api } from "../../lib/api";
import { useNavigate } from "react-router";

export default function ProductsServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");
  const [paymentType, setPaymentType] = useState<"solo" | "shared">("solo");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ services: any[] }>("/api/subscriptions/available-services");
        setServices(res.services);
      } catch (err: any) {
        setError(err.message || "Failed to load services");
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleOpenDialog = (service: any) => {
    setSelectedService(service);
    setIsDialogOpen(true);
    setError(null);
    setDuration("monthly");
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    const basePrice = Number(selectedService.base_price || 0);
    const amount = duration === "monthly" ? basePrice : basePrice * 10;
    const tax = amount * 0.18;
    return amount + tax;
  };

  const processSubscription = async () => {
    if (!selectedService) return;
    try {
      setIsSubscribing(true);
      setError(null);

      const nextBillingDate = new Date(
        Date.now() + (duration === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
      ).toISOString().split("T")[0];

      const payload = {
        service_id: selectedService.service_id,
        status: "Active",
        next_billing: nextBillingDate,
        autopay: false,
      };

      await api.post("/api/subscriptions/", payload);
      setIsDialogOpen(false);
      navigate("/subscriptions");
    } catch (err: any) {
      setError(err.message || "Failed to create subscription");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const categories = ["All Categories", ...Array.from(new Set(services.map(s => s.category || "Other")))];
  const filteredServices = selectedCategory === "All Categories" 
    ? services 
    : services.filter(s => (s.category || "Other") === selectedCategory);

  const getGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-emerald-500 to-emerald-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
            Marketplace
          </h1>
          <p className="text-slate-600">Discover and subscribe to services provided by our enterprise partners</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Filter by Category</CardTitle>
              <CardDescription>Browse through available service categories</CardDescription>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-64 bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {filteredServices.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed rounded-xl">
          <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
          <p>No services available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.service_id} className="hover:shadow-md transition-all duration-300 border-slate-200 overflow-hidden group">
              <div className={`h-2 bg-gradient-to-r ${getGradient(service.name)}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(service.name)} flex items-center justify-center text-2xl text-white shadow-sm`}>
                    {service.name.charAt(0)}
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">
                    {service.category || "Other"}
                  </Badge>
                </div>
                <div className="pt-4">
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{service.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2 mt-1">
                    {service.description || `Premium subscription service by ${service.provider || 'Enterprise'}`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">₹{service.base_price}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
                <Button 
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white transition-colors" 
                  onClick={() => handleOpenDialog(service)}
                >
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedService?.name}</DialogTitle>
            <DialogDescription>Configure your enterprise subscription</DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-6 pt-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(selectedService.name)} flex items-center justify-center text-xl text-white`}>
                  {selectedService.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedService.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{selectedService.description || 'Enterprise Service'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Billing Plan</Label>
                <RadioGroup value={duration} onValueChange={(val) => setDuration(val as any)}>
                  <div className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer font-medium">Monthly Plan</Label>
                    </div>
                    <span className="font-bold text-slate-900">₹{selectedService.base_price}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly" className="cursor-pointer font-medium">Yearly Plan</Label>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">₹{Number(selectedService.base_price) * 10}</span>
                      <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100 border-none">Save 16%</Badge>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 p-4 bg-slate-900 text-white rounded-xl shadow-inner">
                <div className="flex justify-between text-sm opacity-80">
                  <span>Subtotal</span>
                  <span>₹{duration === "monthly" ? selectedService.base_price : Number(selectedService.base_price) * 10}</span>
                </div>
                <div className="flex justify-between text-sm opacity-80">
                  <span>Tax (GST 18%)</span>
                  <span>₹{((duration === "monthly" ? selectedService.base_price : Number(selectedService.base_price) * 10) * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 mt-2 border-t border-white/10">
                  <span>Total Due</span>
                  <span className="text-blue-400">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setIsDialogOpen(false)} disabled={isSubscribing}>
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" 
                  onClick={processSubscription}
                  disabled={isSubscribing}
                >
                  {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Confirm & Start
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


