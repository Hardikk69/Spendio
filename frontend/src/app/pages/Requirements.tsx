import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { 
  Zap, 
  Shield, 
  Gauge, 
  Users, 
  Globe,
  Database,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function Requirements() {
  const functionalRequirements = [
    {
      category: "User Management",
      items: [
        "User and business registration and authentication",
        "Role-based access control (User, Enterprise, Admin)",
        "Profile management and settings",
        "Password recovery and reset functionality",
      ],
    },
    {
      category: "Subscription Management",
      items: [
        "Add, edit, and delete subscriptions",
        "View subscription details and renewal dates",
        "Subscription lifecycle management (Active, Paused, Cancelled, Expired)",
        "Multiple subscription categories (OTT, SaaS, utilities)",
        "Shared subscriptions with bill-splitting",
      ],
    },
    {
      category: "Payment & Billing",
      items: [
        "Auto-pay enrollment and configuration",
        "Billing frequency settings",
        "Payment status tracking",
        "Billing history and transaction logs",
        "Payment gateway integration (simulated)",
        "Individual bill share calculation",
      ],
    },
    {
      category: "Notifications & Alerts",
      items: [
        "Renewal reminders",
        "Payment confirmations",
        "Auto-pay failure alerts",
        "Refund notifications",
        "System-wide announcements (Admin)",
      ],
    },
    {
      category: "Analytics & Reporting",
      items: [
        "Enterprise analytics dashboards",
        "Subscriber growth and churn trends",
        "Active vs inactive subscription monitoring",
        "Export subscription reports",
        "Spending insights for users",
      ],
    },
    {
      category: "AI & Assistance",
      items: [
        "AI chatbot for subscription queries",
        "Informational subscription insights",
        "Read-only assistance features",
      ],
    },
  ];

  const nonFunctionalRequirements = [
    {
      category: "Performance",
      icon: Gauge,
      color: "blue",
      items: [
        "Response time ≤ 2 seconds for standard operations",
        "Response time ≤ 5 seconds for complex operations",
        "Support up to 100 concurrent users",
        "Optimized database queries and indexing",
      ],
    },
    {
      category: "Security & Privacy",
      icon: Shield,
      color: "red",
      items: [
        "Encrypted credential storage",
        "No persistence of sensitive banking data",
        "Secure API endpoints with authentication",
        "Role-based access control enforcement",
        "HTTPS encryption for data transmission",
      ],
    },
    {
      category: "Usability",
      icon: Users,
      color: "green",
      items: [
        "Intuitive and accessible UI",
        "Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+",
        "Responsive design for desktop and tablet",
        "Consistent navigation and layout",
      ],
    },
    {
      category: "Reliability",
      icon: CheckCircle2,
      color: "purple",
      items: [
        "99% uptime during business hours",
        "Graceful error handling",
        "User-friendly error messages",
        "Automatic recovery mechanisms",
        "Comprehensive error logging",
      ],
    },
    {
      category: "Scalability",
      icon: TrendingUp,
      color: "orange",
      items: [
        "Horizontal scaling support",
        "Load balancing capabilities",
        "Database optimization for growth",
        "Microservices-ready architecture",
      ],
    },
    {
      category: "Maintainability",
      icon: Database,
      color: "teal",
      items: [
        "Modular design architecture",
        "Well-documented codebase",
        "Version control and change tracking",
        "Easy enhancement and feature addition",
      ],
    },
  ];

  const assumptions = [
    "Users have access to a stable and reliable internet connection",
    "System accessed through modern web browsers with JavaScript enabled",
    "Users possess basic digital literacy",
    "Payment functionalities rely on third-party gateway services",
    "Dependency on cloud hosting and database services",
    "AI features based on predefined rules and informational models",
    "Performance dependent on server resources and network conditions",
  ];

  const futureEnhancements = [
    "Expense tracking and budgeting tools",
    "Advanced AI-based spending recommendations",
    "Enhanced enterprise forecasting and reporting",
    "Mobile application support (iOS and Android)",
    "Automated subscription optimization",
    "Multi-language support",
    "Advanced data visualization tools",
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
      teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>System Requirements</CardTitle>
          <CardDescription>
            Comprehensive functional and non-functional requirements for the Spendio system
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Requirements Tabs */}
      <Tabs defaultValue="functional" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="functional" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Functional Requirements
          </TabsTrigger>
          <TabsTrigger value="non-functional" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Non-Functional Requirements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="functional" className="space-y-4 mt-6">
          {functionalRequirements.map((section, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="non-functional" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nonFunctionalRequirements.map((section, idx) => {
              const Icon = section.icon;
              const colors = getColorClasses(section.color);
              return (
                <Card key={idx} className={`${colors.border}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`${colors.bg} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      {section.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                          <span className="text-sm text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assumptions and Dependencies */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Assumptions and Dependencies
          </CardTitle>
          <CardDescription>
            Key assumptions and dependencies considered during design and development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {assumptions.map((assumption, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{assumption}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancements */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Future Enhancements
          </CardTitle>
          <CardDescription>
            Planned features and improvements for future versions of Spendio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {futureEnhancements.map((enhancement, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                <Badge className="bg-green-100 text-green-700 border-green-300">Future</Badge>
                <span className="text-sm text-slate-700">{enhancement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}