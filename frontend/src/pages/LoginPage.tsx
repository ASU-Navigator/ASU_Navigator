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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Maroon header */}
        <div className="px-8 pt-8 pb-6" style={{ backgroundColor: "var(--color-asu-maroon)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-base">A</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ASU Navigator</span>
          </div>
          <p className="text-white/70 text-sm mt-1 ml-12">Sign in to access your campus map</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
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
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ "--tw-ring-color": "var(--color-asu-maroon)" } as React.CSSProperties}
                onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px var(--color-asu-maroon)"}
                onBlur={(e) => e.target.style.boxShadow = ""}
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
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none transition-all"
                onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px var(--color-asu-maroon)"}
                onBlur={(e) => e.target.style.boxShadow = ""}
              />
            </div>

            {error && (
              <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-white font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-asu-maroon)" }}
              onMouseEnter={(e) => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = "#7a1836")}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "var(--color-asu-maroon)")}
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: "var(--color-asu-maroon)" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
