import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
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
                About the Project
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

      {/* Main Content */}
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
