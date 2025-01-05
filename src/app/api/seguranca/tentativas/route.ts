import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { subDays } from 'date-fns'

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

    // Verificar permissão de acesso
    const allowedRoles = ['ADMIN', 'MANAGER']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    // Buscar tentativas de login dos últimos 7 dias
    const loginAttempts = await prisma.loginAttempt.findMany({
      where: {
        timestamp: {
          gte: subDays(new Date(), 7)
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: {
        id: true,
        email: true,
        ipAddress: true,
        success: true,
        timestamp: true
      }
    })

    return NextResponse.json(loginAttempts)
  } catch (error) {
    console.error('Erro ao buscar tentativas de login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
