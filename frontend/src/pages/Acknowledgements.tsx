import PublicNav from "../components/PublicNav";

export default function Acknowledgements() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <PublicNav />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-white mb-1">Acknowledgements</h1>
        <p className="text-gray-500 text-sm mb-10">Built under the SoDA Mentorship Program at ASU</p>

        <div className="space-y-4">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">Recognition</h2>
            <p className="text-gray-300 leading-relaxed">
              ASU Navigator would not have been possible without the support and guidance of the SoDA (Software Developer's Association)
              Mentorship Program at Arizona State University. We are grateful for the opportunity to develop this application
              as part of the program and to have worked with experienced mentors who provided valuable insights and feedback
              throughout the development process.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">About SoDA</h2>
            <p className="text-gray-300 leading-relaxed">
              The SoDA Mentorship Program is a collaborative initiative at ASU designed to foster innovation and entrepreneurship.
              It brings together talented students and experienced professionals to develop cutting-edge applications and solutions
              that address real-world challenges. The program emphasizes hands-on learning, mentorship, and creating products that
              have a meaningful impact on the ASU community and beyond.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">Our Team</h2>
            <p className="text-gray-300 leading-relaxed">
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
