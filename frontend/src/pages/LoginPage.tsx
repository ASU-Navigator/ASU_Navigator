import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message ?? "Sign in failed. Please try again.");
      setIsLoading(false);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          style={{ opacity: 0.3, pointerEvents: "none", border: "none" }}
          src="https://www.youtube.com/embed/bV0_Qw3st8g?autoplay=1&mute=1&loop=1&playlist=bV0_Qw3st8g&controls=0&modestbranding=1"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold text-asu-maroon hover:text-asu-maroon-dark transition-colors">
              ASU Navigator
            </Link>
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="text-gray-700 font-medium hover:text-asu-maroon transition-colors"
              >
                Home Screen
              </Link>
              <Link
                to="/about"
                className="text-gray-700 font-medium hover:text-asu-maroon transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/purpose"
                className="text-gray-700 font-medium hover:text-asu-maroon transition-colors"
              >
                Purpose
              </Link>
              <Link
                to="/acknowledgements"
                className="text-gray-700 font-medium hover:text-asu-maroon transition-colors"
              >
                Acknowledgements
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 font-medium hover:text-asu-maroon transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="text-2xl font-bold text-asu-maroon">ASU</div>
        </div>
      </nav>

      {/* Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-20">
      <div
        className="w-full max-w-sm bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" }}
      >

        {/* Maroon header */}
        <div className="bg-asu-maroon px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-lg leading-none">A</span>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-tight">ASU Navigator</p>
              <p className="text-white/60 text-xs mt-0.5">Sign in to access your campus map</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

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
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
              />
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
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-asu-maroon font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
