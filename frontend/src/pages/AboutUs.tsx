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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About ASU Navigator</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          
          {/*Picture and description of mentors and mentees*/}
          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-6">Developers</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor</h3>
                <div className="flex justify-around items-center gap-6 flex-wrap">
                  <img 
                    src="/" 
                    alt="Ben Juntilla" 
                    className="w-full h-48 object-contain rounded-lg shadow-md bg-gray-100" 
                  />
                  <p className="text-large font-medium text-gray-700 text-center max-w-100">
                      Ben Juntilla<br />
                      <span className="text-medium text-gray-500">Third Year Computer Science (Software Engineering) student at 
                        Arizona State University, Tempe Campus
                      </span>
                    </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentees</h3>
                <div className="flex justify-around items-center gap-6 flex-wrap">
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src="/images/Ethan_Nguyen_PFP.jpg"
                      alt="Ethan Nguyen"
                      className="w-100 h-150 object-contain rounded-lg shadow-md bg-gray-100 flex-shrink-0"
                    />
                    <p className="text-large font-medium text-gray-700 text-center max-w-100">
                      Ethan Nguyen<br />
                      <span className="text-medium text-gray-500">First Year Computer Science (Software Engineering) student at 
                        Arizona State University, Barrett Honors College, Tempe Campus
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src="/images/Xander_Morris_PFP.jpg"
                      alt="Xander Morris"
                      className="w-150 h-150 object-contain rounded-xl shadow-lg bg-gray-100 flex-shrink-0"
                    />
                    <p className="text-large font-medium text-gray-700 text-center max-w-100">
                      Xander Morris<br />
                      <span className="text-medium text-gray-500">Third Year Computer Science student at Arizona State University Online</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>


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
