import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
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
  CheckCircle2,
  Loader2,
  AlertCircle,
  Wallet
} from "lucide-react";
import { useOutletContext } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface DashboardSummary {
  active_subscriptions: number;
  monthly_spending: number;
  upcoming_payments: number;
  shared_subscriptions: number;
  balance: number;
}

interface SpendingTrend {
  month: string;
  amount: number;
}

interface Subscription {
  id: string;
  name: string;
  status: string;
  amount: number;
  next_billing: string;
  category: string;
  autopay: boolean;
  billing_cycle: string;
}

interface UpcomingBill {
  subscription: string;
  amount: number;
  due_date: string;
  autopay: boolean;
}

export default function Dashboard() {
  const { user } = useOutletContext<{ user: any }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrend[]>([]);
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingBill[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [summaryData, trendData, subsData, upcomingData] = await Promise.all([
          api.get<{ summary: DashboardSummary }>("/api/analytics/summary"),
          api.get<SpendingTrend[]>("/api/analytics/spending-trend"),
          api.get<{ subscriptions: Subscription[] }>("/api/subscriptions/"),
          api.get<{ upcoming_bills: UpcomingBill[] }>("/api/billing/upcoming"),
        ]);

        setSummary(summaryData.summary);
        setSpendingTrend(trendData);
        setRecentSubs(subsData.subscriptions.slice(0, 5));
        setUpcoming(upcomingData.upcoming_bills.slice(0, 3));
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statsData = summary ? [
    {
      label: "Active Subscriptions",
      value: summary.active_subscriptions.toString(),
      change: "Stable",
      trend: "neutral",
      icon: PlayCircle,
      color: "green",
    },
    {
      label: "Monthly Spending",
      value: `₹${summary.monthly_spending.toLocaleString()}`,
      change: "Current",
      trend: "neutral",
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "Upcoming (7d)",
      value: summary.upcoming_payments.toString(),
      change: "Next 7 days",
      trend: "neutral",
      icon: Calendar,
      color: "orange",
    },
    {
      label: "Shared Subscriptions",
      value: summary.shared_subscriptions.toString(),
      change: "Active shares",
      trend: "neutral",
      icon: CreditCard,
      color: "purple",
    },
    {
      label: "Wallet Balance",
      value: `₹${summary.balance.toLocaleString()}`,
      change: "Available",
      trend: "neutral",
      icon: Wallet,
      color: "cyan",
    },
  ] : [];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto mt-12">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Connection Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.first_name} {user?.last_name}!</h1>
        <p className="text-slate-600">Here's your subscription overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === "green" ? "bg-green-100" :
                    stat.color === "blue" ? "bg-blue-100" :
                    stat.color === "orange" ? "bg-orange-100" :
                    stat.color === "purple" ? "bg-purple-100" :
                    "bg-cyan-100"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === "green" ? "text-green-600" :
                      stat.color === "blue" ? "text-blue-600" :
                      stat.color === "orange" ? "text-orange-600" :
                      stat.color === "purple" ? "text-purple-600" :
                      "text-cyan-600"
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
              <LineChart data={spendingTrend}>
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
              <Button variant="ghost" size="sm" onClick={() => window.location.href='/subscriptions'}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubs.length > 0 ? recentSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{sub.name}</p>
                      {getStatusBadge(sub.status)}
                    </div>
                    <p className="text-xs text-slate-600">Next: {sub.next_billing || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">₹{sub.amount}</p>
                    {sub.autopay && (
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs mt-1">Auto-pay</Badge>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center py-4 text-slate-500">No subscriptions found</p>
              )}
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
              {upcoming.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                  <Bell className="w-3 h-3 mr-1" />
                  {upcoming.length} Pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming.length > 0 ? upcoming.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-slate-900">{payment.subscription}</p>
                    <p className="text-xs text-slate-600">Due: {payment.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">₹{payment.amount}</p>
                    {payment.autopay && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">Auto-pay</span>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center py-4 text-slate-500">No upcoming payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Your Subscription</CardTitle>
          <CardDescription>Quick information based on your current data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-1">Optimization Tip</h4>
              <p className="text-sm text-blue-700">
                You have {recentSubs.filter(s => s.status === 'Paused').length} paused subscriptions. Review them to save up to 
                ₹{recentSubs.filter(s => s.status === 'Paused').reduce((acc, s) => acc + s.amount, 0)}/month.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-900 mb-1">Savings Alert</h4>
              <p className="text-sm text-green-700">
                Switching {recentSubs.filter(s => s.billing_cycle === 'Monthly' && s.amount > 500).length} higher-valued monthly plans to yearly could save you up to 15% annually.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

