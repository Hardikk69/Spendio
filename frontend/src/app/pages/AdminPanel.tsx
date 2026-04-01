import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { 
  Shield, 
  Users, 
  Activity, 
  AlertCircle, 
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Eye,
  Settings as SettingsIcon,
  Database,
  Server
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { useState } from "react";

export default function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState("");

  const systemStats = [
    { label: "Total Users", value: "2,234", icon: Users, color: "blue" },
    { label: "Active Sessions", value: "1,847", icon: Activity, color: "green" },
    { label: "System Alerts", value: "3", icon: AlertCircle, color: "red" },
    { label: "Server Status", value: "Healthy", icon: Server, color: "green" },
  ];

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "User", subscriptions: 8, status: "Active", joinedDate: "Jan 15, 2025" },
    { id: 2, name: "Sarah Miller", email: "sarah@company.com", role: "Enterprise", subscriptions: 45, status: "Active", joinedDate: "Dec 10, 2024" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "User", subscriptions: 5, status: "Active", joinedDate: "Feb 1, 2026" },
    { id: 4, name: "Lisa Anderson", email: "lisa@example.com", role: "User", subscriptions: 12, status: "Suspended", joinedDate: "Nov 20, 2024" },
    { id: 5, name: "David Lee", email: "david@enterprise.com", role: "Enterprise", subscriptions: 67, status: "Active", joinedDate: "Oct 5, 2024" },
    { id: 6, name: "Emma Wilson", email: "emma@example.com", role: "User", subscriptions: 6, status: "Active", joinedDate: "Jan 28, 2026" },
  ];

  const systemAlerts = [
    { id: 1, type: "warning", message: "High server load detected", time: "2 hours ago" },
    { id: 2, type: "error", message: "Failed payment gateway connection", time: "5 hours ago" },
    { id: 3, type: "info", message: "Database backup completed", time: "1 day ago" },
  ];

  const recentActivity = [
    { action: "User Registration", user: "Emma Wilson", time: "10 minutes ago" },
    { action: "Subscription Created", user: "John Doe", time: "25 minutes ago" },
    { action: "Payment Processed", user: "Sarah Miller", time: "1 hour ago" },
    { action: "User Suspended", user: "Lisa Anderson", time: "2 hours ago" },
    { action: "Enterprise Signup", user: "David Lee", time: "3 hours ago" },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
    } else if (status === "Suspended") {
      return <Badge className="bg-red-100 text-red-700 border-red-300">Suspended</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    if (role === "Enterprise") {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-300">Enterprise</Badge>;
    } else if (role === "Admin") {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-slate-600">System-wide monitoring and management</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <SettingsIcon className="w-4 h-4 mr-2" />
          System Settings
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === "green" ? "bg-green-100" :
                    stat.color === "blue" ? "bg-blue-100" :
                    stat.color === "red" ? "bg-red-100" :
                    "bg-slate-100"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === "green" ? "text-green-600" :
                      stat.color === "blue" ? "text-blue-600" :
                      stat.color === "red" ? "text-red-600" :
                      "text-slate-600"
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Alerts */}
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                System Alerts
              </CardTitle>
              <CardDescription>Recent system notifications requiring attention</CardDescription>
            </div>
            <Badge className="bg-red-100 text-red-700 border-red-300">
              {systemAlerts.filter(a => a.type !== "info").length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                alert.type === "error" ? "border-red-200" :
                alert.type === "warning" ? "border-orange-200" :
                "border-blue-200"
              }`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  alert.type === "error" ? "bg-red-500" :
                  alert.type === "warning" ? "bg-orange-500" :
                  "bg-blue-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{alert.time}</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Subscriptions</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-600">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="font-medium">{user.subscriptions}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <SettingsIcon className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="w-4 h-4 mr-2" />
                                {user.status === "Suspended" ? "Activate" : "Suspend"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-600 truncate">{activity.user}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Platform Configuration
          </CardTitle>
          <CardDescription>System-wide settings and configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">Auto-pay Settings</h4>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 mb-3">Configure default auto-pay behavior</p>
              <Button size="sm" variant="outline" className="w-full">
                Configure
              </Button>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">Notification Rules</h4>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 mb-3">Manage notification triggers and templates</p>
              <Button size="sm" variant="outline" className="w-full">
                Manage
              </Button>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">Payment Gateway</h4>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-slate-600 mb-3">Payment gateway connection settings</p>
              <Button size="sm" variant="outline" className="w-full">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}