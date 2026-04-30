import { useNavigate } from "react-router-dom";
import { useSession } from "../utils/auth/client";
import { useAuth } from "../contexts/auth";

export default function Navbar() {
  const { data: session } = useSession();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A";

  return (
    <nav
      className="flex items-center justify-between px-6 py-3 bg-asu-maroon"
      style={{ boxShadow: "0 1px 0 rgba(255,198,39,0.25), 0 2px 12px rgba(0,0,0,0.4)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <span className="text-lg" style={{ color: "var(--color-asu-gold)" }}>🗺</span>
        </div>
        <div>
          <span className="text-white font-bold text-base tracking-tight leading-tight block">ASU Navigator</span>
          <span className="text-white/45 text-[10px] leading-none tracking-wide uppercase">Campus Route Planner</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            <span className="text-white/60 text-sm hidden sm:block truncate max-w-[140px]">
              {session.user.name}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 hidden sm:flex"
              style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              <span className="text-white text-xs font-bold leading-none">{initials}</span>
            </div>
          </>
        )}
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-white/75 border border-white/20 hover:text-white hover:bg-white/10 hover:border-white/40"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
