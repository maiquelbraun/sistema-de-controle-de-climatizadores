'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { Spinner } from './Spinner'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'OPERATOR'] 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Verificar status da sessão
    if (status === 'unauthenticated') {
      router.replace('/auth/login')
      return
    }

    // Verificar permissões
    if (
      status === 'authenticated' && 
      session?.user?.role && 
      !requiredRoles.includes(session.user.role)
    ) {
      router.replace('/dashboard')
    }
  }, [status, session, router])

  // Estado de carregamento
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  // Sem permissão
  if (
    status === 'authenticated' && 
    session?.user?.role && 
    !requiredRoles.includes(session.user.role)
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p>Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Renderizar conteúdo protegido
  return <>{children}</>
}
