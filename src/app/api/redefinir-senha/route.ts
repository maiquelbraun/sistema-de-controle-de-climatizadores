import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { token, novaSenha } = await req.json()

    // Validações
    if (!token || !novaSenha) {
      return NextResponse.json(
        { message: 'Token e nova senha são obrigatórios' }, 
        { status: 400 }
      )
    }

    if (novaSenha.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter no mínimo 8 caracteres' }, 
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

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10)

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    })

    // Remover tokens de recuperação do usuário
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId }
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
