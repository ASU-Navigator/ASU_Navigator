import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import PublicNav from "../components/PublicNav";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith("@asu.edu")) {
      setError("Please use your ASU email address (@asu.edu)");
      return;
    }

    setIsLoading(true);
    const result = await signUp.email({ name, email, password });
    if (result.error) {
      setError(result.error.message ?? "Sign up failed. Please try again.");
      setIsLoading(false);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          style={{ opacity: 0.3, pointerEvents: "none", border: "none" }}
          src="https://www.youtube.com/embed/bV0_Qw3st8g?autoplay=1&mute=1&loop=1&playlist=bV0_Qw3st8g&controls=0&modestbranding=1"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>

      <div className="absolute inset-0 bg-black/40"></div>

      <PublicNav />

      <div className="flex-1 flex items-center justify-center p-4 relative z-20">
        <div
          className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <div className="bg-asu-maroon px-8 py-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-white font-black text-lg leading-none">A</span>
              </div>
              <div>
                <p className="text-white font-bold text-xl leading-tight">ASU Navigator</p>
                <p className="text-white/60 text-xs mt-0.5">Create your account to get started</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ASU Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="yourname@asu.edu"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Must be an @asu.edu address</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-asu-maroon font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
