import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  AlertCircle,
  Check,
  Package,
  Clock,
  Tag,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { api } from "../../lib/api";

export default function EnterpriseServices() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create/Edit Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "SaaS",
    provider: "",
    base_price: "",
    description: "",
    billing_cycle: "Monthly"
  });

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ services: any[] }>("/api/enterprise/services");
      setServices(res.services);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingService) {
        await api.put(`/api/enterprise/services/${editingService.service_id}`, formData);
      } else {
        await api.post("/api/enterprise/services", formData);
      }
      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      provider: service.provider,
      base_price: service.base_price.toString(),
      description: service.description || "",
      billing_cycle: service.billing_cycle || "Monthly"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Are you sure you want to remove this service from the marketplace?")) return;
    try {
      await api.del(`/api/enterprise/services/${serviceId}`);
      fetchServices();
    } catch (err: any) {
      alert(err.message || "Failed to delete service");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "SaaS",
      provider: "",
      base_price: "",
      description: "",
      billing_cycle: "Monthly"
    });
    setEditingService(null);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-blue-600" />
            Service Management
          </h1>
          <p className="text-slate-600">Create and manage the subscription products you offer</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100">
              <Plus className="w-4 h-4 mr-2" />
              Launch New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Launch New Service"}</DialogTitle>
              <DialogDescription>
                Define the details of your subscription offering
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input 
                  placeholder="e.g. Enterprise Cloud Pro" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    placeholder="e.g. SaaS" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base Price (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="1499" 
                    value={formData.base_price}
                    onChange={e => setFormData({...formData, base_price: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Provider Brand</Label>
                <Input 
                  placeholder="Your Company Name" 
                  value={formData.provider}
                  onChange={e => setFormData({...formData, provider: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="What makes this service special?" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <Button className="w-full bg-blue-600" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                {editingService ? "Save Changes" : "Create Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-9 bg-slate-50/50" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.service_id} className="border border-slate-100 hover:shadow-md transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
                      {service.name.charAt(0)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(service.service_id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Remove Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="pt-3">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                        {service.category}
                      </Badge>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{service.billing_cycle}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                    {service.description || "No description provided."}
                  </p>
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Monthly Cost</p>
                      <p className="text-xl font-bold text-slate-900">₹{service.base_price}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      Stats <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No services found</p>
              <p className="text-sm text-slate-400">Try adjusting your search or launch a new service</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management Section */}
      <div className="pt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-600" />
          Marketplace Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(services.map(s => s.category))).slice(0, 3).map((cat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="text-slate-500">65% Active</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-blue-500 rounded-full`} style={{ width: `${80 - idx * 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-2 border-slate-200 hover:bg-slate-50">
                <Tag className="w-5 h-5 text-green-600" />
                <span className="text-xs">Bulk Discount</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 border-slate-200 hover:bg-slate-50">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="text-xs">Uptime Logs</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
