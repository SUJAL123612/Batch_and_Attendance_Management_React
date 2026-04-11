import { Bell, Search, User, Menu, ChevronDown, LogOut, Settings, Moon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

function Header({ onMenuClick, isCollapsed }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const profileRef = useRef(null)
  const notificationRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    { id: 1, title: 'New student enrolled', desc: 'John Doe joined Web Development batch', time: '2 min ago', unread: true },
    { id: 2, title: 'Attendance marked', desc: 'Morning session attendance completed', time: '1 hour ago', unread: true },
    { id: 3, title: 'New batch created', desc: 'React Advanced batch is now live', time: '3 hours ago', unread: false },
  ]

  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-background rounded border border-border">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Mobile search */}
        <button className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button className="hidden lg:flex p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
          <Moon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card"></span>
          </button>

          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors border-b border-border last:border-0 ${notif.unread ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.unread ? 'bg-primary' : 'bg-transparent'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.desc}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-border">
                <button className="w-full text-sm text-primary font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 lg:gap-3 p-1.5 lg:pl-3 lg:pr-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-foreground">Rahul Pawar</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <ChevronDown className={`hidden lg:block w-4 h-4 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-foreground">Rahul Pawar</p>
                <p className="text-xs text-muted-foreground">rahul@edumanager.com</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </button>
              </div>
              <div className="p-2 border-t border-border">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
