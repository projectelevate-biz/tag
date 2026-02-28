import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ConsultantDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Get consultant profile
  const { data: profile } = await supabase
    .from('consultant_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get active engagements
  const { data: engagements } = await supabase
    .from('engagements')
    .select(`
      *,
      institution_profiles (
        institution_name
      )
    `)
    .eq('consultant_id', profile?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-green-600">Rebound</div>
            <div className="flex items-center space-x-6">
              <Link href="/rebound/dashboard" className="text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/rebound/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <Link href="/rebound/engagements" className="text-gray-600 hover:text-gray-900">
                Engagements
              </Link>
              <Link href="/rebound/earnings" className="text-gray-600 hover:text-gray-900">
                Earnings
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
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your consulting business</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Active Engagements</div>
            <div className="text-3xl font-bold">
              {engagements?.filter(e => e.status === 'active').length || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Pending Requests</div>
            <div className="text-3xl font-bold">
              {engagements?.filter(e => e.status === 'pending').length || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Completed Projects</div>
            <div className="text-3xl font-bold">
              {engagements?.filter(e => e.status === 'completed').length || 0}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Profile Status</div>
            <div className={`text-lg font-semibold ${
              profile?.verification_status === 'approved'
                ? 'text-green-600'
                : profile?.verification_status === 'pending'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {profile?.verification_status || 'Incomplete'}
            </div>
          </div>
        </div>

        {/* Profile Status Alert */}
        {profile?.verification_status !== 'approved' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
            <p className="text-yellow-700 mb-3">
              {profile?.verification_status === 'pending'
                ? 'Your profile is under review. You\'ll be notified once it\'s approved.'
                : 'Complete your profile to start receiving engagement requests from institutions.'}
            </p>
            <Link
              href="/rebound/profile"
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Complete Profile
            </Link>
          </div>
        )}

        {/* Recent Engagements */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Engagements</h2>
          </div>
          <div className="divide-y">
            {engagements && engagements.length > 0 ? (
              engagements.slice(0, 5).map((engagement: any) => (
                <div key={engagement.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{engagement.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {engagement.institution_profiles?.institution_name}
                      </p>
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
                        href={`/rebound/engagements/${engagement.id}`}
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
                <p className="mb-4">No engagements yet</p>
                <p className="text-sm">Complete your profile to start receiving requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
