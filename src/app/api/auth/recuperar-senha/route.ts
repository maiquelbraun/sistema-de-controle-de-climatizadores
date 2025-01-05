import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { addHours } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' }, 
        { status: 404 }
      )
    }

    // Gerar token de redefinição
    const token = randomBytes(32).toString('hex')
    const expiresAt = addHours(new Date(), 1)  // Token válido por 1 hora

    // Salvar token no banco
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt
      }
    })

    // Aqui você normalmente enviaria um email
    // Como não temos serviço de email, vou simular o link
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/redefinir-senha?token=${token}`
    console.log(`Link de recuperação para ${email}: ${resetLink}`)

    return NextResponse.json(
      { message: 'Link de recuperação enviado' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na recuperação de senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
