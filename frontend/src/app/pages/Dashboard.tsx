import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  PlayCircle,
  PauseCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  CheckCircle2
} from "lucide-react";
import { useOutletContext } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { userRole } = useOutletContext<{ userRole: string }>();

  const stats = [
    {
      label: "Active Subscriptions",
      value: "8",
      change: "+2",
      trend: "up",
      icon: PlayCircle,
      color: "green",
    },
    {
      label: "Monthly Spending",
      value: "₹15,420",
      change: "+₹990",
      trend: "up",
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "Upcoming Payments",
      value: "3",
      change: "Next 7 days",
      trend: "neutral",
      icon: Calendar,
      color: "orange",
    },
    {
      label: "Shared Subscriptions",
      value: "2",
      change: "Saving ₹1,980/mo",
      trend: "down",
      icon: CreditCard,
      color: "purple",
    },
  ];

  const recentSubscriptions = [
    { name: "Netflix Premium", status: "Active", amount: "₹649", nextBilling: "Feb 20, 2026", category: "OTT", autopay: true },
    { name: "Spotify Family", status: "Active", amount: "₹1,399", nextBilling: "Feb 22, 2026", category: "Music", autopay: true },
    { name: "Microsoft 365", status: "Active", amount: "₹799", nextBilling: "Feb 25, 2026", category: "SaaS", autopay: true },
    { name: "Adobe Creative Cloud", status: "Paused", amount: "₹4,599", nextBilling: "Mar 1, 2026", category: "SaaS", autopay: false },
    { name: "Disney+", status: "Active", amount: "₹649", nextBilling: "Feb 18, 2026", category: "OTT", autopay: true },
  ];

  const spendingData = [
    { month: "Aug", amount: 11760 },
    { month: "Sep", amount: 13080 },
    { month: "Oct", amount: 13650 },
    { month: "Nov", amount: 14400 },
    { month: "Dec", amount: 15050 },
    { month: "Jan", amount: 14490 },
    { month: "Feb", amount: 15470 },
  ];

  const upcomingPayments = [
    { service: "Disney+", amount: "₹649", date: "Feb 18", autopay: true },
    { service: "Netflix Premium", amount: "₹649", date: "Feb 20", autopay: true },
    { service: "Spotify Family", amount: "₹1,399", date: "Feb 22", autopay: true },
  ];

  const recentActivity = [
    { action: "Payment successful", subscription: "Spotify Family", time: "2 hours ago", type: "success" },
    { action: "Subscription paused", subscription: "Adobe Creative Cloud", time: "1 day ago", type: "warning" },
    { action: "Auto-pay enabled", subscription: "Microsoft 365", time: "3 days ago", type: "info" },
    { action: "Renewal reminder", subscription: "Netflix Premium", time: "5 days ago", type: "info" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      Active: { color: "bg-green-100 text-green-700 border-green-300", icon: PlayCircle },
      Paused: { color: "bg-orange-100 text-orange-700 border-orange-300", icon: PauseCircle },
      Cancelled: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
      Expired: { color: "bg-slate-100 text-slate-700 border-slate-300", icon: Clock },
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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, Rajesh Kumar!</h1>
        <p className="text-slate-600">Here's your subscription overview for February 2026</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : stat.trend === "down" ? (
                        <ArrowDownRight className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                      <span className={`text-xs ${
                        stat.trend === "up" ? "text-green-600" : 
                        stat.trend === "down" ? "text-blue-600" : 
                        "text-orange-600"
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === "green" ? "bg-green-100" :
                    stat.color === "blue" ? "bg-blue-100" :
                    stat.color === "orange" ? "bg-orange-100" :
                    "bg-purple-100"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === "green" ? "text-green-600" :
                      stat.color === "blue" ? "text-blue-600" :
                      stat.color === "orange" ? "text-orange-600" :
                      "text-purple-600"
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
            <CardDescription>Your monthly subscription spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  formatter={(value) => [`₹${value}`, "Amount"]}
                />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>Your latest subscription activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubscriptions.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{sub.name}</p>
                      {getStatusBadge(sub.status)}
                    </div>
                    <p className="text-xs text-slate-600">Next: {sub.nextBilling}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{sub.amount}</p>
                    {sub.autopay && (
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs mt-1">Auto-pay</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                <Bell className="w-3 h-3 mr-1" />
                3 Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-slate-900">{payment.service}</p>
                    <p className="text-xs text-slate-600">{payment.date}, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{payment.amount}</p>
                    {payment.autopay && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Auto-pay</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on your subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  activity.type === "success" ? "bg-green-500" :
                  activity.type === "warning" ? "bg-orange-500" :
                  "bg-blue-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-600">{activity.subscription}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}