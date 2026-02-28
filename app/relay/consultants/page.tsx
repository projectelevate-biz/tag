import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BrowseConsultants({
  searchParams,
}: {
  searchParams: Promise<{ expertise?: string; search?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Get approved consultants
  let query = supabase
    .from('consultant_profiles')
    .select(`
      *,
      profiles (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('verification_status', 'approved')

  // Apply search filter if provided
  if (params.search) {
    query = query.or(`bio.ilike.%${params.search}%,expertise.cs.{${params.search}}`)
  }

  const { data: consultants } = await query.order('created_at', { ascending: false })

  // Get unique expertise areas for filtering
  const allExpertise = new Set<string>()
  consultants?.forEach(c => {
    c.expertise?.forEach((e: string) => allExpertise.add(e))
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">Relay</div>
            <div className="flex items-center space-x-6">
              <Link href="/relay/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/relay/consultants" className="text-gray-900 font-medium">
                Find Consultants
              </Link>
              <Link href="/relay/engagements" className="text-gray-600 hover:text-gray-900">
                My Engagements
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Consultants</h1>
          <p className="text-gray-600">Browse our network of verified higher education experts</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form className="flex gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search by expertise, bio, or name..."
              defaultValue={params.search}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Consultants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultants && consultants.length > 0 ? (
            consultants.map((consultant: any) => (
              <div key={consultant.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {consultant.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-bold text-lg">{consultant.profiles?.full_name}</h3>
                      <div className="text-sm text-gray-600">
                        {consultant.years_experience}+ years experience
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {consultant.bio || 'No bio provided'}
                  </p>

                  {consultant.expertise && consultant.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {consultant.expertise.slice(0, 3).map((exp: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {exp}
                        </span>
                      ))}
                      {consultant.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{consultant.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-600">Hourly Rate</div>
                      <div className="font-bold text-lg">${consultant.hourly_rate}/hr</div>
                    </div>
                    <Link
                      href={`/relay/consultants/${consultant.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Profile
                    </Link>
                  </div>

                  <div className="mt-3 flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      consultant.availability_status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : consultant.availability_status === 'busy'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {consultant.availability_status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No consultants found</p>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
