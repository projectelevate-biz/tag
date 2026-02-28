import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function InstitutionDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Get institution profile
  const { data: profile } = await supabase
    .from('institution_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get engagements
  const { data: engagements } = await supabase
    .from('engagements')
    .select(`
      *,
      consultant_profiles (
        id,
        bio,
        expertise,
        hourly_rate,
        profiles (
          full_name
        )
      )
    `)
    .eq('institution_id', profile?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">Relay</div>
            <div className="flex items-center space-x-6">
              <Link href="/relay/dashboard" className="text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/relay/consultants" className="text-gray-600 hover:text-gray-900">
                Find Consultants
              </Link>
              <Link href="/relay/engagements" className="text-gray-600 hover:text-gray-900">
                My Engagements
              </Link>
              <Link href="/relay/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <form action="/api/auth/signout" method="post">
                <button className="text-gray-600 hover:text-gray-900">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.institution_name}!</h1>
          <p className="text-gray-600">Manage your consulting engagements and discover new consultants</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Find the perfect consultant for your needs</h2>
          <p className="mb-6">Browse our network of verified higher education experts</p>
          <Link
            href="/relay/consultants"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Browse Consultants →
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Active Engagements</div>
            <div className="text-3xl font-bold text-blue-600">
              {engagements?.filter(e => e.status === 'active').length || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-yellow-600">
              {engagements?.filter(e => e.status === 'pending').length || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-600">
              {engagements?.filter(e => e.status === 'completed').length || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Consultants</div>
            <div className="text-3xl font-bold text-purple-600">
              {new Set(engagements?.map(e => e.consultant_id)).size || 0}
            </div>
          </div>
        </div>

        {/* Recent Engagements */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Engagements</h2>
            <Link href="/relay/engagements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y">
            {engagements && engagements.length > 0 ? (
              engagements.slice(0, 5).map((engagement: any) => (
                <div key={engagement.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{engagement.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        with {engagement.consultant_profiles?.profiles?.full_name}
                      </p>
                      {engagement.consultant_profiles?.expertise && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {engagement.consultant_profiles.expertise.slice(0, 3).map((exp: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {exp}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Budget: ${engagement.budget?.toLocaleString()}</span>
                        <span>•</span>
                        <span>{new Date(engagement.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        engagement.status === 'active' ? 'bg-green-100 text-green-700' :
                        engagement.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        engagement.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {engagement.status}
                      </span>
                      <Link
                        href={`/relay/engagements/${engagement.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg mb-4">No engagements yet</p>
                <p className="text-sm mb-6">Start by finding a consultant that matches your needs</p>
                <Link
                  href="/relay/consultants"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Consultants
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
