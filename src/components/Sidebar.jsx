import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Menu,
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

function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center glow-primary">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold text-foreground">EduManager</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            )}
          </div>
          
          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main Menu
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg glow-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : ''}`} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm font-medium rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-1">
          <NavLink
            to="/settings"
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
              ${isCollapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm font-medium rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </NavLink>
          
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
