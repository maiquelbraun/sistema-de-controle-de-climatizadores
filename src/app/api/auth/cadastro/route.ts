import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Usuário com este email já existe' }, 
        { status: 400 }
      )
    }

    // Criar novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role
      }
    })

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso', 
        userId: newUser.id 
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
