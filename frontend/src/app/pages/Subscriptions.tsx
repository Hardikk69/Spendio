import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { 
  Plus, 
  Search, 
  PlayCircle, 
  PauseCircle, 
  XCircle, 
  Edit, 
  Trash2,
  MoreVertical,
  DollarSign,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Switch } from "../components/ui/Switch";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/Popover";
import { api } from "../../lib/api";

interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  billing_cycle: string;
  next_billing: string;
  status: string;
  autopay: boolean;
  logo_url?: string;
  brand_color?: string;
}

interface Stats {
  total: number;
  active: number;
  paused: number;
  expired: number;
  cancelled: number;
  monthly_total: number;
}

export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    category: "OTT",
    amount: "",
    billing_cycle: "Monthly",
    next_billing: "",
    status: "Active",
    autopay: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const [subsData, statsData] = await Promise.all([
        api.get<{ subscriptions: Subscription[] }>("/api/subscriptions/"),
        api.get<Stats>("/api/subscriptions/stats"),
      ]);
      setSubscriptions(subsData.subscriptions);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Subscription name is required";
    if (!form.amount || parseFloat(form.amount) <= 0) errors.amount = "Valid amount is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.next_billing) errors.next_billing = "Next billing date is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubscription = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await api.post("/api/subscriptions/", {
        ...form,
        amount: parseFloat(form.amount)
      });
      setIsAddDialogOpen(false);
      setForm({
        name: "",
        category: "OTT",
        amount: "",
        billing_cycle: "Monthly",
        next_billing: "",
        status: "Active",
        autopay: true,
      });
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.message || "Failed to create subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAutopay = async (id: string) => {
    try {
      await api.patch(`/api/subscriptions/${id}/autopay`);
      setSubscriptions(subscriptions.map(sub => 
        sub.id === id ? { ...sub, autopay: !sub.autopay } : sub
      ));
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/api/subscriptions/${id}/status`);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await api.del(`/api/subscriptions/${id}`);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      fetchSubscriptions(); // refresh stats
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || sub.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      Active: { color: "bg-green-100 text-green-700 border-green-300", icon: PlayCircle },
      Paused: { color: "bg-orange-100 text-orange-700 border-orange-300", icon: PauseCircle },
      Cancelled: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
      Expired: { color: "bg-slate-100 text-slate-700 border-slate-300", icon: XCircle },
    };
    const variant = variants[status] || variants.Active;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Subscriptions</h1>
          <p className="text-slate-600">View and manage your active subscriptions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogDescription>
                Enter the details of your subscription below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Netflix, Spotify" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="299" 
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    className={formErrors.amount ? "border-red-500" : ""}
                  />
                  {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OTT">OTT</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cycle">Billing Cycle</Label>
                  <Select value={form.billing_cycle} onValueChange={v => setForm({...form, billing_cycle: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Next Billing Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={form.next_billing}
                    onChange={e => setForm({...form, next_billing: e.target.value})}
                    className={formErrors.next_billing ? "border-red-500" : ""}
                  />
                  {formErrors.next_billing && <p className="text-xs text-red-500">{formErrors.next_billing}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2">
                <div className="flex items-center gap-2">
                  <ToggleRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Automatic Payments</span>
                </div>
                <Switch 
                  checked={form.autopay} 
                  onCheckedChange={v => setForm({...form, autopay: v})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">Cancel</Button>
              <Button onClick={handleAddSubscription} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchSubscriptions}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-900">{stats?.active ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-700 mb-1">Paused</p>
            <p className="text-3xl font-bold text-orange-900">{stats?.paused ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 mb-1">Expired</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.expired ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-900">{stats?.total ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubscriptions.map((sub) => (
          <Card key={sub.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center p-2" style={{ borderColor: 'rgba(95, 125, 110, 0.15)' }}>
                    {!failedLogos.has(sub.id) && sub.logo_url ? (
                      <img 
                        src={sub.logo_url} 
                        alt={sub.name}
                        className="w-full h-full object-contain"
                        onError={() => {
                          setFailedLogos(prev => new Set([...prev, sub.id]));
                        }}
                      />
                    ) : (
                      <span className="text-lg font-semibold" style={{ color: sub.brand_color || '#6366f1' }}>
                        {sub.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{sub.name}</CardTitle>
                    <CardDescription className="text-xs">{sub.category}</CardDescription>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="end">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        size="sm"
                        onClick={() => toggleStatus(sub.id)}
                      >
                        {sub.status === "Paused" ? (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Resume Subscription
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-4 h-4 mr-2" />
                            Pause Subscription
                          </>
                        )}
                      </Button>
                      <div className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md">
                        <div className="flex items-center gap-2">
                          {sub.autopay ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-sm">Auto-pay</span>
                        </div>
                        <Switch 
                          checked={sub.autopay} 
                          onCheckedChange={() => toggleAutopay(sub.id)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                        size="sm"
                        onClick={() => deleteSubscription(sub.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Subscription
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                {getStatusBadge(sub.status)}
                <Badge variant="outline" className="text-xs">
                  {sub.billing_cycle}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-semibold text-slate-900">₹{sub.amount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Next:</span>
                  <span className="font-medium text-slate-900">{sub.next_billing}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {sub.autopay ? (
                    <ToggleRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-slate-600">Auto-pay:</span>
                  <span className={`font-medium ${sub.autopay ? "text-green-600" : "text-slate-500"}`}>
                    {sub.autopay ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No subscriptions found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

