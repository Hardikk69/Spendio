import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Building2,
  Download,
  Loader2,
  AlertCircle,
  BarChart3,
  Target
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function EnterpriseDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [summaryRes, trendRes] = await Promise.all([
          api.get<{ summary: any }>("/api/analytics/summary"),
          api.get<any[]>("/api/analytics/spending-trend")
        ]);
        setSummary(summaryRes.summary);
        setTrendData(trendRes.map(item => ({
          month: item.month,
          revenue: item.amount,
          subscribers: Math.floor(item.amount / 500) || 0
        })));
      } catch (err: any) {
        setError(err.message || "Failed to load enterprise data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-red-600 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const stats = [
    { 
      label: "Total Subscriptions", 
      value: summary?.total_subscriptions || 0, 
      change: "+10.9%", 
      trend: "up", 
      icon: Activity, 
      color: "blue" 
    },
    { 
      label: "Monthly Spending", 
      value: `₹${(summary?.monthly_spending || 0).toLocaleString()}`, 
      change: "+12.1%", 
      trend: "up", 
      icon: DollarSign, 
      color: "green" 
    },
    { 
      label: "Active Members", 
      value: summary?.active_subscriptions || 0, 
      change: "+5.2%", 
      trend: "up", 
      icon: Users, 
      color: "purple" 
    },
    { 
      label: "Upcoming Renewals", 
      value: summary?.upcoming_renewals || 0, 
      change: "-2.3%", 
      trend: "down", 
      icon: TrendingDown, 
      color: "orange" 
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Enterprise Dashboard
          </h1>
          <p className="text-slate-600">Comprehensive subscription analytics and insights</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
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
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === "blue" ? "bg-blue-100" :
                    stat.color === "green" ? "bg-green-100" :
                    stat.color === "purple" ? "bg-purple-100" :
                    "bg-orange-100"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === "blue" ? "text-blue-600" :
                      stat.color === "green" ? "text-green-600" :
                      stat.color === "purple" ? "text-purple-600" :
                      "text-orange-600"
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Growth Trend
            </CardTitle>
            <CardDescription>Monthly active user count trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
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

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Spending Trend
            </CardTitle>
            <CardDescription>Monthly subscription expenditure</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  formatter={(value) => [`₹${(value as number).toLocaleString()}`, "Spending"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Cost Optimization</h4>
                  <p className="text-sm text-slate-600">
                    Switching to annual plans for top 3 services could save ₹45,000 yearly.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Member Activity</h4>
                  <p className="text-sm text-slate-600">
                    User engagement is up 15% across enterprise-wide SaaS tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}