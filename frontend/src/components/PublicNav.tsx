import { Link } from "react-router-dom";

export default function PublicNav() {
  return (
    <nav className="bg-white shadow-md relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/login" className="text-2xl font-bold text-asu-maroon hover:text-asu-maroon-dark transition-colors">
            ASU Navigator
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-gray-700 font-medium hover:text-asu-maroon transition-colors">
              About the Project
            </Link>
            <Link to="/purpose" className="text-gray-700 font-medium hover:text-asu-maroon transition-colors">
              Purpose
            </Link>
            <Link to="/acknowledgements" className="text-gray-700 font-medium hover:text-asu-maroon transition-colors">
              Acknowledgements
            </Link>
            <Link to="/contact" className="text-gray-700 font-medium hover:text-asu-maroon transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
        <div className="text-2xl font-bold text-asu-maroon">ASU</div>
      </div>
    </nav>
  );
}
