'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function PerfilPage() {
  const { data: session } = useSession()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ 
    text: string, 
    type: 'success' | 'error' 
  } | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validações
    if (newPassword !== confirmPassword) {
      setMessage({ 
        text: 'Novas senhas não coincidem', 
        type: 'error' 
      })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ 
        text: 'Senha deve ter no mínimo 6 caracteres', 
        type: 'error' 
      })
      return
    }

    try {
      const response = await fetch('/api/perfil/senha', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          text: 'Senha alterada com sucesso', 
          type: 'success' 
        })
        // Limpar campos
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ 
          text: data.message || 'Erro ao alterar senha', 
          type: 'error' 
        })
      }
    } catch (error) {
      setMessage({ 
        text: 'Erro de conexão', 
        type: 'error' 
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Meu Perfil</h1>

          {/* Informações do Usuário */}
          <div className="bg-blue-100 p-4 rounded-lg mb-6">
            <p><strong>Nome:</strong> {session?.user?.name}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Nível de Acesso:</strong> {session?.user?.role}</p>
          </div>

          {/* Formulário de Troca de Senha */}
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label 
                htmlFor="currentPassword" 
                className="block text-gray-700 mb-2"
              >
                Senha Atual
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>

            <div className="mb-4">
              <label 
                htmlFor="newPassword" 
                className="block text-gray-700 mb-2"
              >
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                required
                minLength={6}
              />
            </div>

            <div className="mb-6">
              <label 
                htmlFor="confirmPassword" 
                className="block text-gray-700 mb-2"
              >
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                required
                minLength={6}
              />
            </div>

            {/* Mensagem de Feedback */}
            {message && (
              <div className={`
                mb-4 p-3 rounded 
                ${message.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
                }
              `}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Alterar Senha
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
