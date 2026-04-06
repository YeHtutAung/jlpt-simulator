import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseAdmin } from '../lib/supabase'

interface ExamRow {
  id:         string
  level:      string
  year:       number
  month:      string
  status:     string
  created_at: string
}

type ExamStatus = 'draft' | 'published' | 'archived'

async function fetchExams(): Promise<ExamRow[]> {
  const { data, error } = await supabaseAdmin
    .from('exams')
    .select('id, level, year, month, status, created_at')
    .order('year', { ascending: false })
    .order('level')

  if (error) throw new Error(error.message)
  return data ?? []
}

export default function ManageExams() {
  const queryClient           = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: exams = [], isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn:  fetchExams,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ExamStatus }) => {
      const { error } = await supabaseAdmin
        .from('exams')
        .update({ status })
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  })

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from('exams').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      setConfirmDelete(null)
      queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })

  if (isLoading) return <div className="p-8 text-[var(--color-text-muted)]">Loading...</div>
  if (error)     return <div className="p-8 text-[var(--color-error)]">Failed to load exams.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Manage Exams</h1>

      {exams.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <p>No exams in database.</p>
          <a href="/upload" className="text-[var(--color-primary)] text-sm font-medium hover:underline mt-2 inline-block">
            Upload an exam →
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)]">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{exam.level}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{exam.year}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)] capitalize">{exam.month}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={exam.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {exam.status !== 'published' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: exam.id, status: 'published' })}
                          className="text-xs text-[var(--color-success)] hover:underline"
                        >
                          Publish
                        </button>
                      )}
                      {exam.status === 'published' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: exam.id, status: 'archived' })}
                          className="text-xs text-[var(--color-text-muted)] hover:underline"
                        >
                          Archive
                        </button>
                      )}
                      {exam.status === 'archived' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: exam.id, status: 'draft' })}
                          className="text-xs text-[var(--color-accent)] hover:underline"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(exam.id)}
                        className="text-xs text-[var(--color-error)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 max-w-sm w-full mx-4 shadow-lg">
            <h2 className="text-base font-semibold mb-2">Delete exam?</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              This will permanently delete the exam and all its questions. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteExam.mutate(confirmDelete)}
                disabled={deleteExam.isPending}
                className="px-4 py-2 bg-[var(--color-error)] text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteExam.isPending ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-[var(--color-border)] text-sm font-medium rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
