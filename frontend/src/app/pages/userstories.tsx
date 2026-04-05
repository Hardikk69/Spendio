import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { Search, Users, Building2, Shield } from "lucide-react";

export default function UserStories() {
  const [searchTerm, setSearchTerm] = useState("");

  const userStories = [
    { id: "US001", role: "User", wantsTo: "Register using email and password", soThat: "Securely access the platform" },
    { id: "US002", role: "User", wantsTo: "Log in to my account", soThat: "Access my subscriptions and billing details" },
    { id: "US003", role: "Business User", wantsTo: "Register and create a business profile", soThat: "Manage enterprise-level subscriptions" },
    { id: "US004", role: "User", wantsTo: "Add multiple subscriptions", soThat: "Manage all services in one place" },
    { id: "US005", role: "User", wantsTo: "View subscription details", soThat: "Track renewal dates and billing cycles" },
    { id: "US006", role: "User", wantsTo: "Enable or disable auto-pay", soThat: "Control recurring payments" },
    { id: "US007", role: "User", wantsTo: "Receive renewal reminders", soThat: "Avoid missed payments" },
    { id: "US008", role: "User", wantsTo: "View billing history", soThat: "Track past payments and charges" },
    { id: "US009", role: "User", wantsTo: "Share a subscription with others", soThat: "Split the subscription cost fairly" },
    { id: "US010", role: "User", wantsTo: "View my individual bill share", soThat: "Know how much I need to pay" },
    { id: "US011", role: "User", wantsTo: "Receive notifications for payments and refunds", soThat: "Stay informed about transactions" },
    { id: "US012", role: "Enterprise", wantsTo: "View analytics dashboards", soThat: "Analyze subscriber growth and churn" },
    { id: "US013", role: "Enterprise", wantsTo: "Monitor active and inactive subscriptions", soThat: "Make data-driven decisions" },
    { id: "US014", role: "Admin", wantsTo: "View system-wide metrics", soThat: "Monitor overall platform performance" },
    { id: "US015", role: "Admin", wantsTo: "Manage users and enterprises", soThat: "Maintain system integrity" },
    { id: "US016", role: "Admin", wantsTo: "Monitor subscription activity", soThat: "Detect misuse or anomalies" },
    { id: "US017", role: "User", wantsTo: "Interact with an AI chatbot", soThat: "Get subscription-related information" },
    { id: "US018", role: "User", wantsTo: "Pause or cancel subscriptions", soThat: "Manage expenses flexibly" },
    { id: "US019", role: "User", wantsTo: "View payment status", soThat: "Confirm successful transactions" },
    { id: "US020", role: "Admin", wantsTo: "Send system-wide notifications", soThat: "Communicate updates effectively" },
    { id: "US021", role: "User", wantsTo: "Receive alerts for auto-pay failures", soThat: "Take corrective action in time" },
    { id: "US022", role: "Enterprise", wantsTo: "Export subscription reports", soThat: "Use data for external analysis" },
    { id: "US023", role: "User", wantsTo: "Manage shared subscriptions", soThat: "Avoid billing confusion" },
    { id: "US024", role: "User", wantsTo: "Receive spending insights", soThat: "Better understand my subscription usage" },
    { id: "US025", role: "Admin", wantsTo: "Manage platform configurations", soThat: "Ensure smooth system operation" },
  ];

  const filteredStories = userStories.filter(
    (story) =>
      story.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.wantsTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.soThat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    if (role === "User") {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300"><Users className="w-3 h-3 mr-1" />User</Badge>;
    } else if (role === "Enterprise") {
      return <Badge className="bg-green-100 text-green-700 border-green-300"><Building2 className="w-3 h-3 mr-1" />Enterprise</Badge>;
    } else if (role === "Admin") {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-300"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
    } else {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-300">{role}</Badge>;
    }
  };

  const roleStats = {
    user: userStories.filter(s => s.role === "User").length,
    enterprise: userStories.filter(s => s.role === "Enterprise").length,
    admin: userStories.filter(s => s.role === "Admin").length,
    business: userStories.filter(s => s.role === "Business User").length,
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Stories</CardTitle>
          <CardDescription>
            Comprehensive user stories capturing functional behavior and system interactions for all user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{roleStats.user}</p>
              <p className="text-sm text-blue-600">User Stories</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-2xl font-bold text-green-700">{roleStats.enterprise}</p>
              <p className="text-sm text-green-600">Enterprise Stories</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-2xl font-bold text-purple-700">{roleStats.admin}</p>
              <p className="text-sm text-purple-600">Admin Stories</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-2xl font-bold text-slate-700">{userStories.length}</p>
              <p className="text-sm text-slate-600">Total Stories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search user stories by ID, role, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* User Stories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All User Stories ({filteredStories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">User Role</TableHead>
                  <TableHead className="font-semibold">Wants To</TableHead>
                  <TableHead className="font-semibold">So That</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStories.map((story) => (
                  <TableRow key={story.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-blue-600">{story.id}</TableCell>
                    <TableCell>{getRoleBadge(story.role)}</TableCell>
                    <TableCell className="text-slate-700">{story.wantsTo}</TableCell>
                    <TableCell className="text-slate-600">{story.soThat}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredStories.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No user stories found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Story Format */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">User Story Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-slate-700 font-mono">
              As a <span className="text-blue-600 font-semibold">[User Role]</span>, I want to{" "}
              <span className="text-green-600 font-semibold">[Wants To]</span>, so that{" "}
              <span className="text-purple-600 font-semibold">[So That]</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

