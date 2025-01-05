import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Validar email
    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' }, 
        { status: 400 }
      )
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' }, 
        { status: 404 }
      )
    }

    // Gerar token de recuperação
    const token = randomBytes(32).toString('hex')
    const tokenExpiration = new Date(Date.now() + 3600000) // 1 hora de validade

    // Salvar token no banco de dados
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: tokenExpiration
      }
    })

    // Construir link de recuperação
    const resetLink = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${token}`

    // Enviar email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recuperação de Senha - Sistema de Climatizadores',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Este link expirará em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `
    })

    return NextResponse.json(
      { message: 'Link de recuperação enviado com sucesso' }, 
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
