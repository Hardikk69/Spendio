import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Users, 
  Building2, 
  Shield, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";
import { Progress } from "../components/ui/progress";

export default function Overview() {
  const keyMetrics = [
    { label: "User Stories", value: "25", icon: Users, color: "bg-blue-500" },
    { label: "Dev Phases", value: "9", icon: Calendar, color: "bg-purple-500" },
    { label: "User Roles", value: "3", icon: Shield, color: "bg-green-500" },
    { label: "Weeks Timeline", value: "9", icon: Clock, color: "bg-orange-500" },
  ];

  const features = [
    "User and business registration and authentication",
    "Role-based access control (User, Enterprise, Admin)",
    "Subscription management for multiple services",
    "Auto-pay enrollment with configurable billing frequency",
    "Subscription lifecycle states management",
    "Billing history and payment status tracking",
    "Shared subscriptions with bill-splitting support",
    "Dashboard-based notifications and alerts",
    "Enterprise analytics and churn trends",
    "Administrative dashboards for system monitoring",
    "AI chatbot for subscription queries",
  ];

  const projectProgress = {
    "Requirement Analysis": 100,
    "System Design": 100,
    "Database Integration": 85,
    "Backend Development": 60,
    "Frontend Development": 40,
    "Testing & QA": 0,
  };

  return (
    <div className="space-y-6">
      {/* Project Introduction */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl text-white">Spendio SRS Overview</CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Subscription Enterprise Management System
              </CardDescription>
            </div>
            <Badge className="bg-green-500 text-white border-0 px-4 py-1">
              Version 1.0
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-blue-50 leading-relaxed">
            Spendio is an enterprise-oriented subscription lifecycle and auto-payment management 
            platform designed to centralize the management of subscription-based services for 
            individual users, businesses, and administrators.
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`${metric.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    <p className="text-sm text-slate-600">{metric.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Purpose & Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              This Software Requirements Specification (SRS) outlines the functional and 
              non-functional requirements of the Subscription Enterprise Management System (Spendio). 
              It defines the system's scope, features, constraints, and expected behavior, serving 
              as a common reference for stakeholders throughout design, development, testing, and validation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Intended Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                "Project stakeholders",
                "Developers and software engineers",
                "Testers and quality assurance teams",
                "System designers and architects",
                "Faculty evaluators and reviewers",
              ].map((audience, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{audience}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Product Features */}
      <Card>
        <CardHeader>
          <CardTitle>Major Product Features</CardTitle>
          <CardDescription>Core capabilities of the Spendio system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Development Progress</CardTitle>
          <CardDescription>Current status of each development phase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(projectProgress).map(([phase, progress]) => (
              <div key={phase} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{phase}</span>
                  <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
          <CardDescription>Architecture and tools used in Spendio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Frontend</h4>
              <p className="text-sm text-blue-700">React JS, HTML, CSS</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Backend</h4>
              <p className="text-sm text-green-700">Python Flask with RESTful APIs</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Database</h4>
              <p className="text-sm text-purple-700">PostgreSQL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle>System User Roles</CardTitle>
          <CardDescription>Role-based access control in Spendio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">User</h4>
              <p className="text-sm text-slate-600">
                Manage personal subscriptions, enable auto-pay, share subscriptions, and view billing history
              </p>
            </div>
            <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
              <Building2 className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Enterprise</h4>
              <p className="text-sm text-slate-600">
                Access analytics dashboards, monitor subscriber growth, analyze churn trends, and export reports
              </p>
            </div>
            <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Admin</h4>
              <p className="text-sm text-slate-600">
                System-wide monitoring, user management, platform configuration, and anomaly detection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}