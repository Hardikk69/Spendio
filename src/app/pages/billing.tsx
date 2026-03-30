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
  AlertCircle
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useState } from "react";

export default function Billing() {
  const [filterPeriod, setFilterPeriod] = useState("all");

  const paymentHistory = [
    { id: "TXN001", date: "Feb 16, 2026", subscription: "Spotify Family", amount: 1399, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN002", date: "Feb 15, 2026", subscription: "Netflix Premium", amount: 649, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN003", date: "Feb 12, 2026", subscription: "Microsoft 365", amount: 799, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN004", date: "Feb 10, 2026", subscription: "Disney+", amount: 649, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN005", date: "Feb 8, 2026", subscription: "Adobe Creative Cloud", amount: 4599, status: "Failed", method: "Manual", invoice: false },
    { id: "TXN006", date: "Jan 28, 2026", subscription: "Amazon Prime", amount: 1249, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN007", date: "Jan 22, 2026", subscription: "Dropbox Plus", amount: 999, status: "Success", method: "Manual", invoice: true },
    { id: "TXN008", date: "Jan 20, 2026", subscription: "Spotify Family", amount: 1399, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN009", date: "Jan 15, 2026", subscription: "Netflix Premium", amount: 649, status: "Success", method: "Auto-pay", invoice: true },
    { id: "TXN010", date: "Jan 12, 2026", subscription: "Microsoft 365", amount: 799, status: "Refunded", method: "Auto-pay", invoice: true },
  ];

  const stats = [
    { label: "Total Spent (2026)", value: "₹15,420", icon: DollarSign, color: "blue" },
    { label: "Successful Payments", value: "8", icon: CheckCircle2, color: "green" },
    { label: "Failed Payments", value: "1", icon: XCircle, color: "red" },
    { label: "Pending", value: "3", icon: Clock, color: "orange" },
  ];

  const upcomingBills = [
    { subscription: "Disney+", amount: 649, dueDate: "Feb 18, 2026", autopay: true, status: "upcoming" },
    { subscription: "Netflix Premium", amount: 649, dueDate: "Feb 20, 2026", autopay: true, status: "upcoming" },
    { subscription: "Spotify Family", amount: 1399, dueDate: "Feb 22, 2026", autopay: true, status: "upcoming" },
    { subscription: "Microsoft 365", amount: 799, dueDate: "Feb 25, 2026", autopay: true, status: "upcoming" },
    { subscription: "Amazon Prime", amount: 1249, dueDate: "Feb 28, 2026", autopay: true, status: "upcoming" },
  ];

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

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Payments</h1>
          <p className="text-slate-600">Track your payment history and upcoming bills</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === "green" ? "bg-green-100" :
                    stat.color === "blue" ? "bg-blue-100" :
                    stat.color === "red" ? "bg-red-100" :
                    "bg-orange-100"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === "green" ? "text-green-600" :
                      stat.color === "blue" ? "text-blue-600" :
                      stat.color === "red" ? "text-red-600" :
                      "text-orange-600"
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
            {upcomingBills.map((bill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{bill.subscription}</p>
                    <p className="text-xs text-slate-600">Due: {bill.dueDate}</p>
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
            ))}
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
                  <TableHead className="font-semibold">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm text-blue-600">{payment.id}</TableCell>
                    <TableCell className="text-slate-700">{payment.date}</TableCell>
                    <TableCell className="font-medium text-slate-900">{payment.subscription}</TableCell>
                    <TableCell className="font-semibold text-slate-900">₹{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {payment.method === "Auto-pay" ? (
                          <><CreditCard className="w-3 h-3 mr-1" />{payment.method}</>
                        ) : (
                          payment.method
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.invoice ? (
                        <Button variant="ghost" size="sm" className="h-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-sm">N/A</span>
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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Payment Failed</h4>
              <p className="text-sm text-red-700 mb-3">
                Your payment for <span className="font-medium">Adobe Creative Cloud</span> failed on Feb 8, 2026. 
                Please update your payment method or retry the payment.
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Retry Payment
                </Button>
                <Button size="sm" variant="outline">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}