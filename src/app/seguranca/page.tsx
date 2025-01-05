'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Spinner } from '@/components/Spinner'
import { format } from 'date-fns'

interface SecuritySettings {
  maxLoginAttempts: number
  lockoutDuration: number
  passwordMinLength: number
  requireSpecialChar: boolean
  requireUppercase: boolean
  requireNumber: boolean
  enableTwoFactorAuth: boolean
}

interface LoginAttempt {
  id: string
  email: string
  ipAddress: string
  success: boolean
  timestamp: string
}

export default function SecurityDashboardPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        const [settingsResponse, attemptsResponse] = await Promise.all([
          fetch('/api/seguranca/configuracoes'),
          fetch('/api/seguranca/tentativas')
        ])

        if (!settingsResponse.ok || !attemptsResponse.ok) {
          throw new Error('Erro ao buscar dados de segurança')
        }

        const settingsData = await settingsResponse.json()
        const attemptsData = await attemptsResponse.json()

        setSettings(settingsData)
        setLoginAttempts(attemptsData)
        setLoading(false)
      } catch (err) {
        setError((err as Error).message)
        setLoading(false)
      }
    }
    fetchSecurityData()
  }, [])

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/seguranca/configuracoes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar configurações')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      setEditMode(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-3xl font-bold mb-6">Painel de Segurança</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configurações de Segurança */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Configurações de Segurança</h2>
              <button 
                onClick={() => setEditMode(!editMode)}
                className="text-blue-500 hover:underline"
              >
                {editMode ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleSettingsUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">
                      Máximo de Tentativas de Login
                      <input
                        type="number"
                        value={settings?.maxLoginAttempts}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev, 
                          maxLoginAttempts: Number(e.target.value)
                        } : null)}
                        className="w-full px-3 py-2 border rounded-md"
                        min={1}
                        max={10}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block mb-2">
                      Duração de Bloqueio (minutos)
                      <input
                        type="number"
                        value={settings?.lockoutDuration}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev, 
                          lockoutDuration: Number(e.target.value)
                        } : null)}
                        className="w-full px-3 py-2 border rounded-md"
                        min={5}
                        max={60}
                      />
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings?.requireSpecialChar}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev, 
                        requireSpecialChar: e.target.checked
                      } : null)}
                      className="mr-2"
                    />
                    <label>Exigir Caractere Especial</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings?.requireUppercase}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev, 
                        requireUppercase: e.target.checked
                      } : null)}
                      className="mr-2"
                    />
                    <label>Exigir Letra Maiúscula</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings?.requireNumber}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev, 
                        requireNumber: e.target.checked
                      } : null)}
                      className="mr-2"
                    />
                    <label>Exigir Número</label>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                  >
                    Salvar Configurações
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>Máximo de Tentativas:</strong> {settings?.maxLoginAttempts}
                </p>
                <p>
                  <strong>Duração de Bloqueio:</strong> {settings?.lockoutDuration} minutos
                </p>
                <p>
                  <strong>Requisitos de Senha:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {settings?.requireSpecialChar && <li>Caractere Especial</li>}
                    {settings?.requireUppercase && <li>Letra Maiúscula</li>}
                    {settings?.requireNumber && <li>Número</li>}
                  </ul>
                </p>
              </div>
            )}
          </div>

          {/* Tentativas de Login */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tentativas de Login Recentes</h2>
            
            {loginAttempts.length === 0 ? (
              <div className="text-center text-gray-500">
                Nenhuma tentativa de login registrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">IP</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginAttempts.map(attempt => (
                      <tr 
                        key={attempt.id} 
                        className={`
                          border-b 
                          ${attempt.success 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'bg-red-50 hover:bg-red-100'
                          }
                        `}
                      >
                        <td className="px-4 py-2">{attempt.email}</td>
                        <td className="px-4 py-2">{attempt.ipAddress}</td>
                        <td className="px-4 py-2">
                          {attempt.success ? 'Sucesso' : 'Falha'}
                        </td>
                        <td className="px-4 py-2">
                          {format(new Date(attempt.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
