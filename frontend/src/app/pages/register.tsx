import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:flex flex-col justify-center text-white space-y-8 px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">S</span>
              </div>
              <h1 className="text-5xl font-bold">Spendio</h1>
            </div>
            <p className="text-2xl font-light text-purple-100">
              Start your journey to smarter subscription management
            </p>
          </div>

          <div className="space-y-4 mt-12 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-6">Why join Spendio?</h3>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">100% Free to Start</h4>
                <p className="text-purple-100 text-sm">No credit card required. Get started in seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Smart Notifications</h4>
                <p className="text-purple-100 text-sm">Never miss a renewal with intelligent alerts.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Bill Splitting</h4>
                <p className="text-purple-100 text-sm">Share subscriptions and save money together.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Detailed Analytics</h4>
                <p className="text-purple-100 text-sm">Visualize spending patterns and trends.</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <p className="text-purple-100 text-sm">
              Join <span className="font-semibold text-white">10,000+</span> users who are already saving time and money
            </p>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="lg:hidden mx-auto w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-600">Join Spendio and start managing smarter</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium text-sm">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="firstName"
                        placeholder="Rajesh"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        required
                        className="h-11 pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium text-sm">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="lastName"
                        placeholder="Kumar"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        required
                        className="h-11 pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="rajesh.kumar@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      className="h-11 pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-slate-700 font-medium text-sm">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      required
                      className="h-11 pl-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="userType" className="text-slate-700 font-medium text-sm">Account Type</Label>
                  <Select value={formData.userType} onValueChange={(value) => updateField("userType", value)}>
                    <SelectTrigger id="userType" className="h-11 border-slate-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Individual User</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="enterprise">
                        <div className="flex items-center gap-2">
                          <span>🏢</span>
                          <span>Enterprise</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                      className="h-11 pl-10 pr-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1 mt-2">
                      <div className="flex gap-1">
                        <div className={`h-1.5 flex-1 rounded-full ${strength.strength >= 1 ? strength.color : 'bg-slate-200'}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full ${strength.strength >= 2 ? strength.color : 'bg-slate-200'}`}></div>
                        <div className={`h-1.5 flex-1 rounded-full ${strength.strength >= 3 ? strength.color : 'bg-slate-200'}`}></div>
                      </div>
                      <p className="text-xs text-slate-600">Password strength: <span className={`font-semibold ${
                        strength.strength === 1 ? 'text-red-600' : 
                        strength.strength === 2 ? 'text-orange-600' : 
                        'text-green-600'
                      }`}>{strength.label}</span></p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      required
                      className="h-11 pl-10 pr-10 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer leading-relaxed text-slate-600"
                  >
                    I agree to the{" "}
                    <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base shadow-lg shadow-purple-500/30 mt-4"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>

              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-slate-600 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
