import PublicNav from "../components/PublicNav";

export default function Purpose() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <PublicNav />

      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-bold text-white mb-1">Our Purpose</h1>
        <p className="text-gray-500 text-sm mb-10">Why we built ASU Navigator</p>

        <div className="space-y-4">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">Why ASU Navigator?</h2>
            <p className="text-gray-300 leading-relaxed">
              Navigating a large university campus can be overwhelming, especially for new students. ASU Navigator was created
              to address this challenge by providing students with an easy-to-use platform that helps them find their way around
              campus quickly and confidently.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-4">Our Goals</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0 mt-2" />
                Reduce campus navigation anxiety for students
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0 mt-2" />
                Provide accurate, real-time campus information
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0 mt-2" />
                Improve the overall student experience at ASU
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-asu-gold shrink-0 mt-2" />
                Create a user-friendly tool that's accessible to all
              </li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-asu-gold mb-3">Impact</h2>
            <p className="text-gray-300 leading-relaxed">
              By combining interactive maps, class schedules, and campus information, ASU Navigator empowers students to
              navigate their academic journey with confidence and efficiency. Removing navigation barriers
              allows students to focus on what matters most — their education and personal growth.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
