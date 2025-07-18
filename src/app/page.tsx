import Link from 'next/link';
import Image from 'next/image';
import { Michroma } from 'next/font/google';

const michroma = Michroma({ subsets: ['latin'], weight: '400' });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-purple-100 to-indigo-50 text-zinc-900">
      {/* Header */}
      <header className="w-full px-6 py-6 flex justify-between items-center">
        <div
          className={`${michroma.className} text-3xl sm:text-4xl font-bold bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-300 bg-clip-text text-transparent`}
        >
          event-scheduler
        </div>
        <Link
          href="/login"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <section className="text-center px-4 py-16 sm:py-24">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-zinc-800">
          🧠 Find Common Times Effortlessly
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto">
          Say goodbye to back-and-forth scheduling. Let our smart algorithm find the best time for
          your team.
        </p>
        <div className="mt-10">
          <Link
            href="/login"
            className="inline-block bg-indigo-400 text-white px-8 py-4 rounded-lg text-lg hover:bg-indigo-700 transition"
          >
            Get Started Now →
          </Link>
        </div>
      </section>

      {/* Illustrations Section */}
      <section className="py-10 bg-white px-4 flex flex-col md:flex-row justify-center items-center gap-10">
        <div className="max-w-md transform rotate-[-4deg]">
          <Image
            src="/illustration-calendar.png"
            alt="Planning Illustration"
            width={300}
            height={300}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="max-w-md transform rotate-[4deg]">
          <Image
            src="/real-time collaboration.png"
            alt="Collaboration Illustration"
            width={300}
            height={300}
            className="rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10 text-zinc-800">Cool Features You’ll Love</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-indigo-50 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                Smart Conflict Resolution
              </h3>
              <p className="text-zinc-600">
                Our AI algorithm automatically detects and resolves conflicting time slots between
                all members.
              </p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2 text-emerald-700">
                Real-time Collaboration
              </h3>
              <p className="text-zinc-600">
                Team members can update availability anytime — see results instantly.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Beautiful & Simple UI</h3>
              <p className="text-zinc-600">
                Sleek and minimal design with a focus on usability and clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-zinc-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-zinc-800">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-5xl mb-3">👥</div>
              <h4 className="text-lg font-semibold mb-2">1. Create Group</h4>
              <p className="text-sm text-zinc-600">
                Start by creating a team group using your Google account.
              </p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-3">📆</div>
              <h4 className="text-lg font-semibold mb-2">2. Submit Availability</h4>
              <p className="text-sm text-zinc-600">
                Everyone adds their availability slots with just a few clicks.
              </p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-3">🧮</div>
              <h4 className="text-lg font-semibold mb-2">3. AI Conflict Solver</h4>
              <p className="text-sm text-zinc-600">
                We crunch the data and resolve conflicts in seconds.
              </p>
            </div>
            <div className="p-6">
              <div className="text-5xl mb-3">✅</div>
              <h4 className="text-lg font-semibold mb-2">4. Pick Best Time</h4>
              <p className="text-sm text-zinc-600">
                Review the top results and finalize a time that works for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-400 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Schedule Smarter?</h2>
        <p className="mb-6">Join hundreds of teams who’ve already streamlined their meetings.</p>
        <Link
          href="/login"
          className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
        >
          Sign Up with Google
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm bg-indigo-50">
        © 2025 Event Scheduler. All rights reserved.
      </footer>
    </main>
  );
}
