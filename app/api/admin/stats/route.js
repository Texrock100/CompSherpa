import supabase from '../../../../Lib/supabase'

export async function GET(request) {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Get total reports
    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })

    // Get recent users (last 10)
    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('email, target_role, target_location, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get popular roles
    const { data: popularRoles } = await supabase
      .from('user_profiles')
      .select('target_role')
      .order('target_role')
    
    // Count roles manually since Supabase doesn't have GROUP BY in the client
    const roleCounts = {}
    popularRoles?.forEach(user => {
      const role = user.target_role || 'Not specified'
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })
    
    const popularRolesList = Object.entries(roleCounts)
      .map(([role, count]) => ({ target_role: role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get recent reports
    const { data: recentReports } = await supabase
      .from('reports')
      .select('profile_snapshot, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Calculate average salary expectations
    const { data: salaryData } = await supabase
      .from('user_profiles')
      .select('salary_expectations')
      .not('salary_expectations', 'is', null)

    let avgTarget = 0
    let avgMinimum = 0
    let count = 0

    salaryData?.forEach(user => {
      if (user.salary_expectations?.target) {
        // Handle string values like "125k" or "125000"
        const target = parseFloat(user.salary_expectations.target.toString().replace(/[^0-9.]/g, ''))
        if (!isNaN(target)) {
          avgTarget += target > 1000 ? target : target * 1000 // Handle "125" vs "125000"
          count++
        }
      }
    })

    const avgSalaryExpectations = {
      target: count > 0 ? avgTarget / count : 0
    }

    return Response.json({
      totalUsers: totalUsers || 0,
      totalReports: totalReports || 0,
      recentUsers: recentUsers || [],
      popularRoles: popularRolesList,
      avgSalaryExpectations,
      recentReports: recentReports || []
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}