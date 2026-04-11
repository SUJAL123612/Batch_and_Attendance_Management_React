import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Building2, Users, GraduationCap, CalendarCheck, 
  TrendingUp, TrendingDown, BookOpen, UserCog,
  User, Clock, ArrowRight, Plus, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:9998'

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    branches: 0,
    courses: 0,
    managers: 0,
    faculties: 0,
    students: 0,
    batches: 0
  })
  const [recentBatches, setRecentBatches] = useState([])
  const [recentStudents, setRecentStudents] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [branches, courses, managers, faculties, students, batches] = await Promise.all([
        axios.get(`${API_BASE}/branches/get_branch_list`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/courses/get_course_list`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/manager/get_manager_list`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/faculties/get_faculty_list`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/students/get_student_list`, { params: { page_size: 1000 } }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/batches/get_batch_list`, { params: { page_size: 1000 } }).catch(() => ({ data: { data: [] } }))
      ])

      const branchData = branches.data?.data || branches.data || []
      const courseData = courses.data?.data || courses.data || []
      const managerData = managers.data?.data || managers.data || []
      const facultyData = faculties.data?.data || faculties.data || []
      const studentData = students.data?.data || students.data || []
      const batchData = batches.data?.data || batches.data || []

      setStats({
        branches: Array.isArray(branchData) ? branchData.length : 0,
        courses: Array.isArray(courseData) ? courseData.length : 0,
        managers: Array.isArray(managerData) ? managerData.length : 0,
        faculties: Array.isArray(facultyData) ? facultyData.length : 0,
        students: Array.isArray(studentData) ? studentData.length : 0,
        batches: Array.isArray(batchData) ? batchData.length : 0
      })

      // Get recent items
      if (Array.isArray(batchData)) {
        setRecentBatches(batchData.slice(0, 5))
      }
      if (Array.isArray(studentData)) {
        setRecentStudents(studentData.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      name: 'Total Branches', 
      value: stats.branches, 
      icon: Building2, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      trend: '+12%',
      trendUp: true,
      path: '/branch'
    },
    { 
      name: 'Active Courses', 
      value: stats.courses, 
      icon: BookOpen, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      trend: '+8%',
      trendUp: true,
      path: '/courses'
    },
    { 
      name: 'Total Students', 
      value: stats.students, 
      icon: GraduationCap, 
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-500/10',
      textColor: 'text-violet-400',
      trend: '+23%',
      trendUp: true,
      path: '/students'
    },
    { 
      name: 'Active Batches', 
      value: stats.batches, 
      icon: Users, 
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      trend: '+5%',
      trendUp: true,
      path: '/batches'
    },
    { 
      name: 'Managers', 
      value: stats.managers, 
      icon: UserCog, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-400',
      trend: '+3%',
      trendUp: true,
      path: '/manager'
    },
    { 
      name: 'Faculties', 
      value: stats.faculties, 
      icon: User, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      trend: '+15%',
      trendUp: true,
      path: '/faculties'
    },
  ]

  const quickActions = [
    { name: 'Add Branch', icon: Building2, path: '/branch', color: 'text-blue-400' },
    { name: 'Create Batch', icon: Users, path: '/batches', color: 'text-amber-400' },
    { name: 'Add Student', icon: GraduationCap, path: '/students', color: 'text-violet-400' },
    { name: 'Mark Attendance', icon: CalendarCheck, path: '/attendance', color: 'text-emerald-400' },
  ]

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'completed':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here is an overview of your institute.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className="bg-card rounded-xl p-4 lg:p-5 border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-primary font-medium group-hover:underline flex items-center gap-1">
                View details <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Batches */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Batches</h2>
              <p className="text-sm text-muted-foreground">Latest batch activities</p>
            </div>
            <button 
              onClick={() => navigate('/batches')}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5">
            {recentBatches.length > 0 ? (
              <div className="space-y-3">
                {recentBatches.map((batch, idx) => (
                  <div 
                    key={batch.id || idx}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => navigate('/batches')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{batch.name || 'Unnamed Batch'}</p>
                        <p className="text-sm text-muted-foreground">
                          {batch.course_name || 'No course'} {batch.start_time && `| ${batch.start_time}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.batch_status)}`}>
                        {batch.batch_status || 'Active'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No batches found</p>
                <button 
                  onClick={() => navigate('/batches')}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Create your first batch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Common tasks at a glance</p>
          </div>
          <div className="p-5 space-y-2">
            {quickActions.map((action) => (
              <button 
                key={action.name}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div className="p-2 rounded-lg bg-card border border-border group-hover:border-primary/50 transition-colors">
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="font-medium text-foreground">{action.name}</span>
                <Plus className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Students</h2>
            <p className="text-sm text-muted-foreground">Newly enrolled students</p>
          </div>
          <button 
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          {recentStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {recentStudents.map((student, idx) => (
                <div 
                  key={student.id || idx}
                  className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => navigate('/students')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">
                        {(student.first_name?.[0] || 'S').toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{student.email || 'No email'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No students found</p>
              <button 
                onClick={() => navigate('/students')}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Add your first student
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
