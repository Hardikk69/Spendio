import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  Shield, 
  Users as UsersIcon, 
  Activity, 
  AlertCircle, 
  Search,
  MoreVertical,
  CheckCircle,
  Eye,
  Settings as SettingsIcon,
  Database,
  Server,
  Loader2,
  Trash2,
  UserCog
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface AdminStats {
  total_users: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_revenue: number;
}

interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        api.get<AdminStats>("/api/admin/dashboard"),
        api.get<{ users: User[], total: number, pages: number }>(`/api/admin/users?page=${page}&search=${searchTerm}`),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setTotalPages(usersData.pages);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unauthorized or failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [page, searchTerm]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;
    try {
      await api.del(`/api/admin/users/${userId}`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "enterprise") {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-bold">ENTERPRISE</Badge>;
    } else if (role === "admin") {
      return <Badge className="bg-blue-600 text-white border-0 font-bold">ADMIN</Badge>;
    }
    return <Badge variant="outline" className="text-slate-500 font-bold">USER</Badge>;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse font-medium">Booting administration console...</p>
        </div>
      </div>
    );
  }

  const systemStats = stats ? [
    { label: "Platform Users", value: stats.total_users.toLocaleString(), icon: UsersIcon, color: "blue" },
    { label: "Total Subscriptions", value: stats.total_subscriptions.toLocaleString(), icon: Activity, color: "green" },
    { label: "Active Revenue (MRR)", value: `₹${stats.total_revenue.toLocaleString()}`, icon: Database, color: "purple" },
    { label: "Core Service", value: "Healthy", icon: Server, color: "green" },
  ] : [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            Central Command
          </h1>
          <p className="text-slate-500 font-medium mt-1">Platform-wide oversight and user governance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAdminData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">
            <SettingsIcon className="w-4 h-4 mr-2" />
            System Config
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 shadow-sm animate-in fade-in zoom-in">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">Access Restricted or Connection Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-red-200 hover:bg-red-100" onClick={fetchAdminData}>Retry Authentication</Button>
          </CardContent>
        </Card>
      )}

      {/* System Stats Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default group">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl transform group-hover:rotate-6 transition-transform ${
                    stat.color === "green" ? "bg-green-50 text-green-600" :
                    stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                    stat.color === "purple" ? "bg-purple-50 text-purple-600" :
                    "bg-slate-50 text-slate-600"
                  }`}>
                    <Icon className="w-6 h-6 shadow-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Management Module */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">User Registry</CardTitle>
              <CardDescription className="text-slate-500">Live feed of all accounts across the ecosystem</CardDescription>
            </div>
            <div className="relative w-72 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Find user by name or email..."
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
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-bold text-slate-700 py-4 px-6 uppercase text-[10px] tracking-widest w-[40%]">Identity</TableHead>
                <TableHead className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Classification</TableHead>
                <TableHead className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Enrolled since</TableHead>
                <TableHead className="font-bold text-slate-700 text-right uppercase text-[10px] tracking-widest pr-6">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id} className="hover:bg-blue-50/30 transition-colors border-slate-100 group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 group-hover:border-blue-200 group-hover:bg-white transition-all">
                        {user.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-tight truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white border-transparent hover:border-slate-200">
                          <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-xl border-slate-200">
                        <DropdownMenuItem className="cursor-pointer font-medium">
                          <Eye className="w-4 h-4 mr-2 text-slate-400" />
                          View Dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleUpdateRole(user.user_id, user.role === 'admin' ? 'user' : 'admin')}>
                          <UserCog className="w-4 h-4 mr-2 text-blue-500" />
                          {user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleDeleteUser(user.user_id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Purge Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-bold text-lg">No matches in the registry</p>
                      <p className="text-sm">Try adjusting your search parameters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Footer */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 shadow-sm font-bold text-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous Protocol
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 shadow-sm font-bold text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next Protocol
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
