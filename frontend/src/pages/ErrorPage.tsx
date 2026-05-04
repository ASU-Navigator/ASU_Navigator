import type { FC } from "react";
import { Link } from "react-router-dom";

const ErrorPage: FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}
    >
      <p className="text-8xl font-black text-white/10 select-none mb-2">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-gray-400 text-sm mb-8">This route doesn't exist or something went wrong.</p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-lg bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold text-sm transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ErrorPage;
