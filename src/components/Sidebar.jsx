import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  FileText,
  Settings,
  BookOpen,
  UserCog,
  User,
  X
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Branch', path: '/branch', icon: Building2 },
  { name: 'Courses', path: '/courses', icon: BookOpen },
  { name: 'Manager', path: '/manager', icon: UserCog },
  { name: 'Faculties', path: '/faculties', icon: GraduationCap },
  { name: 'Students', path: '/students', icon: User },
  { name: 'Batches', path: '/batches', icon: Users },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Reports', path: '/reports', icon: FileText },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span>EduManager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 ml-10">Batch & Attendance</p>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-slate-700/50">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
