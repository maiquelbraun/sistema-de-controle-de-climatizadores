import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const token = searchParams.get('token')

    // Validar token
    if (!token) {
      return NextResponse.json(
        { message: 'Token de recuperação inválido' }, 
        { status: 400 }
      )
    }

    // Buscar token no banco de dados
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    // Verificar se o token existe e não expirou
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Token de recuperação inválido ou expirado' }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Token válido' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na validação do token:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
