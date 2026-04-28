import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Users, 
  DollarSign,
  TrendingUp,
  Activity,
  Building2,
  Download,
  Loader2,
  AlertCircle,
  Plus,
  BarChart3,
  Search,
  Check,
  Package
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  
  // Service Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    category: "SaaS",
    provider: "",
    base_price: "",
    description: "",
    billing_cycle: "Monthly"
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, servicesRes, subscribersRes, growthRes] = await Promise.all([
        api.get<any>("/api/enterprise/stats"),
        api.get<{ services: any[] }>("/api/enterprise/services"),
        api.get<{ subscribers: any[] }>("/api/enterprise/subscribers"),
        api.get<any[]>("/api/enterprise/growth")
      ]);
      
      setStats(statsRes);
      setServices(servicesRes.services);
      setSubscribers(subscribersRes.subscribers);
      setGrowthData(growthRes);
    } catch (err: any) {
      setError(err.message || "Failed to load enterprise data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await api.post("/api/enterprise/services", newService);
      setIsCreateOpen(false);
      setNewService({
        name: "",
        category: "SaaS",
        provider: "",
        base_price: "",
        description: "",
        billing_cycle: "Monthly"
      });
      fetchData(); // Refresh all data
    } catch (err: any) {
      alert(err.message || "Failed to create service");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    { label: "Active Services", value: stats?.total_services || 0, icon: Package, color: "blue" },
    { label: "Total Subscribers", value: stats?.total_subscribers || 0, icon: Users, color: "purple" },
    { label: "Monthly Revenue", value: `₹${(stats?.monthly_revenue || 0).toLocaleString()}`, icon: DollarSign, color: "green" },
    { label: "Retention Rate", value: "98.2%", icon: Activity, color: "orange" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Enterprise Hub
          </h1>
          <p className="text-slate-600">Manage your services and track subscriber growth</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Report
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100">
                <Plus className="w-4 h-4 mr-2" />
                New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
                <DialogDescription>Launch a new subscription product to the marketplace</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateService} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input 
                      placeholder="e.g. Spendio Pro" 
                      value={newService.name}
                      onChange={e => setNewService({...newService, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider/Brand</Label>
                    <Input 
                      placeholder="e.g. Spendio Inc" 
                      value={newService.provider}
                      onChange={e => setNewService({...newService, provider: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                      placeholder="e.g. SaaS" 
                      value={newService.category}
                      onChange={e => setNewService({...newService, category: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Price (₹)</Label>
                    <Input 
                      type="number"
                      placeholder="999" 
                      value={newService.base_price}
                      onChange={e => setNewService({...newService, base_price: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Short description for the marketplace" 
                    value={newService.description}
                    onChange={e => setNewService({...newService, description: e.target.value})}
                  />
                </div>
                <Button className="w-full bg-blue-600" type="submit" disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Create Service
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                    stat.color === "green" ? "bg-green-50 text-green-600" :
                    stat.color === "purple" ? "bg-purple-50 text-purple-600" :
                    "bg-orange-50 text-orange-600"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Revenue and subscriber trends</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">Revenue</Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-100">Subscribers</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg">Recent Subscribers</CardTitle>
            <CardDescription>Latest users joined</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {subscribers.slice(0, 5).map((sub, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {sub.user_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{sub.user_name}</p>
                    <p className="text-xs text-slate-500 truncate">{sub.service_name}</p>
                  </div>
                  <Badge variant="outline" className={sub.status === 'Active' ? 'text-green-600 bg-green-50' : ''}>
                    {sub.status}
                  </Badge>
                </div>
              ))}
              {subscribers.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No subscribers yet
                </div>
              )}
            </div>
              <Button variant="ghost" className="w-full rounded-none text-blue-600 h-12 border-t" onClick={() => navigate("/user-management")}>
                View All Subscribers
              </Button>
            
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Managed Services</CardTitle>
            <CardDescription>Overview of your products in the marketplace</CardDescription>
          </div>
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 h-9" placeholder="Search services..." />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.service_id} className="border-slate-50 hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                      {service.category}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{service.base_price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-400">
                    You haven't created any services yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}