import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { isAfter } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    // Validações
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token e nova senha são obrigatórios' }, 
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Senha deve ter no mínimo 6 caracteres' }, 
        { status: 400 }
      )
    }

    // Buscar token de redefinição
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Token inválido' }, 
        { status: 400 }
      )
    }

    // Verificar expiração do token
    if (isAfter(new Date(), resetToken.expiresAt)) {
      return NextResponse.json(
        { message: 'Token expirado' }, 
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' }, 
        { status: 404 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    })

    // Remover tokens de redefinição usados
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email }
    })

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na redefinição de senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
