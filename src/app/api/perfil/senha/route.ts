import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest) {
  try {
    // Verificar sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.email) {
      return NextResponse.json(
        { message: 'Não autorizado' }, 
        { status: 403 }
      )
    }

    // Extrair dados da requisição
    const { currentPassword, newPassword } = await req.json()

    // Validações
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' }, 
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Senha deve ter no mínimo 6 caracteres' }, 
        { status: 400 }
      )
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' }, 
        { status: 404 }
      )
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword, 
      user.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Senha atual incorreta' }, 
        { status: 401 }
      )
    }

    // Gerar nova senha com hash
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json(
      { message: 'Senha alterada com sucesso' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
