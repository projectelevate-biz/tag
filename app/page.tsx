import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Rebound & Relay</div>
            <div className="space-x-4">
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Rebound & Relay
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            The premier marketplace connecting higher education institutions with expert consultants
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              href="/sign-up"
              className="px-10 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              For Institutions (Relay)
            </Link>
            <Link
              href="/sign-up"
              className="px-10 py-4 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700 transition shadow-lg"
            >
              For Consultants (Rebound)
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="bg-blue-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-2xl">
                🏫
              </div>
              <h3 className="text-2xl font-semibold mb-6">For Institutions</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Browse verified higher education consultants</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Filter by expertise, location, and availability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Manage engagements and track milestones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Secure payments and invoicing</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 p-8 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg mb-4 flex items-center justify-center text-white text-2xl">
                👨‍💼
              </div>
              <h3 className="text-2xl font-semibold mb-6">For Consultants</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Create your professional profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Showcase your expertise and experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Connect with leading institutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Get paid securely through our platform</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8">Join the leading marketplace for higher education consulting</p>
            <Link
              href="/sign-up"
              className="inline-block px-10 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Rebound & Relay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
