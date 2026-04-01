
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Code,
  Database,
  CreditCard,
  Globe,
  TestTube,
  Rocket,
  Sparkles
} from "lucide-react";

export default function DevPhases() {
  const phases = [
    {
      phase: 1,
      name: "Requirement Analysis & Planning",
      week: "Week 1",
      icon: FileText,
      color: "blue",
      status: "completed",
      deliverables: [
        "Finalized Software Requirements Specification (SRS)",
        "Functional and Non-Functional Requirement List",
        "MVP Scope Definition",
        "Technology Stack Finalization",
        "Project Timeline and Milestones",
      ],
      activities: [
        "Analyze system requirements for users, enterprises, and administrators",
        "Identify core subscription management and auto-payment functionalities",
        "Define constraints, assumptions, and dependencies",
        "Plan development workflow and task allocation",
      ],
    },
    {
      phase: 2,
      name: "System Design",
      week: "Week 2",
      icon: Globe,
      color: "green",
      status: "completed",
      deliverables: [
        "System Architecture Diagram",
        "Database ER Diagram",
        "UI Wireframes and Screen Mockups",
        "REST API Design Specification",
      ],
      activities: [
        "Design layered client-server architecture",
        "Define database schema for users, subscriptions, payments, and notifications",
        "Create UI layouts for dashboards and management screens",
        "Review designs for consistency with SRS requirements",
      ],
    },
    {
      phase: 3,
      name: "Database Integration",
      week: "Week 2-3",
      icon: Database,
      color: "purple",
      status: "in-progress",
      deliverables: [
        "Implemented Database Schema",
        "Integrated PostgreSQL Database",
        "ORM Mappings using SQLAlchemy",
      ],
      activities: [
        "Design and implement database tables for users, subscriptions, payments, and notifications",
        "Configure PostgreSQL database and connect it to the backend",
        "Implement ORM models using SQLAlchemy",
        "Perform initial data validation and integrity checks",
      ],
    },
    {
      phase: 4,
      name: "Backend Development",
      week: "Week 3-4",
      icon: Code,
      color: "orange",
      status: "in-progress",
      deliverables: [
        "Backend RESTful APIs (Flask)",
        "Authentication and Role-Based Access Control",
        "Subscription Lifecycle Management Module",
        "Simulated Billing and Payment Module",
      ],
      activities: [
        "Implement core business logic using Flask and SQLAlchemy",
        "Develop APIs for subscription creation, updates, and tracking",
        "Integrate payment gateway for simulated transactions",
        "Implement security measures and data validation",
      ],
    },
    {
      phase: 5,
      name: "Payment Gateway Integration",
      week: "Week 4-5",
      icon: CreditCard,
      color: "teal",
      status: "pending",
      deliverables: [
        "Integrated Payment Gateway (Razorpay – Simulated)",
        "Payment Workflow Implementation",
        "Transaction Validation Reports",
      ],
      activities: [
        "Integrate Razorpay payment gateway for simulated transactions",
        "Implement payment initiation and status handling",
        "Validate subscription payment and auto-pay workflows",
        "Test payment success, failure, and refund scenarios",
      ],
    },
    {
      phase: 6,
      name: "Frontend Development",
      week: "Week 5-6",
      icon: Globe,
      color: "blue",
      status: "pending",
      deliverables: [
        "Web-based User Interface (React JS)",
        "User, Enterprise, and Admin Dashboards",
        "Notification and Alert Interfaces",
      ],
      activities: [
        "Develop responsive UI components using React",
        "Integrate frontend with backend APIs",
        "Implement dashboards for subscription tracking and analytics",
        "Display billing history and payment status",
      ],
    },
    {
      phase: 7,
      name: "Testing & Quality Assurance",
      week: "Week 7",
      icon: TestTube,
      color: "red",
      status: "pending",
      deliverables: [
        "Test Plan and Test Case Documents",
        "Functional and Integration Test Results",
        "Bug Fixes and Optimization Reports",
      ],
      activities: [
        "Perform unit, integration, and system testing",
        "Validate subscription workflows and payment simulations",
        "Ensure compliance with non-functional requirements",
        "Fix defects and improve system stability",
      ],
    },
    {
      phase: 8,
      name: "Deployment & Maintenance",
      week: "Week 8",
      icon: Rocket,
      color: "purple",
      status: "pending",
      deliverables: [
        "Deployed Web Application",
        "Database Configuration and Backup Setup",
        "Basic Monitoring and Logging",
      ],
      activities: [
        "Deploy the application in a controlled environment",
        "Configure database and server settings",
        "Monitor system performance and reliability",
        "Prepare the system for demonstration and evaluation",
      ],
    },
    {
      phase: 9,
      name: "MVP Release & Future Enhancements",
      week: "Week 9",
      icon: Sparkles,
      color: "green",
      status: "pending",
      deliverables: [
        "Minimum Viable Product (MVP) of Spendio",
        "User Documentation",
        "Feedback and Enhancement Plan",
      ],
      activities: [
        "Release MVP with core subscription management features",
        "Collect feedback from users and evaluators",
        "Identify enhancements such as mobile support and advanced AI insights",
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-700" },
      green: { bg: "bg-green-50", border: "border-green-500", text: "text-green-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-500", text: "text-purple-700" },
      orange: { bg: "bg-orange-50", border: "border-orange-500", text: "text-orange-700" },
      teal: { bg: "bg-teal-50", border: "border-teal-500", text: "text-teal-700" },
      red: { bg: "bg-red-50", border: "border-red-500", text: "text-red-700" },
    };
    return colors[color] || colors.blue;
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (status === "in-progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-300">
          <Calendar className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Development Phases</CardTitle>
          <CardDescription>
            Agile-based phased approach with systematic progress and early validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {phases.filter(p => p.status === "completed").length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {phases.filter(p => p.status === "in-progress").length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Pending</span>
              </div>
              <p className="text-2xl font-bold text-slate-700">
                {phases.filter(p => p.status === "pending").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          const colors = getColorClasses(phase.color);
          return (
            <Card key={idx} className="ml-20 relative">
              {/* Timeline dot */}
              <div className={`absolute -left-[60px] top-6 w-8 h-8 rounded-full ${colors.bg} ${colors.border} border-4 flex items-center justify-center z-10`}>
                <Icon className={`w-4 h-4 ${colors.text}`} />
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">
                        Phase {phase.phase}
                      </Badge>
                      <Badge className={`${colors.bg} ${colors.text} border-0`}>
                        {phase.week}
                      </Badge>
                      {getStatusBadge(phase.status)}
                    </div>
                    <CardTitle>{phase.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deliverables */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Deliverables
                    </h4>
                    <ul className="space-y-1">
                      {phase.deliverables.map((deliverable, dIdx) => (
                        <li key={dIdx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Activities */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Activities
                    </h4>
                    <ul className="space-y-1">
                      {phase.activities.map((activity, aIdx) => (
                        <li key={aIdx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {activity}
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

      {/* Project Approach */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Agile Development Approach</CardTitle>
          <CardDescription>
            Iterative cycles of requirement analysis, design, development, testing, and deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-2">Key Principles</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Iterative development with continuous feedback</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Early validation and testing</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Flexibility for enhancements</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Modular and scalable architecture</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold text-slate-900 mb-2">Timeline Overview</h4>
              <ul className="space-y-2">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Total Duration</span>
                  <Badge className="bg-purple-100 text-purple-700">9 Weeks</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Planning & Design</span>
                  <Badge variant="outline">2 Weeks</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Development</span>
                  <Badge variant="outline">4 Weeks</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Testing & Deployment</span>
                  <Badge variant="outline">2 Weeks</Badge>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">MVP Release</span>
                  <Badge variant="outline">1 Week</Badge>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}