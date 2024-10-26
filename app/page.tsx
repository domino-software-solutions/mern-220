import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold mb-6 tracking-tight">Seminar Crowds RSVP</h1>
        <p className="text-2xl mb-12 text-gray-600">
          Streamline your insurance event management with our easy-to-use RSVP system.
        </p>
        <div className="space-x-6">
          <Link href="/login" className="bg-black text-white py-3 px-8 text-lg font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300">
            Login
          </Link>
          <Link href="/signup" className="bg-white text-black py-3 px-8 text-lg font-semibold uppercase tracking-wider border-2 border-black hover:bg-gray-100 transition-colors duration-300">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
