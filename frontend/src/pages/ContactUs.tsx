import { useState } from "react";
import { Link } from "react-router-dom";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend service
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        
        {/*Picture and description of mentors and mentees*/}
          <section>
            <h2 className="text-2xl font-semibold text-asu-maroon mb-6">Developers</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor</h3>
                <div className="flex justify-around items-center gap-6 flex-wrap">
                  <img 
                    src="/images/Ben_Juntilla_PFP.png" 
                    alt="Ben Juntilla" 
                    className="w-150 h-150 object-contain rounded-lg shadow-md bg-gray-100" 
                  />
                  <p className="text-large font-medium text-gray-700 text-center max-w-100">
                      Ben Juntilla<br />
                      <span className="text-medium text-gray-500">Third Year Computer Science (Software Engineering) student at 
                        Arizona State University, Barrett Honors College, Tempe Campus
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-asu-maroon">Get in Touch</h2>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <div className="space-y-1 text-asu-maroon">
                <p>
                  <a href="mailto:cjuntill@asu.edu" className="hover:underline">
                    Ben Juntilla: cjuntill@asu.edu
                  </a>
                </p>
                <p>
                  <a href="mailto:xarnspig@asu.edu" className="hover:underline">
                    Xander Morris: xarnspig@asu.edu
                  </a>
                </p>
                <p>
                  <a href="mailto:etnguy11@asu.edu" className="hover:underline">
                    Ethan Nguyen: etnguy11@asu.edu
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <div className="space-y-1 text-asu-maroon">
                <p>Ben Juntilla:</p>
                <p>Xander Morris:</p>
                <p>
                  <a href="tel:+16237594970" className="hover:underline">
                    Ethan Nguyen: (+1) 623-759-4970
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-700">
                Arizona State University<br />
                Tempe, AZ 85281<br />
                United States
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
              <p className="text-gray-700">
                Monday - Friday: 9:00 AM - 5:00 PM<br />
                Saturday - Sunday: Closed
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-asu-maroon mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Message Subject"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your message..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asu-maroon focus:border-transparent transition-all resize-none"
                />
              </div>

              {submitted && (
                <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  Thank you! Your message has been sent successfully.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-asu-maroon hover:bg-asu-maroon-dark text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
