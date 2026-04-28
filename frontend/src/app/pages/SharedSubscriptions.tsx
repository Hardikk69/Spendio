import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Slider } from "../components/ui/slider";
import { 
  Users, 
  Plus, 
  UserPlus,
  DollarSign,
  Share2,
  CheckCircle2,
  Clock,
  Mail,
  Loader2,
  AlertCircle,
  TrendingUp,
  X,
  Percent
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface ShareMember {
  id: string;
  name: string;
  email: string;
  share_amount: number;
  share_percent: number;
  status: string;
}

interface SharedSubscription {
  id: string;
  subscription_id: number;
  subscription_name: string;
  total_amount: number;
  your_share: number;
  your_percent: number;
  member_count: number;
  role: string;
  status: string;
  members: ShareMember[];
}

interface Invitation {
  id: string;
  subscription_name: string;
  inviter_name: string;
  share_amount: number;
  status: string;
}

interface UserSubscription {
  id: string;
  name: string;
  amount: number;
}

export default function SharedSubscriptions() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sharedSubscriptions, setSharedSubscriptions] = useState<SharedSubscription[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);

  // Form State
  const [inviteForm, setInviteForm] = useState({
    subscriptionId: "",
    email: "",
    sharePercent: 50,
    useCustomPercent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sharesData, invitesData, subsData] = await Promise.all([
        api.get<{ shares: SharedSubscription[] }>("/api/shared/"),
        api.get<{ invitations: Invitation[] }>("/api/shared/invitations"),
        api.get<{ subscriptions: any[] }>("/api/subscriptions/"),
      ]);
      setSharedSubscriptions(sharesData.shares);
      setInvitations(invitesData.invitations);
      setUserSubscriptions(subsData.subscriptions.map(s => ({ id: s.id, name: s.name, amount: s.amount })));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load shared subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async () => {
    if (!inviteForm.subscriptionId || !inviteForm.email) return;
    try {
      setIsSubmitting(true);
      const payload: any = {
        subscription_id: inviteForm.subscriptionId,
        email: inviteForm.email,
      };
      if (inviteForm.useCustomPercent) {
        payload.share_percent = inviteForm.sharePercent;
      }
      await api.post("/api/shared/invite", payload);
      setIsInviteDialogOpen(false);
      setInviteForm({ subscriptionId: "", email: "", sharePercent: 50, useCustomPercent: false });
      fetchData();
      showFeedback("Invitation sent successfully!");
    } catch (err: any) {
      showFeedback(err.message || "Failed to send invitation", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvitation = async (id: string, action: 'accept' | 'reject') => {
    try {
      await api.post(`/api/shared/invitations/${id}/${action}`);
      fetchData();
      showFeedback(`Invitation ${action}ed successfully`);
    } catch (err: any) {
      showFeedback(err.message || `Failed to ${action} invitation`, "error");
    }
  };

  const handleLeaveShare = async (id: string) => {
    if (!confirm("Are you sure you want to leave this shared subscription?")) return;
    try {
      await api.del(`/api/shared/${id}`);
      fetchData();
      showFeedback("Successfully left the shared vault");
    } catch (err: any) {
      showFeedback(err.message || "Failed to leave shared subscription", "error");
    }
  };

  const totalSavings = sharedSubscriptions.reduce((acc, sub) => {
    return acc + (sub.total_amount - sub.your_share);
  }, 0);

  if (loading && sharedSubscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse">Syncing shared vaults...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shared Subscriptions</h1>
          <p className="text-slate-600">View subscriptions split with friends and family</p>
        </div>
        {feedback && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedback.msg}
          </div>
        )}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Share Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share a Subscription</DialogTitle>
              <DialogDescription>Invite someone to split the cost of your subscription.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              {/* Subscription select */}
              <div className="space-y-2">
                <Label>Select Subscription</Label>
                <Select 
                  value={inviteForm.subscriptionId} 
                  onValueChange={v => setInviteForm({...inviteForm, subscriptionId: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {userSubscriptions.map(sub => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name} — ₹{sub.amount}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="invite-email">Friend's Email</Label>
                <Input 
                  id="invite-email" 
                  type="email" 
                  placeholder="friend@example.com"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                />
              </div>

              {/* Split Mode Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Split Mode</Label>
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        !inviteForm.useCustomPercent
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                      onClick={() => setInviteForm({...inviteForm, useCustomPercent: false, sharePercent: 50})}
                    >
                      Equal Split
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        inviteForm.useCustomPercent
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                      onClick={() => setInviteForm({...inviteForm, useCustomPercent: true})}
                    >
                      Custom %
                    </button>
                  </div>
                </div>

                {inviteForm.useCustomPercent && (
                  <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Their share</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-black text-blue-600">{inviteForm.sharePercent}</span>
                        <Percent className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>

                    <Slider
                      value={[inviteForm.sharePercent]}
                      onValueChange={(vals) => setInviteForm({...inviteForm, sharePercent: vals[0]})}
                      min={5}
                      max={95}
                      step={5}
                      className="w-full"
                    />

                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>5%</span>
                      <span>50%</span>
                      <span>95%</span>
                    </div>

                    {/* Preview breakdown */}
                    {selectedSubAmount > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="p-3 bg-white rounded-lg border border-blue-100 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Their Share</p>
                          <p className="text-lg font-black text-blue-600">
                            ₹{Math.round(selectedSubAmount * inviteForm.sharePercent / 100)}
                          </p>
                          <p className="text-[10px] text-slate-400">{inviteForm.sharePercent}% of ₹{selectedSubAmount}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-green-100 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Your Share</p>
                          <p className="text-lg font-black text-green-600">
                            ₹{Math.round(selectedSubAmount * (100 - inviteForm.sharePercent) / 100)}
                          </p>
                          <p className="text-[10px] text-slate-400">{100 - inviteForm.sharePercent}% of ₹{selectedSubAmount}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!inviteForm.useCustomPercent && selectedSubAmount > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      Cost will be split equally — <span className="font-bold text-slate-700">₹{Math.round(selectedSubAmount / 2)}/person</span>
                    </p>
                  </div>
                )}
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleInvite}
                disabled={isSubmitting || !inviteForm.subscriptionId || !inviteForm.email}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500 shadow-lg shadow-blue-200">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Shared Subscriptions</p>
                <p className="text-2xl font-bold text-blue-900">{sharedSubscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500 shadow-lg shadow-green-200">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-900">₹{totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500 shadow-lg shadow-purple-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Members</p>
                <p className="text-2xl font-bold text-purple-900">
                  {sharedSubscriptions.reduce((acc, sub) => acc + sub.member_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30 overflow-hidden">
          <CardHeader className="bg-orange-100/50 border-b border-orange-100">
            <div className="flex items-center justify-between font-medium">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
                <Mail className="w-5 h-5" />
                Pending Invitations
              </CardTitle>
              <Badge className="bg-orange-200 text-orange-800 border-orange-300">
                {invitations.length} New
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200 shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{invite.subscription_name}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Invited by <span className="font-semibold text-slate-800">{invite.inviter_name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Share</p>
                      <p className="font-bold text-blue-600">₹{invite.share_amount}/mo</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => handleInvitation(invite.id, 'accept')}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => handleInvitation(invite.id, 'reject')}>
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shared Subscriptions List */}
      <div className="space-y-4">
        {sharedSubscriptions.map((sub) => (
          <Card key={sub.id} className="overflow-hidden hover:shadow-xl transition-all border-slate-200 group">
            <CardHeader className="bg-slate-50 border-b border-slate-100 group-hover:bg-blue-50/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:scale-105 transition-transform">
                    {sub.subscription_name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
                      {sub.subscription_name}
                      <Badge className={sub.role === "Owner" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-blue-100 text-blue-700 border-blue-200 font-medium"}>
                        {sub.role === "Owner" ? <TrendingUp className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                        {sub.role}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium mt-1">
                      {sub.member_count} members active • Platform Total: ₹{sub.total_amount}/month
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Your Monthly Contribution</p>
                  <p className="text-3xl font-black text-blue-600">₹{sub.your_share}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-0 font-bold px-2 py-0.5 text-xs">
                      {sub.your_percent}%
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 font-bold px-3 py-1">
                      Saving ₹{(sub.total_amount - sub.your_share).toFixed(0)}/mo
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    Vault Members
                  </h4>
                  <div className="flex gap-2">
                    {sub.role === "Owner" && (
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => {
                        setInviteForm({...inviteForm, subscriptionId: sub.subscription_id.toString()});
                        setIsInviteDialogOpen(true);
                      }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleLeaveShare(sub.id)}>
                      <X className="w-4 h-4 mr-2" />
                      {sub.role === "Owner" ? "Dissolve" : "Leave Share"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sub.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-slate-100">
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-xs uppercase">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{member.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[120px]">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-sm">₹{member.share_amount}</p>
                        <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px] px-1.5 h-4 flex items-center font-bold mt-1">
                          <Percent className="w-2 h-2 mr-0.5" />
                          {member.share_percent}%
                        </Badge>
                        <div className="mt-1 flex items-center justify-end">
                          {member.status === "Accepted" ? (
                            <Badge className="bg-green-50 text-green-600 border-0 text-[10px] px-1.5 h-4 flex items-center font-bold">
                              <CheckCircle2 className="w-2 h-2 mr-1" />
                              ACTIVE
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-600 border-0 text-[10px] px-1.5 h-4 flex items-center font-bold">
                              <Clock className="w-2 h-2 mr-1" />
                              PENDING
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sharedSubscriptions.length === 0 && !loading && (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No active shares yet</h3>
              <p className="text-slate-500 max-w-[300px] mx-auto mt-2">
                Invite friends to split your costs and save together.
              </p>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => setIsInviteDialogOpen(true)}>
                Start First Share
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-white  to-white border-0 text-black overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Share2 className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl font-black">Shared Economy Protocol</CardTitle>
          <CardDescription className="text-slate-400">Mastering the art of splitting and saving</CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                1
              </div>
              <h4 className="font-bold text-lg">Connect Vaults</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your active subscriptions to the sharing engine. One vault, multiple beneficiaries.
              </p>
            </div>
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
                2
              </div>
              <h4 className="font-bold text-lg">Custom Splitting</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Choose equal splits or set custom percentages. Full control over how costs are distributed among members.
              </p>
            </div>
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-500/20">
                3
              </div>
              <h4 className="font-bold text-lg">Collective Yield</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock higher-tier plans (Family/Premium) while paying significantly less than individual tiers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}