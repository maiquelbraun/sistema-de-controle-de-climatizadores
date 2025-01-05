import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Verificar sessão do admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Não autorizado' }, 
        { status: 403 }
      )
    }

    // Extrair dados da requisição
    const { role } = await req.json()

    // Validar papel
    const validRoles = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'OPERATOR', 'VIEWER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Papel de usuário inválido' }, 
        { status: 400 }
      )
    }

    // Atualizar papel do usuário
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar papel do usuário:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Verificar sessão do admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Não autorizado' }, 
        { status: 403 }
      )
    }

    // Verificar se não está tentando excluir o último admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    if (adminCount <= 1) {
      return NextResponse.json(
        { message: 'Não é possível excluir o último administrador' }, 
        { status: 400 }
      )
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Usuário excluído com sucesso' }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
