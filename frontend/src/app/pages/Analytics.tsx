import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Activity,
  Target,
  Calendar,
  BarChart3,
  Lock,
  Loader2,
  AlertCircle
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface AnalyticsSummary {
  active_subscriptions: number;
  monthly_spending: number;
  upcoming_payments: number;
  shared_subscriptions: number;
}

interface ChartData {
  month: string;
  [key: string]: any;
}

export default function Analytics() {
  const { user } = useOutletContext<{ user: any }>();
  const isAdmin = user?.role === "admin";
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [subscriberGrowth, setSubscriberGrowth] = useState<ChartData[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<ChartData[]>([]);
  const [churnRate, setChurnRate] = useState<ChartData[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryData, trendData] = await Promise.all([
        api.get<{ summary: AnalyticsSummary }>("/api/analytics/summary"),
        api.get<ChartData[]>("/api/analytics/spending-trend"),
      ]);

      setSummary(summaryData.summary);
      setRevenueTrend(trendData);

      // Fetch admin-only charts if applicable
      if (isAdmin) {
        try {
          const [growthData, churnData] = await Promise.all([
            api.get<{ subscriber_growth: ChartData[] }>("/api/analytics/subscriber-growth"),
            api.get<{ churn_rate: ChartData[] }>("/api/analytics/churn-rate"),
          ]);
          setSubscriberGrowth(growthData.subscriber_growth);
          setChurnRate(churnData.churn_rate);
        } catch (adminErr) {
          console.warn("Failed to fetch admin stats", adminErr);
        }
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [isAdmin]);

  const stats = summary ? [
    { label: "Active Subscriptions", value: summary.active_subscriptions.toString(), change: "Current", trend: "up", icon: Activity },
    { label: "Monthly Spending", value: `₹${summary.monthly_spending.toLocaleString()}`, change: "Current", trend: "up", icon: DollarSign },
    { label: "Upcoming (7d)", value: summary.upcoming_payments.toString(), change: "Next 7 days", trend: "neutral", icon: Calendar },
    { label: "Shared Subs", value: summary.shared_subscriptions.toString(), change: "Active shares", trend: "up", icon: Users },
  ] : [];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse">Loading analytics engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-600">Personal spending insights and platform performance</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchAnalytics}>Retry</Button>
          </CardContent>
        </Card>
      )}

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
                      <span className="text-xs text-slate-500">{stat.change}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth - Admin Only */}
        <Card className={!isAdmin ? "opacity-75 relative overflow-hidden" : ""}>
          {!isAdmin && (
            <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-slate-500" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Admin Access Required</h4>
              <p className="text-sm text-slate-600 max-w-[240px]">Platform-wide growth metrics are only available to enterprise administrators.</p>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Subscriber Growth
            </CardTitle>
            <CardDescription>Monthly subscriber count trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={subscriberGrowth.length > 0 ? subscriberGrowth : []}>
                <defs>
                  <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="subscribers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSubscribers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Multi-Purpose Revenue / Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              {isAdmin ? "Platform Revenue" : "Spending Trend"}
            </CardTitle>
            <CardDescription>{isAdmin ? "Total MRR over time" : "Your monthly subscription spending"}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  formatter={(value) => [`₹${(value as number).toLocaleString()}`, isAdmin ? "Revenue" : "Amount"]}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Churn / User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Rate - Admin Only */}
        <Card className={!isAdmin ? "opacity-75 relative overflow-hidden" : ""}>
          {!isAdmin && (
            <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">Enterprise Churn Metrics: Restricted</p>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-purple-600" />
              Churn Rate Analysis
            </CardTitle>
            <CardDescription>Monthly customer churn percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={churnRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  formatter={(value) => [`${value}%`, "Churn Rate"]}
                />
                <Bar dataKey="rate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              {isAdmin ? "Enterprise Insights" : "Personal Insights"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Growth Overview</h4>
                    <p className="text-sm text-slate-600">
                      {isAdmin 
                        ? "Platform growth is maintaining a steady 10% month-over-month increase."
                        : "Your subscription count is stable this month. You've successfully managed your recurrings."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Efficiency Potential</h4>
                    <p className="text-sm text-slate-600">
                      {isAdmin
                        ? "Optimizing customer retention could reduce MRR leak by up to 5% next quarter."
                        : "Reviewing your paused subscriptions could save you more than ₹5,000 this year."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}