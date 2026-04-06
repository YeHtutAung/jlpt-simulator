import { useQuery } from '@tanstack/react-query'
import { supabaseAdmin } from '../lib/supabase'

interface ExamStat {
  level: string
  count: number
}

interface DashboardData {
  totalExams:    number
  totalUsers:    number
  totalAttempts: number
  byLevel:       ExamStat[]
  recentExams:   Array<{
    id:        string
    level:     string
    year:      number
    month:     string
    status:    string
    created_at: string
  }>
}

async function fetchDashboardData(): Promise<DashboardData> {
  const [examsRes, usersRes, attemptsRes] = await Promise.all([
    supabaseAdmin.from('exams').select('id, level, year, month, status, created_at').order('created_at', { ascending: false }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('attempts').select('id', { count: 'exact', head: true }),
  ])

  const exams   = examsRes.data ?? []
  const total   = exams.length
  const users   = usersRes.count   ?? 0
  const attempts = attemptsRes.count ?? 0

  // Group by level
  const levelMap: Record<string, number> = {}
  for (const exam of exams) {
    levelMap[exam.level] = (levelMap[exam.level] ?? 0) + 1
  }
  const byLevel = Object.entries(levelMap).map(([level, count]) => ({ level, count }))

  return {
    totalExams:    total,
    totalUsers:    users,
    totalAttempts: attempts,
    byLevel,
    recentExams:   exams.slice(0, 5),
  }
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey:  ['dashboard'],
    queryFn:   fetchDashboardData,
    staleTime: 60_000,
  })

  if (isLoading) {
    return <div className="p-8 text-[var(--color-text-muted)]">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-[var(--color-error)]">
        Failed to load dashboard. Check Supabase connection.
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Exams"    value={data.totalExams} />
        <StatCard label="Registered Users" value={data.totalUsers} />
        <StatCard label="Total Attempts" value={data.totalAttempts} />
      </div>

      {/* By level */}
      <section className="bg-white rounded-lg border border-[var(--color-border)] p-6 mb-6">
        <h2 className="text-base font-semibold mb-4">Exams by Level</h2>
        <div className="flex gap-4 flex-wrap">
          {data.byLevel.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-sm">No exams yet.</p>
          ) : (
            data.byLevel.map(({ level, count }) => (
              <div key={level} className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-[var(--color-primary)] text-sm font-medium">
                  {level}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">{count} exam{count !== 1 ? 's' : ''}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent exams */}
      <section className="bg-white rounded-lg border border-[var(--color-border)] p-6">
        <h2 className="text-base font-semibold mb-4">Recent Exams</h2>
        {data.recentExams.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-sm">No exams uploaded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="pb-2 font-medium">Level</th>
                <th className="pb-2 font-medium">Year</th>
                <th className="pb-2 font-medium">Month</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.recentExams.map((exam) => (
                <tr key={exam.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2.5 font-medium">{exam.level}</td>
                  <td className="py-2.5 text-[var(--color-text-muted)]">{exam.year}</td>
                  <td className="py-2.5 text-[var(--color-text-muted)] capitalize">{exam.month}</td>
                  <td className="py-2.5">
                    <StatusBadge status={exam.status} />
                  </td>
                  <td className="py-2.5 text-[var(--color-text-muted)]">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
      <div className="text-3xl font-bold text-[var(--color-text)] mb-1">{value}</div>
      <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'bg-green-50 text-green-700',
    draft:     'bg-yellow-50 text-yellow-700',
    archived:  'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? 'bg-gray-100'}`}>
      {status}
    </span>
  )
}
