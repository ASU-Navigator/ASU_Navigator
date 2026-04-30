import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About ASU Navigator</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              ASU Navigator is a full-stack web app that helps Arizona State University students turn a class schedule into a campus navigation tool.
              Users can create an account with an `@asu.edu` email address, upload a MyASU `.ics` calendar export, browse classes by day, and preview
              walking routes between in-person classes on Google Maps.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Interactive campus maps</li>
              <li>Class location information</li>
              <li>Building directory and directions</li>
              <li>Personalized class schedule integration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Get Started</h2>
            <p className="text-gray-700 mb-4">
              Sign in to your ASU account to access all features of ASU Navigator and make navigating campus easier than ever.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-asu-maroon text-white font-semibold rounded-lg hover:bg-asu-maroon-dark transition-colors"
            >
              Sign In
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
