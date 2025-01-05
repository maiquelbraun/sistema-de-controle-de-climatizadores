import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Função auxiliar para verificar permissão de admin
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)
  
  console.log('Session in checkAdminPermission:', session);
  
  if (!session) {
    console.log('No session found');
    return null
  }

  if (session.user.role !== 'ADMIN') {
    console.log('User is not an admin. Current role:', session.user.role);
    return null
  }

  return session
}

// Listar usuários
export async function GET(req: NextRequest) {
  try {
    // Verificar permissão de admin
    const session = await checkAdminPermission()
    if (!session) {
      return new NextResponse(JSON.stringify({ 
        users: [],
        message: 'Não autorizado',
        success: false,
        error: 'Acesso restrito a administradores'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parâmetros de paginação e filtro
    const { searchParams } = req.nextUrl
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Calcular offset
    const offset = (page - 1) * limit

    // Construir filtro de busca
    const whereCondition = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereCondition })
    ])

    // Calcular total de páginas
    const totalPages = Math.ceil(total / limit)

    // Log dos usuários encontrados
    console.log('Usuários encontrados:', {
      total,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }))
    });

    // Retornar resposta padronizada
    return new NextResponse(JSON.stringify({
      users: users.map(u => ({
        id: u.id,
        name: u.name || '',
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString()
      })),
      totalPages: totalPages,
      currentPage: page,
      totalUsers: total,
      message: 'Usuários encontrados com sucesso',
      success: true
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (queryError) {
    console.error('Erro na consulta de usuários:', queryError)
    
    return new NextResponse(JSON.stringify({
      users: [],
      message: 'Erro interno do servidor',
      success: false,
      error: queryError instanceof Error ? queryError.message : 'Erro desconhecido'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Criar usuário
export async function POST(req: NextRequest) {
  try {
    // Verificar permissão de admin
    const session = await checkAdminPermission()
    if (!session) {
      return new NextResponse(JSON.stringify({ 
        message: 'Não autorizado',
        success: false,
        error: 'Acesso restrito a administradores',
        data: null
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Ler corpo da requisição
    const body = await req.json()

    // Validação de campos obrigatórios
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return new NextResponse(JSON.stringify({ 
        message: 'Todos os campos são obrigatórios',
        success: false,
        error: 'Campos obrigatórios não preenchidos',
        data: null
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse(JSON.stringify({ 
        message: 'Usuário com este email já existe',
        success: false,
        error: 'Email em uso por outro usuário',
        data: null
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('Usuário criado com sucesso:', newUser)

    return new NextResponse(JSON.stringify({
      data: newUser,
      message: 'Usuário criado com sucesso',
      success: true
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    
    // Garantir que sempre retorne um JSON
    const errorResponse = {
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false,
      data: null
    }

    console.log('Resposta de erro:', errorResponse)

    return new NextResponse(JSON.stringify(errorResponse), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Atualizar usuário
export async function PUT(req: NextRequest) {
  try {
    console.log('PUT request received for user update');

    // Verificar permissão de admin
    const session = await checkAdminPermission()
    if (!session) {
      console.log('Admin permission check failed');
      return new NextResponse(JSON.stringify({ 
        message: 'Não autorizado',
        success: false,
        error: 'Acesso restrito a administradores',
        data: null
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Ler corpo da requisição
    const body = await req.json()
    console.log('Request body:', body);

    // Validações
    const { id, name, email, password, role } = body

    if (!id) {
      console.log('No user ID provided');
      return new NextResponse(JSON.stringify({ 
        message: 'ID do usuário é obrigatório',
        success: false,
        error: 'ID não pode ser vazio',
        data: null
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return new NextResponse(JSON.stringify({ 
        message: 'Usuário não encontrado',
        success: false,
        error: 'Usuário não existe no banco de dados',
        data: null
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Preparar dados de atualização
    const updateData: any = {}
    
    // Atualizar nome se fornecido
    if (name) updateData.name = name

    // Atualizar email se fornecido
    if (email) {
      // Verificar se o novo email já está em uso
      const existingEmail = await prisma.user.findUnique({
        where: { 
          email,
          NOT: { id }  // Excluir o próprio usuário da verificação
        }
      })

      if (existingEmail) {
        return new NextResponse(JSON.stringify({ 
          message: 'Email já cadastrado por outro usuário',
          success: false,
          error: 'Email em uso por outro usuário',
          data: null
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      updateData.email = email
    }

    // Atualizar papel se fornecido
    if (role) updateData.role = role

    // Atualizar senha se fornecida
    if (password) {
      updateData.password = await hash(password, 10)
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('Usuário atualizado:', updatedUser)

    return new NextResponse(JSON.stringify({
      data: updatedUser,
      message: 'Usuário atualizado com sucesso',
      success: true
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    
    // Garantir que sempre retorne um JSON
    const errorResponse = {
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false,
      data: null
    }

    console.log('Resposta de erro:', errorResponse)

    return new NextResponse(JSON.stringify(errorResponse), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Excluir usuário
export async function DELETE(req: NextRequest) {
  try {
    // Verificar permissão de admin
    const session = await checkAdminPermission()
    if (!session) {
      return new NextResponse(JSON.stringify({ 
        message: 'Não autorizado',
        success: false,
        error: 'Acesso restrito a administradores',
        data: null
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Extrair ID do usuário da URL
    const { searchParams } = req.nextUrl
    const userId = searchParams.get('id')

    if (!userId) {
      return new NextResponse(JSON.stringify({ 
        message: 'ID do usuário não especificado',
        success: false,
        error: 'É necessário fornecer um ID de usuário válido',
        data: null
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return new NextResponse(JSON.stringify({ 
        message: 'Usuário não encontrado',
        success: false,
        error: 'Não foi possível encontrar o usuário para exclusão',
        data: null
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verificar se não está tentando excluir o próprio usuário
    if (existingUser.email === session.user.email) {
      return new NextResponse(JSON.stringify({ 
        message: 'Não é possível excluir o próprio usuário',
        success: false,
        error: 'Você não pode excluir sua própria conta',
        data: null
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Excluir usuário
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    console.log('Usuário excluído com sucesso:', deletedUser)

    return new NextResponse(JSON.stringify({
      data: deletedUser,
      message: 'Usuário excluído com sucesso',
      success: true
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    
    // Garantir que sempre retorne um JSON
    const errorResponse = {
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false,
      data: null
    }

    console.log('Resposta de erro:', errorResponse)

    return new NextResponse(JSON.stringify(errorResponse), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Função auxiliar para hash de senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return hash(password, saltRounds)
}
