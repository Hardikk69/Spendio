
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Shield, 
  Settings as SettingsIcon,
  Bell,
  MessageSquare,
  Menu,
  X,
  Building2,
  FileText,
  UserCog,
  Share2,
  ShoppingBag,
  LogOut
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";
import NotificationsPanel from "../components/NotificationsPanel";
import { AIChatbot } from "../components/AIChatbot";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";

export default function Root() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  // Fetch quick stats for layout
  useEffect(() => {
    if (user) {
      api.get<{ summary: { active_subscriptions: number } }>("/api/analytics/summary")
        .then(data => setSubscriptionCount(data.summary?.active_subscriptions || 0))
        .catch(() => {});
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const userRole = user?.role || "user";

  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["user"] },
    { name: "Products / Services", path: "/products", icon: ShoppingBag, roles: ["user"] },
    { name: "Subscriptions", path: "/subscriptions", icon: CreditCard, roles: ["user"] },
    { name: "Billing", path: "/billing", icon: CreditCard, roles: ["user"] },
    { name: "Shared Subscriptions", path: "/shared", icon: Share2, roles: ["user"] },
    
    // Enterprise
    { name: "Dashboard", path: "/enterprise", icon: LayoutDashboard, roles: ["enterprise"] },
    { name: "User Management", path: "/user-management", icon: Users, roles: ["enterprise"] },
    { name: "Analytics", path: "/analytics", icon: TrendingUp, roles: ["enterprise"] },
    
    // Admin
    { name: "Dashboard", path: "/admin", icon: Shield, roles: ["admin"] },
    { name: "User Management", path: "/admin", icon: Users, roles: ["admin"] }, // Reusing AdminPanel for management
    { name: "Analytics", path: "/analytics", icon: TrendingUp, roles: ["admin"] },
    
    // Common
    { name: "Settings", path: "/settings", icon: SettingsIcon, roles: ["user", "enterprise", "admin"] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole));

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user) return "??";
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F6F3]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F6F3' }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: 'rgba(95, 125, 110, 0.15)' }}>
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div onClick={() => navigate("/")} className="cursor-pointer">
                <h1 className="text-xl tracking-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#5F7D6E' }}>
                  spend<span style={{ position: 'relative' }}>i<span style={{ position: 'absolute', top: '-2px', right: '-1px', width: '4px', height: '4px', backgroundColor: '#E3B587', borderRadius: '50%' }}></span></span>o
                </h1>
                <p className="text-xs hidden sm:block" style={{ color: '#6B7280' }}>Subscription Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <Badge 
                variant="outline" 
                className="hidden sm:inline-flex capitalize"
                style={{ borderColor: 'rgba(95, 125, 110, 0.3)', color: '#5F7D6E' }}
              >
                {userRole}
              </Badge>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" style={{ color: '#5F7D6E' }} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E3B587' }} />
              </Button>

              {/* User Profile */}
              <div className="flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid rgba(95, 125, 110, 0.15)' }}>
                <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate("/settings")}>
                  <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: 'rgba(95, 125, 110, 0.1)', color: '#5F7D6E' }}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium" style={{ color: '#1F2933' }}>{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs truncate w-24" style={{ color: '#6B7280' }}>{user?.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white min-h-[calc(100vh-60px)] sticky top-[60px]" style={{ borderRight: '1px solid rgba(95, 125, 110, 0.15)' }}>
          <nav className="p-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={active ? {
                    color: '#5F7D6E',
                    backgroundColor: 'rgba(95, 125, 110, 0.1)'
                  } : {
                    color: '#6B7280'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                  {item.name === "Subscriptions" && subscriptionCount > 0 && (
                    <Badge className="ml-auto border-0 text-xs" style={{ backgroundColor: 'rgba(227, 181, 135, 0.2)', color: '#E3B587' }}>
                      {subscriptionCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet context={{ user }} />
        </main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      
      {/* AI Chatbot - Fixed Bottom Right */}
      <AIChatbot />
    </div>
  );
}