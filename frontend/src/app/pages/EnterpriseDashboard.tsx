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
  ArrowUpRight,
  Target,
  BarChart3,
  Download
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

export default function EnterpriseDashboard() {
  const stats = [
    { label: "Total Subscribers", value: "2,234", change: "+10.9%", trend: "up", icon: Users, color: "blue" },
    { label: "Monthly Revenue", value: "₹27,64,280", change: "+10.9%", trend: "up", icon: DollarSign, color: "green" },
    { label: "Churn Rate", value: "3.3%", change: "-0.3%", trend: "down", icon: TrendingDown, color: "purple" },
    { label: "Active Subscriptions", value: "8,456", change: "+5.2%", trend: "up", icon: Activity, color: "orange" },
  ];

  const subscriberGrowth = [
    { month: "Aug", subscribers: 1240 },
    { month: "Sep", subscribers: 1358 },
    { month: "Oct", subscribers: 1521 },
    { month: "Nov", subscribers: 1689 },
    { month: "Dec", subscribers: 1842 },
    { month: "Jan", subscribers: 2015 },
    { month: "Feb", subscribers: 2234 },
  ];

  const revenueData = [
    { month: "Aug", revenue: 18600 },
    { month: "Sep", revenue: 20370 },
    { month: "Oct", revenue: 22815 },
    { month: "Nov", revenue: 25335 },
    { month: "Dec", revenue: 27630 },
    { month: "Jan", revenue: 30225 },
    { month: "Feb", revenue: 33510 },
  ];

  const churnData = [
    { month: "Aug", rate: 5.2 },
    { month: "Sep", rate: 4.8 },
    { month: "Oct", rate: 4.5 },
    { month: "Nov", rate: 4.1 },
    { month: "Dec", rate: 3.9 },
    { month: "Jan", rate: 3.6 },
    { month: "Feb", rate: 3.3 },
  ];

  const categoryDistribution = [
    { name: "OTT Services", value: 42, color: "#3b82f6", count: 938 },
    { name: "SaaS", value: 35, color: "#8b5cf6", count: 782 },
    { name: "Music Streaming", value: 15, color: "#10b981", count: 335 },
    { name: "Utilities", value: 8, color: "#f59e0b", count: 179 },
  ];

  const topPerformers = [
    { name: "Netflix", subscribers: 456, revenue: 7294, growth: 12 },
    { name: "Spotify", subscribers: 398, revenue: 6766, growth: 8 },
    { name: "Microsoft 365", subscribers: 367, revenue: 3666, growth: 15 },
    { name: "Disney+", subscribers: 289, revenue: 2309, growth: 18 },
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
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      )}
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
              Subscriber Growth
            </CardTitle>
            <CardDescription>Monthly subscriber count trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={subscriberGrowth}>
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
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly recurring revenue (MRR)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Churn Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-purple-600" />
              Churn Rate Analysis
            </CardTitle>
            <CardDescription>Monthly customer churn percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={churnData}>
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
      </div>

      {/* Key Insights */}
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
                  <h4 className="font-semibold text-slate-900 mb-1">Strong Growth Momentum</h4>
                  <p className="text-sm text-slate-600">
                    Subscriber base increased by 10.9% this month, indicating healthy market adoption
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Improving Retention</h4>
                  <p className="text-sm text-slate-600">
                    Churn rate decreased to 3.3%, showing improved customer satisfaction and retention
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">OTT Dominance</h4>
                  <p className="text-sm text-slate-600">
                    OTT services lead with 42% of total subscriptions, followed by SaaS at 35%
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Revenue Optimization</h4>
                  <p className="text-sm text-slate-600">
                    Disney+ shows highest growth at 18%, presenting opportunities for focused marketing
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