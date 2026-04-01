import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Layers, Server, Database, Globe, Code, Shield } from "lucide-react";

export default function Architecture() {
  const architectureLayers = [
    {
      layer: "Presentation Layer",
      icon: Globe,
      color: "blue",
      technologies: ["React JS", "HTML5", "CSS3", "Tailwind CSS"],
      description: "User interface and client-side rendering",
      responsibilities: [
        "User interaction handling",
        "Dashboard visualization",
        "Form validation and submission",
        "Responsive design implementation",
      ],
    },
    {
      layer: "Application Layer",
      icon: Code,
      color: "green",
      technologies: ["Python Flask", "RESTful APIs", "JWT Authentication"],
      description: "Business logic and API endpoints",
      responsibilities: [
        "Request processing and routing",
        "Business logic execution",
        "Authentication and authorization",
        "API endpoint management",
      ],
    },
    {
      layer: "Data Layer",
      icon: Database,
      color: "purple",
      technologies: ["PostgreSQL", "SQLAlchemy ORM"],
      description: "Data persistence and management",
      responsibilities: [
        "Data storage and retrieval",
        "Transaction management",
        "Database indexing and optimization",
        "Data integrity enforcement",
      ],
    },
  ];

  const systemComponents = [
    {
      name: "Authentication Service",
      description: "Handles user registration, login, and session management",
      features: ["JWT token generation", "Password encryption", "Role-based access control"],
    },
    {
      name: "Subscription Management",
      description: "Core subscription lifecycle and tracking",
      features: ["CRUD operations", "Lifecycle state management", "Renewal tracking"],
    },
    {
      name: "Payment Gateway",
      description: "Simulated payment processing (Razorpay integration)",
      features: ["Payment initiation", "Status tracking", "Transaction validation"],
    },
    {
      name: "Notification Engine",
      description: "Handles all system notifications and alerts",
      features: ["Email notifications", "In-app alerts", "Scheduled reminders"],
    },
    {
      name: "Analytics Module",
      description: "Enterprise analytics and reporting",
      features: ["Data aggregation", "Trend analysis", "Report generation"],
    },
    {
      name: "AI Chatbot",
      description: "Subscription query assistance",
      features: ["Rule-based responses", "Query interpretation", "Information retrieval"],
    },
  ];

  const databaseSchema = [
    {
      table: "users",
      description: "User account information",
      columns: ["user_id (PK)", "email", "password_hash", "role", "created_at"],
    },
    {
      table: "subscriptions",
      description: "Subscription records",
      columns: ["subscription_id (PK)", "user_id (FK)", "service_name", "status", "billing_cycle", "amount"],
    },
    {
      table: "payments",
      description: "Payment transaction history",
      columns: ["payment_id (PK)", "subscription_id (FK)", "amount", "status", "transaction_date"],
    },
    {
      table: "shared_subscriptions",
      description: "Shared subscription management",
      columns: ["share_id (PK)", "subscription_id (FK)", "user_id (FK)", "share_amount"],
    },
    {
      table: "notifications",
      description: "User notifications and alerts",
      columns: ["notification_id (PK)", "user_id (FK)", "type", "message", "status", "created_at"],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-600" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "text-green-600" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-600" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
          <CardDescription>
            Layered client-server architecture overview for the Spendio system
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Architecture Overview */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 mb-4">
            Spendio follows a <span className="font-semibold">layered client-server architecture</span> that 
            separates concerns across presentation, application, and data layers. This modular approach 
            ensures scalability, maintainability, and clear separation of responsibilities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-900">Frontend: React JS</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <Server className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">Backend: Flask</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <Database className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-slate-900">Database: PostgreSQL</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Layers */}
      <div className="space-y-4">
        {architectureLayers.map((layer, idx) => {
          const Icon = layer.icon;
          const colors = getColorClasses(layer.color);
          return (
            <Card key={idx} className={colors.border}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${colors.bg} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <CardTitle>{layer.layer}</CardTitle>
                      <CardDescription>{layer.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${colors.bg} ${colors.text} border-0`}>
                    Layer {idx + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {layer.technologies.map((tech, techIdx) => (
                        <Badge key={techIdx} variant="outline" className="text-slate-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Responsibilities</h4>
                    <ul className="space-y-1">
                      {layer.responsibilities.map((resp, respIdx) => (
                        <li key={respIdx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            System Components
          </CardTitle>
          <CardDescription>Major functional components of the Spendio system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemComponents.map((component, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h4 className="font-semibold text-slate-900 mb-1">{component.name}</h4>
                <p className="text-sm text-slate-600 mb-3">{component.description}</p>
                <div className="space-y-1">
                  {component.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                      <span className="text-xs text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Database Schema Overview
          </CardTitle>
          <CardDescription>PostgreSQL database tables and relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {databaseSchema.map((table, idx) => (
              <div key={idx} className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-purple-900">{table.table}</h4>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    Table
                  </Badge>
                </div>
                <p className="text-sm text-purple-700 mb-2">{table.description}</p>
                <div className="flex flex-wrap gap-2">
                  {table.columns.map((column, colIdx) => (
                    <Badge key={colIdx} variant="outline" className="text-xs text-slate-700 font-mono">
                      {column}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Design */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-green-600" />
            RESTful API Design
          </CardTitle>
          <CardDescription>Backend API endpoint structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { method: "POST", endpoint: "/api/auth/register", description: "User registration" },
              { method: "POST", endpoint: "/api/auth/login", description: "User authentication" },
              { method: "GET", endpoint: "/api/subscriptions", description: "Get all subscriptions" },
              { method: "POST", endpoint: "/api/subscriptions", description: "Create subscription" },
              { method: "PUT", endpoint: "/api/subscriptions/:id", description: "Update subscription" },
              { method: "DELETE", endpoint: "/api/subscriptions/:id", description: "Delete subscription" },
              { method: "GET", endpoint: "/api/payments/:id", description: "Get payment history" },
              { method: "POST", endpoint: "/api/payments/initiate", description: "Initiate payment" },
              { method: "GET", endpoint: "/api/analytics/dashboard", description: "Get analytics data" },
            ].map((api, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                <Badge className={`font-mono ${
                  api.method === "GET" ? "bg-blue-100 text-blue-700" :
                  api.method === "POST" ? "bg-green-100 text-green-700" :
                  api.method === "PUT" ? "bg-orange-100 text-orange-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {api.method}
                </Badge>
                <code className="text-sm font-mono text-slate-700 flex-1">{api.endpoint}</code>
                <span className="text-sm text-slate-600">{api.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}