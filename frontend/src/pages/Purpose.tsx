import { Link } from "react-router-dom";

export default function Purpose() {
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

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Purpose</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Why ASU Navigator?</h2>
            <p className="text-gray-700 leading-relaxed">
              Navigating a large university campus can be overwhelming, especially for new students. ASU Navigator was created 
              to address this challenge by providing students with an easy-to-use platform that helps them find their way around 
              campus quickly and confidently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Our Goals</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-asu-maroon font-bold mt-1">•</span>
                <span>Reduce campus navigation anxiety for students</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-asu-maroon font-bold mt-1">•</span>
                <span>Provide accurate, real-time campus information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-asu-maroon font-bold mt-1">•</span>
                <span>Improve the overall student experience at ASU</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-asu-maroon font-bold mt-1">•</span>
                <span>Create a user-friendly tool that's accessible to all</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Impact</h2>
            <p className="text-gray-700 leading-relaxed">
              By combining interactive maps, class schedules, and campus information, ASU Navigator empowers students to 
              navigate their academic journey with confidence and efficiency. We believe that removing navigation barriers 
              allows students to focus on what matters most – their education and personal growth.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
