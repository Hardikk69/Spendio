import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Loader2,
  Wallet,
  Plus,
  X,
  RefreshCw,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Transaction {
  id: string;
  transaction_id: string;
  date: string;
  subscription_name: string;
  amount: number;
  status: string;
  payment_method: string;
}

interface UpcomingBill {
  subscription_id: string;
  subscription: string;
  amount: number;
  due_date: string;
  autopay: boolean;
  status: string;
}

interface BillingStats {
  total_spent_year: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
}

interface PaymentMsg {
  type: "success" | "error" | "info";
  text: string;
}

export default function Billing() {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Payment UI state
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<PaymentMsg | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  const fetchBillingData = async (period = filterPeriod) => {
    try {
      setLoading(true);
      const periodQuery = period !== "all" ? `?period=${period}` : "";
      const [historyData, upcomingData, statsData, walletData] = await Promise.all([
        api.get<{ transactions: Transaction[] }>(`/api/billing/transactions${periodQuery}`),
        api.get<{ upcoming_bills: UpcomingBill[] }>("/api/billing/upcoming"),
        api.get<BillingStats>("/api/billing/stats"),
        api.get<{ balance: number }>("/api/billing/wallet-balance"),
      ]);
      setPaymentHistory(historyData.transactions);
      setUpcomingBills(upcomingData.upcoming_bills);
      setStats(statsData);
      setWalletBalance(walletData.balance);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData(filterPeriod);
  }, [filterPeriod]);

  // Auto-dismiss payment message after 6 seconds
  useEffect(() => {
    if (!paymentMsg) return;
    const t = setTimeout(() => setPaymentMsg(null), 6000);
    return () => clearTimeout(t);
  }, [paymentMsg]);

  // ─── Razorpay Helpers ──────────────────────────────────────────────────────

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const getUserPrefill = () => {
    try {
      const u = JSON.parse(localStorage.getItem("spendio_user") || "{}");
      return { name: u.name || "Spendio User", email: u.email || "" };
    } catch {
      return { name: "Spendio User", email: "" };
    }
  };

  /**
   * Core Razorpay flow:
   *  1. GET /create-order  → order_id, amount, currency, key
   *  2. Open Razorpay modal
   *  3. On success → POST /verify-payment → signature check + wallet increment
   *
   * @param amountInr   Amount in ₹ (e.g. 499)
   * @param txnId       Existing failed Payment.payment_id to mark as Success, or null for top-up
   */
  const initiatePayment = (amountInr: number, txnId: string | null = null): Promise<void> =>
    new Promise(async (resolve) => {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaymentMsg({ type: "error", text: "Payment gateway failed to load. Check your internet connection." });
        return resolve();
      }

      let orderData: any;
      try {
        orderData = await api.post<any>("/api/billing/create-order", { amount: amountInr });
      } catch (err: any) {
        setPaymentMsg({ type: "error", text: err.message || "Could not create payment order. Try again." });
        return resolve();
      }

      const prefill = getUserPrefill();

      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Spendio",
        description: txnId ? "Subscription Payment" : "Wallet Top-up",
        order_id: orderData.order_id,
        prefill: { name: prefill.name, email: prefill.email },
        theme: { color: "#2563EB" },
        modal: {
          // User dismissed the checkout modal without paying
          ondismiss: () => {
            setPaymentMsg({ type: "info", text: "Payment cancelled — no amount was charged." });
            setPayingId(null);
            setAddMoneyLoading(false);
            resolve();
          },
        },
        handler: async (response: any) => {
          try {
            const result = await api.post<any>("/api/billing/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction_id: txnId,
              amount: amountInr,
            });

            // Sync wallet balance from authoritative server value
            if (typeof result.new_balance === "number") {
              setWalletBalance(result.new_balance);
            }

            setPaymentMsg({
              type: "success",
              text: txnId
                ? `Payment of ₹${amountInr} successful! Wallet balance updated.`
                : `₹${amountInr} added to your Spendio wallet!`,
            });

            await fetchBillingData();
          } catch (err: any) {
            setPaymentMsg({ type: "error", text: err.message || "Payment verification failed. Contact support." });
          } finally {
            setPayingId(null);
            setAddMoneyLoading(false);
            resolve();
          }
        },
      });

      rzp.on("payment.failed", (response: any) => {
        setPaymentMsg({
          type: "error",
          text: response?.error?.description || "Payment failed. Please try a different method.",
        });
        setPayingId(null);
        setAddMoneyLoading(false);
        resolve();
      });


      rzp.open();
    });

  // ─── Action Handlers ───────────────────────────────────────────────────────

  const handlePayTransaction = async (amount: number, txnId: string) => {
    setPayingId(txnId);
    await initiatePayment(amount, txnId);
    setPayingId(null);
  };

  const handleAddMoney = async () => {
    const amt = parseFloat(addMoneyAmount);
    if (!amt || amt < 1) {
      setPaymentMsg({ type: "error", text: "Enter a valid amount (minimum ₹1)." });
      return;
    }
    setAddMoneyLoading(true);
    await initiatePayment(amt, null);
    setShowAddMoney(false);
    setAddMoneyAmount("");
    setAddMoneyLoading(false);
  };

  // ─── UI Helpers ────────────────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      Success:  { color: "bg-green-100 text-green-700 border-green-300",  icon: CheckCircle2 },
      Failed:   { color: "bg-red-100 text-red-700 border-red-300",        icon: XCircle      },
      Pending:  { color: "bg-orange-100 text-orange-700 border-orange-300", icon: Clock      },
      Refunded: { color: "bg-blue-100 text-blue-700 border-blue-300",     icon: TrendingUp   },
    };
    const variant = variants[status] || variants.Success;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const msgColors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };
  const msgIcons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />,
    error:   <AlertCircle  className="w-5 h-5 text-red-600 shrink-0"   />,
    info:    <AlertCircle  className="w-5 h-5 text-blue-600 shrink-0"  />,
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading && paymentHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse">Loading billing and payments…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing &amp; Payments</h1>
          <p className="text-slate-600">Track your payment history and upcoming bills</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* ── Inline Payment Status Toast ── */}
      {paymentMsg && (
        <div className={`flex items-center justify-between gap-3 p-4 rounded-lg border ${msgColors[paymentMsg.type]}`}>
          <div className="flex items-center gap-2">
            {msgIcons[paymentMsg.type]}
            <p className="font-medium text-sm">{paymentMsg.text}</p>
          </div>
          <button
            onClick={() => setPaymentMsg(null)}
            className="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── General Error Banner ── */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => fetchBillingData()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Wallet Card ── */}
      <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

        <CardContent className="relative z-10 pt-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-blue-200" />
                <p className="text-blue-200 text-sm font-medium">Spendio Wallet Balance</p>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                ₹{walletBalance.toLocaleString("en-IN")}
              </p>
              <p className="text-blue-200 text-xs mt-1">Available for subscriptions &amp; payments</p>
            </div>

            {/* Add Money section */}
            <div className="flex flex-col items-end gap-2">
              {showAddMoney ? (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg p-2">
                  <span className="text-white font-semibold text-sm pl-1">₹</span>
                  <input
                    id="add-money-input"
                    type="number"
                    min="1"
                    placeholder="Amount"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddMoney()}
                    className="w-28 bg-transparent border-b border-white/50 text-white placeholder-blue-200 outline-none text-sm py-0.5"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    disabled={addMoneyLoading}
                    onClick={handleAddMoney}
                    className="bg-white text-blue-700 hover:bg-blue-50 h-7 px-3 text-xs font-semibold"
                  >
                    {addMoneyLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Pay"}
                  </Button>
                  <button
                    onClick={() => { setShowAddMoney(false); setAddMoneyAmount(""); }}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  id="add-money-btn"
                  onClick={() => setShowAddMoney(true)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Money
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: `Total Spent (${new Date().getFullYear()})`,
            value: `₹${stats?.total_spent_year.toLocaleString() ?? 0}`,
            icon: DollarSign,
            bg: "bg-blue-100", fg: "text-blue-600",
          },
          {
            label: "Successful",
            value: stats?.successful_payments ?? 0,
            icon: CheckCircle2,
            bg: "bg-green-100", fg: "text-green-600",
          },
          {
            label: "Failed",
            value: stats?.failed_payments ?? 0,
            icon: XCircle,
            bg: "bg-red-100", fg: "text-red-600",
          },
          {
            label: "Pending Bills",
            value: stats?.pending_payments ?? 0,
            icon: Clock,
            bg: "bg-orange-100", fg: "text-orange-600",
          },
        ].map(({ label, value, icon: Icon, bg, fg }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${bg}`}>
                  <Icon className={`w-6 h-6 ${fg}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Upcoming Bills ── */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Upcoming Bills
              </CardTitle>
              <CardDescription>Payments due in the next 30 days</CardDescription>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
              {upcomingBills.length} Upcoming
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingBills.length > 0 ? upcomingBills.map((bill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{bill.subscription}</p>
                    <p className="text-xs text-slate-600">Due: {bill.due_date}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">₹{bill.amount}</p>
                    {bill.autopay && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs mt-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Auto-pay
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-6 text-slate-500">No upcoming bills in the next 30 days.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Payment History ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Complete transaction history</CardDescription>
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Transaction ID</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Subscription</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Method</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No transactions found for this period.
                    </td>
                  </tr>
                ) : paymentHistory.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm text-blue-600">{payment.transaction_id}</TableCell>
                    <TableCell className="text-slate-700">{payment.date}</TableCell>
                    <TableCell className="font-medium text-slate-900">{payment.subscription_name}</TableCell>
                    <TableCell className="font-semibold text-slate-900">₹{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.status === "Failed" ? (
                        <Button
                          id={`pay-btn-${payment.id}`}
                          variant="outline"
                          size="sm"
                          disabled={payingId === payment.id}
                          onClick={() => handlePayTransaction(payment.amount, payment.id)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          {payingId === payment.id
                            ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing…</>
                            : "Pay Now"}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Failed Payment Alert ── */}
      {paymentHistory.some((p) => p.status === "Failed") && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Payment Attention Required</h4>
                <p className="text-sm text-red-700 mb-3">
                  One or more payments have failed. Click <strong>Pay Now</strong> in the table above to retry
                  via Razorpay — your wallet balance will be updated on success.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}