import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Download,
  Filter,
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
  FastForward
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
  id: string;
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

export default function Billing() {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);

  const fetchBillingData = async (period = filterPeriod) => {
    try {
      setLoading(true);
      const periodQuery = period !== "all" ? `?period=${period}` : "";
      const [historyData, upcomingData, statsData] = await Promise.all([
        api.get<{ transactions: Transaction[] }>(`/api/billing/transactions${periodQuery}`),
        api.get<{ upcoming_bills: UpcomingBill[] }>("/api/billing/upcoming"),
        api.get<BillingStats>("/api/billing/stats"),
      ]);
      setPaymentHistory(historyData.transactions);
      setUpcomingBills(upcomingData.upcoming_bills);
      setStats(statsData);
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

  const handleSimulateAutopay = async () => {
    if (simulating) return;
    try {
      setSimulating(true);
      const result = await api.post<any>('/api/billing/simulate-autopay', {});
      alert(`✅ ${result.message}\n\nNew Balance: ₹${result.new_balance}`);
      fetchBillingData();
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (amount: number, transactionId: string) => {
    try {
      // 1. Create Order securely from backend
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        alert("Failed to load payment gateway. Please try again.");
        return;
      }

      const orderData = await api.post<any>('/api/billing/create-order', {
        amount: amount,
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Spendio",
        description: "Subscription Payment",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await api.post('/api/billing/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction_id: transactionId
            });
            alert("Payment successful! Your balance has been updated.");
            fetchBillingData();
          } catch (err: any) {
            alert(err.message || "Payment verification failed. Please contact support if amount was deducted.");
          }
        },
        prefill: {
          name: user ? `${user.first_name} ${user.last_name}` : "Spendio Member",
          email: user?.email || "member@spendio.in",
          contact: user?.phone || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function() {
            console.log("Checkout modal closed by user");
          },
          escape: true,
          backdropclose: false
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Razorpay Payment Failed:", response.error);
        alert(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      alert(err.message || "Failed to initiate payment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      Success: { color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
      Failed: { color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
      Pending: { color: "bg-orange-100 text-orange-700 border-orange-300", icon: Clock },
      Refunded: { color: "bg-blue-100 text-blue-700 border-blue-300", icon: TrendingUp },
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

  if (loading && paymentHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 animate-pulse">Loading billing and payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Payments</h1>
          <p className="text-slate-600">Track your payment history and upcoming bills</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
            onClick={handleSimulateAutopay}
            disabled={simulating}
          >
            {simulating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FastForward className="w-4 h-4 mr-2" />
            )}
            {simulating ? 'Simulating...' : 'Simulate Auto-pay'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => fetchBillingData()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Total Spent ({new Date().getFullYear()})</p>
                <p className="text-2xl font-bold text-slate-900">₹{stats?.total_spent_year.toLocaleString() ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Successful</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.successful_payments ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.failed_payments ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.pending_payments ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills */}
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
                <div className="text-right">
                  <p className="font-semibold text-slate-900">₹{bill.amount}</p>
                  {bill.autopay && (
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs mt-1">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Auto-pay
                    </Badge>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-center py-4 text-slate-500">No upcoming bills</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
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
                {paymentHistory.map((payment) => (
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
                        <Button variant="outline" size="sm" onClick={() => handlePayment(payment.amount, payment.id)}>
                          Pay Now
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

      {/* Failed Payment Alert */}
      {paymentHistory.some(p => p.status === "Failed") && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Payment Failed</h4>
                <p className="text-sm text-red-700 mb-3">
                  One or more of your payments have failed. Please review your payment history and retry the transactions.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    View Failed Payments
                  </Button>
                  <Button size="sm" variant="outline">
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}