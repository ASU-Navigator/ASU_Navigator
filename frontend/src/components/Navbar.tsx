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

  return (
    <nav
      className="flex items-center justify-between px-6 py-4 border-b border-white/10"
      style={{ backgroundColor: "var(--color-asu-maroon)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">ASU Navigator</span>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <span className="text-white/70 text-sm hidden sm:block">
            {session.user.name}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className="px-4 py-1.5 rounded-lg text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
