import { useState } from "react";
import PublicNav from "../components/PublicNav";

const TEAM = [
  {
    name: "Ben Juntilla",
    role: "Mentor",
    img: "/images/Ben_Juntilla_PFP.png",
    email: "cjuntill@asu.edu",
    bio: "3rd Year CS (Software Engineering), Barrett Honors College, ASU Tempe",
  },
  {
    name: "Ethan Nguyen",
    role: "Mentee",
    img: "/images/Ethan_Nguyen_PFP.jpg",
    email: "etnguy11@asu.edu",
    bio: "1st Year CS (Software Engineering), Barrett Honors College, ASU Tempe",
  },
  {
    name: "Xander Morris",
    role: "Mentee",
    img: "/images/Xander_Morris_PFP.jpg",
    email: "xarnspig@asu.edu",
    bio: "3rd Year Computer Science, ASU Online",
  },
];

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <PublicNav />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-white mb-1">Contact Us</h1>
        <p className="text-gray-500 text-sm mb-10">Meet the team behind ASU Navigator</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {TEAM.map((person) => (
            <div key={person.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
              <img
                src={person.img}
                alt={person.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white/10"
              />
              <p className="text-white font-semibold">{person.name}</p>
              <span className="text-xs font-medium text-asu-gold mt-1 mb-2">{person.role}</span>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{person.bio}</p>
              <a
                href={`mailto:${person.email}`}
                className="text-xs text-asu-maroon hover:underline"
                style={{ color: "var(--color-asu-gold)", opacity: 0.7 }}
              >
                {person.email}
              </a>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <h2 className="text-lg font-semibold text-asu-gold">Get in Touch</h2>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Email</h3>
              <div className="space-y-1">
                {TEAM.map((p) => (
                  <a key={p.email} href={`mailto:${p.email}`} className="block text-sm text-gray-400 hover:text-white transition-colors">
                    {p.name}: <span className="text-asu-maroon" style={{ color: "var(--color-asu-gold)", opacity: 0.8 }}>{p.email}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Phone</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Ben Juntilla: —</p>
                <p>Xander Morris: —</p>
                <a href="tel:+16237594970" className="block hover:text-white transition-colors">
                  Ethan Nguyen: (+1) 623-759-4970
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Address</h3>
              <p className="text-sm text-gray-400">
                Arizona State University<br />
                Tempe, AZ 85281
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Hours</h3>
              <p className="text-sm text-gray-400">
                Monday – Friday: 9:00 AM – 5:00 PM<br />
                Saturday – Sunday: Closed
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-6">Send a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Message Subject"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your message..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors resize-none"
                />
              </div>

              {submitted && (
                <div className="text-green-300 text-sm bg-green-900/30 border border-green-500/30 rounded-lg px-4 py-3">
                  Message sent successfully. We'll be in touch!
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
