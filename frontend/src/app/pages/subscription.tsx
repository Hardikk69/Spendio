import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
  ToggleRight
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Set<number>>(new Set());

  const [subscriptions, setSubscriptions] = useState([
    { 
      id: 1, 
      name: "Netflix Premium", 
      category: "OTT", 
      amount: 649, 
      billingCycle: "Monthly", 
      nextBilling: "Feb 20, 2026", 
      status: "Active", 
      autopay: true,
      logo: "https://logo.clearbit.com/netflix.com",
      brandColor: "#E50914"
    },
    { 
      id: 2, 
      name: "Spotify Family", 
      category: "Music", 
      amount: 179, 
      billingCycle: "Monthly", 
      nextBilling: "Feb 22, 2026", 
      status: "Active", 
      autopay: true,
      logo: "https://logo.clearbit.com/spotify.com",
      brandColor: "#1DB954"
    },
    { 
      id: 3, 
      name: "Microsoft 365", 
      category: "SaaS", 
      amount: 489, 
      billingCycle: "Monthly", 
      nextBilling: "Feb 25, 2026", 
      status: "Active", 
      autopay: true,
      logo: "https://logo.clearbit.com/microsoft.com",
      brandColor: "#00A4EF"
    },
    { 
      id: 4, 
      name: "Adobe Creative Cloud", 
      category: "SaaS", 
      amount: 2999, 
      billingCycle: "Monthly", 
      nextBilling: "Mar 1, 2026", 
      status: "Paused", 
      autopay: false,
      logo: "https://logo.clearbit.com/adobe.com",
      brandColor: "#FF0000"
    },
    { 
      id: 5, 
      name: "Disney+ Hotstar", 
      category: "OTT", 
      amount: 299, 
      billingCycle: "Monthly", 
      nextBilling: "Feb 18, 2026", 
      status: "Active", 
      autopay: true,
      logo: "https://logo.clearbit.com/hotstar.com",
      brandColor: "#1F2A3C"
    },
    { 
      id: 6, 
      name: "Amazon Prime", 
      category: "OTT", 
      amount: 1499, 
      billingCycle: "Yearly", 
      nextBilling: "Feb 28, 2026", 
      status: "Active", 
      autopay: true,
      logo: "https://logo.clearbit.com/amazon.com",
      brandColor: "#00A8E1"
    },
    { 
      id: 7, 
      name: "Dropbox Plus", 
      category: "SaaS", 
      amount: 800, 
      billingCycle: "Monthly", 
      nextBilling: "Feb 19, 2026", 
      status: "Active", 
      autopay: false,
      logo: "https://logo.clearbit.com/dropbox.com",
      brandColor: "#0061FF"
    },
    { 
      id: 8, 
      name: "YouTube Premium", 
      category: "OTT", 
      amount: 149, 
      billingCycle: "Monthly", 
      nextBilling: "Jan 30, 2026", 
      status: "Expired", 
      autopay: false,
      logo: "https://logo.clearbit.com/youtube.com",
      brandColor: "#FF0000"
    },
  ]);

  const toggleAutopay = (id: number) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, autopay: !sub.autopay } : sub
    ));
  };

  const toggleStatus = (id: number) => {
    setSubscriptions(subscriptions.map(sub => {
      if (sub.id === id) {
        return { ...sub, status: sub.status === "Paused" ? "Active" : "Paused" };
      }
      return sub;
    }));
  };

  const deleteSubscription = (id: number) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
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

  const statusCounts = {
    all: subscriptions.length,
    active: subscriptions.filter(s => s.status === "Active").length,
    paused: subscriptions.filter(s => s.status === "Paused").length,
    expired: subscriptions.filter(s => s.status === "Expired").length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Subscriptions</h1>
          <p className="text-slate-600">View and manage your active subscriptions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-900">{statusCounts.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-700 mb-1">Paused</p>
            <p className="text-3xl font-bold text-orange-900">{statusCounts.paused}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 mb-1">Expired</p>
            <p className="text-3xl font-bold text-slate-900">{statusCounts.expired}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 mb-1">Total</p>
            <p className="text-3xl font-bold text-blue-900">{statusCounts.all}</p>
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
                    {!failedLogos.has(sub.id) ? (
                      <img 
                        src={sub.logo} 
                        alt={sub.name}
                        className="w-full h-full object-contain"
                        onError={() => {
                          setFailedLogos(prev => new Set([...prev, sub.id]));
                        }}
                      />
                    ) : (
                      <span className="text-lg font-semibold" style={{ color: sub.brandColor }}>
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
                  {sub.billingCycle}
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
                  <span className="font-medium text-slate-900">{sub.nextBilling}</span>
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

      {filteredSubscriptions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No subscriptions found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
