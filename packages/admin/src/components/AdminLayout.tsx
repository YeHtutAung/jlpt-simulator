import { Outlet, NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/upload',    label: 'Upload Exam' },
  { to: '/exams',     label: 'Manage Exams' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[var(--color-border)] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-[var(--color-border)]">
          <span className="text-lg font-semibold text-[var(--color-primary)]">JLPT Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-6 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--color-primary)] bg-red-50'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
