import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { api } from "../../lib/api";
import { Loader2, Phone, Key, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [attempts, setAttempts] = useState(3);
  const navigate = useNavigate();

  const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ msg, type });
    if (type === 'success' && step === 2) return; 
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    try {
      await api.post("/api/auth/forgot-password-sms", { phone });
      showFeedback("Verification code sent to your phone!");
      setStep(2);
      setAttempts(3); // Reset attempts when new OTP is sent
    } catch (err: any) {
      showFeedback(err.message || "Failed to send code. Ensure the phone number is registered.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) return;

    setIsLoading(true);
    try {
      await api.post("/api/auth/reset-password-sms", { phone, code, new_password: newPassword });
      showFeedback("Your password has been reset successfully!");
    } catch (err: any) {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      
      if (newAttempts <= 0) {
        showFeedback("Too many failed attempts. Redirecting to login...", "error");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showFeedback(`Invalid code. You have ${newAttempts} ${newAttempts === 1 ? 'attempt' : 'attempts'} left.`, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (feedback?.type === 'success' && step === 2 && !isLoading && feedback.msg.includes("successfully")) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] p-4 relative overflow-hidden font-inter">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px]" />
        </div>
        <Card className="w-full max-w-[440px] border-slate-200 shadow-xl bg-white relative z-10">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
            <p className="text-slate-500 mb-8 font-medium">You can now sign in with your new password.</p>
            <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-white font-semibold rounded-lg">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa] p-4 relative overflow-hidden font-inter">
      {/* Background Decorative Elements matching Login */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/60 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-100/60 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-6 shadow-xl shadow-blue-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Password Recovery</h1>
          <p className="text-slate-500 font-medium">Reset your account using SMS verification</p>
        </div>

        <Card className="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden rounded-2xl">
          <div className="h-1.5 w-full bg-slate-100">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
          
          <CardHeader className="pb-6 pt-8">
            <CardTitle className="text-xl text-slate-900 font-bold">
              {step === 1 ? 'Verify Phone' : 'New Password'}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {step === 1 
                ? 'Enter your registered phone number' 
                : 'Enter the 6-digit code and choose a new password'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            {feedback && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1 ${
                feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {feedback.msg}
              </div>
            )}

            <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="space-y-6">
              {step === 1 ? (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 text-sm font-semibold ml-1">Phone Number</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="h-11 border-slate-200 bg-white focus:bg-white transition-all duration-200 rounded-lg pl-10 placeholder:text-slate-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-slate-700 text-sm font-semibold ml-1">Verification Code</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
                        <Key className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input
                        id="code"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="h-11 border-slate-200 bg-white focus:bg-white transition-all duration-200 rounded-lg pl-10 placeholder:text-slate-400 tracking-[0.3em] font-mono text-lg"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </div>
                    {attempts < 3 && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 ml-1">
                        {attempts} attempts remaining
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-700 text-sm font-semibold ml-1">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 border-slate-200 bg-white focus:bg-white transition-all duration-200 rounded-lg placeholder:text-slate-400"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-200 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  step === 1 ? 'Send Verification Code' : 'Reset Password'
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center flex flex-col items-center gap-4">
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)} 
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Use a different number
                </button>
              )}
              <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 text-center text-slate-400 text-xs font-medium">
          <p>© 2026 Spendio. Professional Subscription Management.</p>
        </div>
      </div>
    </div>
  );
}
