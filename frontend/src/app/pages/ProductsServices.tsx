import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { MoreVertical, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

const servicesData = {
  Entertainment: [
    {
      name: "Netflix",
      logo: "🎬",
      description: "Watch unlimited movies, TV shows, and more",
      pricing: { monthly: 649, yearly: 7788 },
      color: "from-red-500 to-red-600"
    },
    {
      name: "Amazon Prime Video",
      logo: "📺",
      description: "Unlimited streaming of movies and TV shows",
      pricing: { monthly: 179, yearly: 1499 },
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Disney+ Hotstar",
      logo: "✨",
      description: "Watch your favorite Disney, Marvel, Star Wars content",
      pricing: { monthly: 299, yearly: 1499 },
      color: "from-blue-600 to-purple-600"
    },
  ],
  Music: [
    {
      name: "Spotify",
      logo: "🎵",
      description: "Listen to millions of songs and podcasts",
      pricing: { monthly: 119, yearly: 1189 },
      color: "from-green-500 to-green-600"
    },
    {
      name: "Apple Music",
      logo: "🎼",
      description: "Stream over 100 million songs ad-free",
      pricing: { monthly: 99, yearly: 999 },
      color: "from-pink-500 to-red-500"
    },
    {
      name: "YouTube Music",
      logo: "🎶",
      description: "Official songs, albums, music videos, and more",
      pricing: { monthly: 99, yearly: 1190 },
      color: "from-red-500 to-orange-500"
    },
  ],
  "Developer Tools": [
    {
      name: "GitHub",
      logo: "💻",
      description: "Code hosting platform for version control",
      pricing: { monthly: 329, yearly: 3300 },
      color: "from-gray-700 to-gray-900"
    },
    {
      name: "AWS",
      logo: "☁️",
      description: "Amazon Web Services cloud computing platform",
      pricing: { monthly: 2500, yearly: 27000 },
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "JetBrains",
      logo: "🔧",
      description: "Professional developer tools and IDEs",
      pricing: { monthly: 899, yearly: 8990 },
      color: "from-purple-500 to-purple-700"
    },
    {
      name: "Microsoft Azure",
      logo: "⚡",
      description: "Cloud computing services for building apps",
      pricing: { monthly: 3000, yearly: 32000 },
      color: "from-blue-500 to-blue-700"
    },
  ],
  "AI / GPT": [
    {
      name: "ChatGPT Plus",
      logo: "🤖",
      description: "Advanced AI language model with GPT-4 access",
      pricing: { monthly: 1650, yearly: 19800 },
      color: "from-emerald-500 to-teal-600"
    },
    {
      name: "GitHub Copilot",
      logo: "🧠",
      description: "AI pair programmer that helps you write code",
      pricing: { monthly: 829, yearly: 8290 },
      color: "from-indigo-500 to-purple-600"
    },
  ],
  Productivity: [
    {
      name: "Microsoft 365",
      logo: "📊",
      description: "Office apps, cloud storage, and advanced security",
      pricing: { monthly: 489, yearly: 4899 },
      color: "from-blue-600 to-blue-700"
    },
    {
      name: "Adobe Creative Cloud",
      logo: "🎨",
      description: "Complete collection of creative apps and services",
      pricing: { monthly: 4249, yearly: 42490 },
      color: "from-red-600 to-pink-600"
    },
    {
      name: "Notion",
      logo: "📝",
      description: "All-in-one workspace for notes, docs, and projects",
      pricing: { monthly: 399, yearly: 3990 },
      color: "from-slate-700 to-slate-900"
    },
  ],
  Utilities: [
    {
      name: "1Password",
      logo: "🔐",
      description: "Password manager for families and businesses",
      pricing: { monthly: 249, yearly: 2490 },
      color: "from-blue-600 to-indigo-700"
    },
    {
      name: "Dropbox",
      logo: "📦",
      description: "Cloud storage and file synchronization service",
      pricing: { monthly: 799, yearly: 7990 },
      color: "from-blue-500 to-blue-600"
    },
  ],
};

export default function ProductsServices() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Entertainment");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");
  const [paymentType, setPaymentType] = useState<"solo" | "shared">("solo");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = Object.keys(servicesData);
  const services = servicesData[selectedCategory as keyof typeof servicesData] || [];

  const handleSubscribe = (service: any) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    const basePrice = selectedService.pricing[duration];
    const tax = basePrice * 0.18; // 18% GST
    return basePrice + tax;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products & Services</h1>
          <p className="text-slate-600">Discover and subscribe to services across different categories</p>
        </div>
      </div>

      {/* Category Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Browse Categories</CardTitle>
              <CardDescription>Select a category to view available services</CardDescription>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue />
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {service.logo}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSubscribe(service)}>
                      Subscribe Now
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="pt-2">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="text-sm mt-1">{service.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">₹{service.pricing.monthly}</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">Monthly: ₹{service.pricing.monthly}</Badge>
                <Badge variant="outline" className="text-xs">Yearly: ₹{service.pricing.yearly}</Badge>
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={() => handleSubscribe(service)}
              >
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedService?.name}</DialogTitle>
            <DialogDescription>Configure your subscription details</DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-6 pt-4">
              {/* Service Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedService.color} flex items-center justify-center text-2xl`}>
                  {selectedService.logo}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedService.name}</h3>
                  <p className="text-sm text-slate-600">{selectedService.description}</p>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Billing Cycle</Label>
                <RadioGroup value={duration} onValueChange={(val) => setDuration(val as any)}>
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                    </div>
                    <span className="font-semibold">₹{selectedService.pricing.monthly}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly" className="cursor-pointer">Yearly</Label>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">₹{selectedService.pricing.yearly}</span>
                      <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Save 10%</Badge>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Payment Type</Label>
                <RadioGroup value={paymentType} onValueChange={(val) => setPaymentType(val as any)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="solo" id="solo" />
                    <Label htmlFor="solo" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">Solo Payment</p>
                        <p className="text-xs text-slate-500">You pay the full amount</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <RadioGroupItem value="shared" id="shared" />
                    <Label htmlFor="shared" className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">Shared Payment</p>
                        <p className="text-xs text-slate-500">Split the cost with others</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Base Price</span>
                  <span className="font-semibold">₹{selectedService.pricing[duration]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">GST (18%)</span>
                  <span className="font-semibold">₹{(selectedService.pricing[duration] * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Check className="w-4 h-4 mr-2" />
                  Start Subscription
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}