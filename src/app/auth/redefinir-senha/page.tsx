'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RedefinirSenhaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const resetToken = searchParams.get('token')
    if (!resetToken) {
      setMessage({
        text: 'Token de redefinição inválido',
        type: 'error'
      })
    } else {
      setToken(resetToken)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsLoading(true)

    // Validações
    if (newPassword !== confirmPassword) {
      setMessage({
        text: 'Senhas não coincidem',
        type: 'error'
      })
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({
        text: 'Senha deve ter no mínimo 6 caracteres',
        type: 'error'
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          text: 'Senha redefinida com sucesso',
          type: 'success'
        })
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setMessage({
          text: data.message || 'Erro ao redefinir senha',
          type: 'error'
        })
      }
    } catch (error) {
      setMessage({
        text: 'Erro de conexão',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Se não há token, mostrar erro
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Token Inválido
          </h2>
          <p className="mb-4">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <Link 
            href="/auth/recuperar-senha" 
            className="text-blue-500 hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Redefinir Senha
        </h2>

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
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
            disabled={isLoading}
            className={`
              w-full py-2 rounded-md transition duration-300
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link 
            href="/auth/login" 
            className="text-blue-500 hover:underline"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  )
}
