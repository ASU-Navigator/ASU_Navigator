import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <PublicNav />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-white mb-1">About ASU Navigator</h1>
        <p className="text-gray-500 text-sm mb-10">Campus route planning built for ASU students</p>

        <div className="space-y-4">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              ASU Navigator is a full-stack web app that helps Arizona State University students turn a class schedule into a campus navigation tool.
              Upload a MyASU <span className="text-white font-medium">.ics</span> calendar export, browse classes by day, and preview
              walking routes between in-person classes on Google Maps.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">What We Offer</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0" />
                Interactive campus maps with real walking routes
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0" />
                Class location information and building directory
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0" />
                Tight-connection warnings between back-to-back classes
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0" />
                Personalized schedule integration via .ics upload
              </li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">Get Started</h2>
            <p className="text-gray-300 mb-6">
              Sign in with your ASU account to upload your schedule and start navigating campus with confidence.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
