import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table";
import { Input } from "../components/ui/Input";
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle, 
  Download,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Filter
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Subscriber {
  subscription_id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  service_name: string;
  status: string;
  start_date: string;
  next_billing_date: string;
}

export default function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ subscribers: Subscriber[] }>("/api/enterprise/subscribers");
      setSubscribers(res.subscribers);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubscribers = subscribers.filter(sub => 
    sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700 border-green-200">ACTIVE</Badge>;
      case "Paused":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">PAUSED</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse font-medium">Loading subscriber directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-slate-600">View and manage users subscribed to your services</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Subscribers</p>
                <p className="text-2xl font-bold text-slate-900">{subscribers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Accounts</p>
                <p className="text-2xl font-bold text-slate-900">
                  {subscribers.filter(s => s.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending/Paused</p>
                <p className="text-2xl font-bold text-slate-900">
                  {subscribers.filter(s => s.status !== "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Subscriber Directory</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-slate-200 bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-bold text-slate-700 py-4 px-6">User</TableHead>
                <TableHead className="font-bold text-slate-700">Service</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="font-bold text-slate-700">Enrolled On</TableHead>
                <TableHead className="font-bold text-slate-700">Next Bill</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.map((sub) => (
                <TableRow key={sub.subscription_id} className="hover:bg-slate-50/50 border-slate-50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {sub.user_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">{sub.user_name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Mail className="w-3 h-3" />
                          {sub.user_email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 font-medium">
                      {sub.service_name}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(sub.start_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">
                      {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubscribers.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Users className="w-10 h-10 mb-2 opacity-20" />
                      <p className="font-bold">No subscribers found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
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


