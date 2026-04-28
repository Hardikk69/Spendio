import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardContent } from "../components/ui/Card";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Checkbox } from "../components/ui/Checkbox";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userType: "user",
    password: "",
    confirmPassword: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.userType as any
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 2, label: "Medium", color: "bg-orange-500" };
    return { strength: 3, label: "Strong", color: "bg-green-500" };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-100 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-6 shadow-xl shadow-blue-200"
          >
            <span className="text-white text-xl font-bold">S</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Create account</h1>
          <p className="text-slate-500 font-medium">Join Spendio and manage subscriptions professionally</p>
        </div>

        <Card className="border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-slate-700 text-sm font-semibold">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                    className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-slate-700 text-sm font-semibold">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                    className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-700 text-sm font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                  className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="userType" className="text-slate-700 text-sm font-semibold">Account Type</Label>
                <Select value={formData.userType} onValueChange={(value) => updateField("userType", value)}>
                  <SelectTrigger id="userType" className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Individual User</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 text-sm font-semibold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                      className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-700 text-sm font-semibold">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      required
                      className="h-10 border-slate-200 bg-white/50 focus:bg-white transition-all duration-200 rounded-lg pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.password && (
                <div className="space-y-1 mt-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full ${strength.strength >= 1 ? strength.color : 'bg-slate-100'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${strength.strength >= 2 ? strength.color : 'bg-slate-100'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${strength.strength >= 3 ? strength.color : 'bg-slate-100'}`}></div>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="mt-1 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor="terms"
                  className="text-xs font-medium cursor-pointer leading-normal text-slate-500"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Privacy Policy</Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all duration-200 rounded-lg group mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-400 text-xs font-medium">
          <p>© 2026 Spendio. Professional Subscription Management.</p>
        </div>
      </motion.div>
    </div>
  );
}


