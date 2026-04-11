import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Building2, 
  Users, 
  GraduationCap, 
  CalendarCheck,
  BookOpen,
  UserCog,
  User,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react'

// API endpoints
const API_BASE = 'http://localhost:9998'

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    branches: 0,
    batches: 0,
    students: 0,
    courses: 0,
    managers: 0,
    faculties: 0
  })
  const [recentBatches, setRecentBatches] = useState([])
  const [recentStudents, setRecentStudents] = useState([])

  // Helper to extract data from API response
  const extractData = (response) => {
    const d = response.data
    if (Array.isArray(d)) return d
    if (d?.data && Array.isArray(d.data)) return d.data
    if (d?.rows && Array.isArray(d.rows)) return d.rows
    if (d?.result && Array.isArray(d.result)) return d.result
    return []
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [
        batchesRes,
        studentsRes,
        coursesRes,
        managersRes,
        facultiesRes,
        branchesRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/batches/get_batch_list`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/students/get_student_list`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/courses/get_course_list`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/manager/get_manager_list`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/faculties/get_faculty_list`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/branches/get_branch_list`).catch(() => ({ data: [] }))
      ])

      const batches = extractData(batchesRes)
      const students = extractData(studentsRes)
      const courses = extractData(coursesRes)
      const managers = extractData(managersRes)
      const faculties = extractData(facultiesRes)
      const branches = extractData(branchesRes)

      setStats({
        branches: branches.length,
        batches: batches.length,
        students: students.length,
        courses: courses.length,
        managers: managers.length,
        faculties: faculties.length
      })

      // Get recent items (last 5)
      setRecentBatches(batches.slice(0, 5))
      setRecentStudents(students.slice(0, 5))
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      name: 'Total Batches', 
      value: stats.batches, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      path: '/batches'
    },
    { 
      name: 'Total Students', 
      value: stats.students, 
      icon: GraduationCap, 
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      path: '/students'
    },
    { 
      name: 'Total Courses', 
      value: stats.courses, 
      icon: BookOpen, 
      color: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      path: '/courses'
    },
    { 
      name: 'Faculties', 
      value: stats.faculties, 
      icon: User, 
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      path: '/faculties'
    },
    { 
      name: 'Managers', 
      value: stats.managers, 
      icon: UserCog, 
      color: 'from-rose-500 to-rose-600',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600',
      path: '/manager'
    },
    { 
      name: 'Branches', 
      value: stats.branches, 
      icon: Building2, 
      color: 'from-cyan-500 to-cyan-600',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      path: '/branch'
    },
  ]

  const quickActions = [
    { name: 'Add Branch', icon: Building2, path: '/branch', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { name: 'Create Batch', icon: Users, path: '/batches', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { name: 'Add Student', icon: GraduationCap, path: '/students', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
    { name: 'Add Course', icon: BookOpen, path: '/courses', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
  ]

  // Status colors for batches
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome back! Here&apos;s an overview of your institute.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <button
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${stat.bgLight} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.name}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button 
              key={action.name}
              onClick={() => navigate(action.path)}
              className={`flex items-center gap-3 p-3 rounded-lg ${action.color} transition-colors`}
            >
              <action.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Recent Batches</h2>
            <button 
              onClick={() => navigate('/batches')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBatches.length > 0 ? (
              recentBatches.map((batch) => (
                <div key={batch.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{batch.name}</p>
                        <p className="text-xs text-slate-500 truncate">{batch.course_name || 'No course'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 ${statusColors[batch.batch_status] || 'bg-slate-100 text-slate-600'}`}>
                      {batch.batch_status || 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No batches yet</p>
                <button 
                  onClick={() => navigate('/batches')}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Create First Batch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Recent Students</h2>
            <button 
              onClick={() => navigate('/students')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <div key={student.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm">
                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{student.name}</p>
                      <p className="text-xs text-slate-500 truncate">{student.email || student.phone || 'No contact'}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {student.batch_name || 'No batch'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No students yet</p>
                <button 
                  onClick={() => navigate('/students')}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add First Student
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Institute Overview</h3>
            <p className="text-primary-100 text-sm mt-1">
              You have {stats.batches} active batches with {stats.students} enrolled students across {stats.courses} courses.
            </p>
          </div>
          <button 
            onClick={() => navigate('/batches')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Manage Batches
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
