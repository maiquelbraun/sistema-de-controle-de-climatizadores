import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Verificar sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' }, 
        { status: 403 }
      )
    }

    // Verificar permissão de acesso aos logs
    const allowedRoles = ['ADMIN', 'MANAGER']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    // Buscar logs de atividade
    const logs = await prisma.userActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,  // Limitar para evitar sobrecarga
      select: {
        id: true,
        action: true,
        description: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true
      }
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
