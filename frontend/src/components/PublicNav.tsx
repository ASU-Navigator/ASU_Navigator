import { Link } from "react-router-dom";

export default function PublicNav() {
  return (
    <nav
      className="relative z-10 bg-asu-maroon"
      style={{ boxShadow: "0 1px 0 rgba(255,198,39,0.25), 0 2px 12px rgba(0,0,0,0.3)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/login" className="text-xl font-bold text-white hover:text-asu-gold transition-colors tracking-tight">
            ASU Navigator
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-white/70 font-medium hover:text-white transition-colors text-sm">
              About
            </Link>
            <Link to="/purpose" className="text-white/70 font-medium hover:text-white transition-colors text-sm">
              Purpose
            </Link>
            <Link to="/acknowledgements" className="text-white/70 font-medium hover:text-white transition-colors text-sm">
              Acknowledgements
            </Link>
            <Link to="/contact" className="text-white/70 font-medium hover:text-white transition-colors text-sm">
              Contact
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium text-white/75 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold bg-asu-gold hover:opacity-90 text-gray-900 px-4 py-1.5 rounded-lg transition-opacity"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
