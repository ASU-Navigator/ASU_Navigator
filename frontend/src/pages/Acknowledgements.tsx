import { Link } from "react-router-dom";

export default function Acknowledgements() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Acknowledgements</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Recognition</h2>
            <p className="text-gray-700 leading-relaxed">
              ASU Navigator would not have been possible without the support and guidance of the SoDA (Software Developer's Association) 
              Mentorship Program at Arizona State University. We are grateful for the opportunity to develop this application 
              as part of the program and to have worked with experienced mentors who provided valuable insights and feedback 
              throughout the development process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">About SoDA</h2>
            <p className="text-gray-700 leading-relaxed">
              The SoDA Mentorship Program is a collaborative initiative at ASU designed to foster innovation and entrepreneurship. 
              It brings together talented students and experienced professionals to develop cutting-edge applications and solutions 
              that address real-world challenges. The program emphasizes hands-on learning, mentorship, and creating products that 
              have a meaningful impact on the ASU community and beyond.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-4">Our Team</h2>
            <p className="text-gray-700 leading-relaxed">
              ASU Navigator was developed by a dedicated team of students passionate about improving the campus navigation experience. 
              Special thanks to our mentors for their guidance, support, and expertise in helping us bring this vision to life. 
              We believe in the power of collaboration and are proud to showcase what we've accomplished through the SoDA program.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
