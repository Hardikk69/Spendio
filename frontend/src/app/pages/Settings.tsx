import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { 
  User as UserIcon, 
  CreditCard, 
  Bell, 
  Shield,
  CheckCircle2,
  Save,
  Loader2,
  AlertCircle,
  Key
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile State
  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Settings State
  const [notifications, setNotifications] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);

  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifsData, paymentData] = await Promise.all([
        api.get<{ notifications: any }>("/api/settings/notifications"),
        api.get<{ payment_settings: any }>("/api/settings/payment"),
      ]);
      setNotifications(notifsData.notifications);
      setPayment(paymentData.payment_settings);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      fetchData();
    }
  }, [user]);

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      await api.patch("/api/settings/profile", profile);
      showFeedback("Profile updated successfully");
    } catch (err: any) {
      showFeedback(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showFeedback("New passwords do not match", "error");
      return;
    }
    try {
      setSaving(true);
      await api.patch("/api/settings/password", {
        current_password: passwords.current,
        new_password: passwords.new
      });
      setPasswords({ current: "", new: "", confirm: "" });
      showFeedback("Password updated successfully");
    } catch (err: any) {
      showFeedback(err.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = async (field: string, value: boolean) => {
    try {
      const updated = { ...notifications, [field]: value };
      await api.put("/api/settings/notifications", { [field]: value });
      setNotifications(updated);
    } catch (err: any) {
      showFeedback("Failed to update notification setting", "error");
    }
  };

  const updatePaymentSetting = async (updates: any) => {
    try {
      const updated = { ...payment, ...updates };
      await api.put("/api/settings/payment", updates);
      setPayment(updated);
      showFeedback("Payment settings updated");
    } catch (err: any) {
      showFeedback("Failed to update payment setting", "error");
    }
  };

  if (loading && !notifications) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-600">Preferences and security configurations</p>
        </div>
        {feedback && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-1 ${
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback.msg}
          </div>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            Profile Information
          </CardTitle>
          <CardDescription>Public identity and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input 
                value={profile.first_name}
                onChange={e => setProfile({...profile, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input 
                value={profile.last_name}
                onChange={e => setProfile({...profile, last_name: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              type="email" 
              value={profile.email} 
              disabled // Email usually fixed
            />
            <p className="text-[10px] text-slate-500 italic">Contact support to change your verified email.</p>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              type="tel" 
              value={profile.phone}
              onChange={e => setProfile({...profile, phone: e.target.value})}
            />
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleUpdateProfile}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Payment Configuration */}
      <Card className="border-blue-100 bg-blue-50/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Auto-pay Protocol
          </CardTitle>
          <CardDescription>Global defaults for subscription lifecycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
            <div>
              <Label className="text-slate-900 font-bold">Global Auto-pay</Label>
              <p className="text-xs text-slate-500">Automatically enable auto-pay for all new vaults</p>
            </div>
            <Switch 
              checked={payment?.enable_autopay}
              onCheckedChange={v => updatePaymentSetting({enable_autopay: v})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <Label>Preferred Billing Cycle</Label>
              <Select 
                value={payment?.preferred_billing_cycle} 
                onValueChange={v => updatePaymentSetting({preferred_billing_cycle: v})}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly (Discounted)</SelectItem>
                  <SelectItem value="Yearly">Yearly (Best Value)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>System Recovery</Label>
              <div className="flex items-center justify-between p-2 h-10 px-3 bg-white border rounded-md">
                <span className="text-sm font-medium text-slate-600">Auto-retry failed</span>
                <Switch 
                  checked={payment?.auto_retry_failed}
                  onCheckedChange={v => updatePaymentSetting({auto_retry_failed: v})}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Alert Engine
          </CardTitle>
          <CardDescription>Configure trigger points for communication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: 'renewal_reminders', label: 'Renewal Reminders', desc: '7-day advance notice for recurring charges' },
            { id: 'payment_confirmations', label: 'Payment Success', desc: 'Instant alerts on successful transactions' },
            { id: 'payment_failure_alerts', label: 'Failure Protocols', desc: 'Critical alerts if a payment engine stalls' },
            { id: 'shared_invites', label: 'Vault Invitations', desc: 'When colleagues invite you to share costs' },
            { id: 'spending_insights', label: 'Intelligence Reports', desc: 'Monthly deep-dives into spending habits' },
          ].map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
              <div>
                <Label className="text-slate-900 font-bold">{opt.label}</Label>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
              <Switch 
                checked={notifications?.[opt.id]}
                onCheckedChange={v => toggleNotification(opt.id, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Security Vault
          </CardTitle>
          <CardDescription>Authentication and infrastructure access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="password" 
                  className="pl-10"
                  value={passwords.current}
                  onChange={e => setPasswords({...passwords, current: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password"
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New</Label>
                <Input 
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100 mt-4">
            <div>
              <Label className="text-slate-900 font-bold">2FA Authorization</Label>
              <p className="text-xs text-slate-500">MFA enforcement for all sensitive operations</p>
            </div>
            <Switch 
              checked={payment?.two_factor_auth}
              onCheckedChange={v => updatePaymentSetting({two_factor_auth: v})}
            />
          </div>

          <Button 
            variant="outline" 
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={handleUpdatePassword}
            disabled={saving || !passwords.current || !passwords.new}
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Credentials
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
