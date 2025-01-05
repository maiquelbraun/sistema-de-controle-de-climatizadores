'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Spinner } from '@/components/Spinner'
import { format } from 'date-fns'

interface ActivityLog {
  id: string
  action: string
  description: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/logs')
        if (!response.ok) {
          throw new Error('Erro ao buscar logs')
        }
        const data = await response.json()
        setLogs(data)
        setLoading(false)
      } catch (err) {
        setError((err as Error).message)
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Logs de Atividade</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            Nenhum log de atividade encontrado
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Ação</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3">{log.description}</td>
                    <td className="px-4 py-3">{log.ipAddress || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
