import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Função auxiliar para verificar permissão de admin
async function checkAdminPermission() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('ADMIN CHECK - Session details:', {
      session: session ? {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role
        },
        expires: session.expires
      } : null
    });
    
    if (!session) {
      console.error('ADMIN CHECK - No session found');
      return null
    }

    // Verificação de permissão de admin com log detalhado
    if (session.user.role !== 'ADMIN') {
      console.error('ADMIN CHECK - User is not an admin', {
        currentRole: session.user.role,
        requiredRole: 'ADMIN'
      });
      return null
    }

    return session;
  } catch (error) {
    console.error('ADMIN CHECK - Error:', error);
    return null;
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  console.log('DEBUG PUT: Iniciando atualização de usuário', {
    params,
    method: req.method
  });

  try {
    // Verificar permissão de admin
    const session = await checkAdminPermission()
    if (!session) {
      console.error('DEBUG PUT: Sem permissão de admin');
      return NextResponse.json({ 
        message: 'Não autorizado',
        success: false,
        error: 'Acesso restrito a administradores',
        data: null
      }, { status: 403 })
    }

    // Obter dados da requisição
    const body = await req.json();
    console.log('DEBUG PUT: Corpo da requisição', {
      body,
      userId: params.id
    });

    // Validar campos obrigatórios
    const { id, name, email, role, password } = body;
    const requiredFields = ['name', 'email', 'role'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      console.error('DEBUG PUT: Campos obrigatórios ausentes', {
        missingFields,
        receivedBody: body
      });
      return NextResponse.json({ 
        message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
        success: false,
        error: 'Campos obrigatórios não preenchidos',
        data: null
      }, { status: 400 })
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      console.error('DEBUG PUT: Usuário não encontrado', {
        userId: params.id
      });
      return NextResponse.json({ 
        message: 'Usuário não encontrado',
        success: false,
        error: 'Usuário não existe no banco de dados',
        data: null
      }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      role
    };

    // Adicionar hash de senha se fornecida
    if (password) {
      try {
        updateData.password = await hash(password, 10);
        console.log('DEBUG PUT: Senha hasheada com sucesso');
      } catch (hashError) {
        console.error('DEBUG PUT: Erro ao hashear senha', hashError);
        return NextResponse.json({ 
          message: 'Erro ao processar senha',
          success: false,
          error: 'Não foi possível processar a nova senha',
          data: null
        }, { status: 500 })
      }
    }

    // Realizar atualização
    try {
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      console.log('DEBUG PUT: Usuário atualizado com sucesso', {
        userId: updatedUser.id,
        updatedFields: Object.keys(updateData)
      });

      return NextResponse.json({
        data: updatedUser,
        message: 'Usuário atualizado com sucesso',
        success: true
      })
    } catch (updateError) {
      console.error('DEBUG PUT: Erro ao atualizar usuário no banco de dados', updateError);
      return NextResponse.json({ 
        message: 'Erro ao atualizar usuário no banco de dados',
        success: false,
        error: updateError instanceof Error ? updateError.message : 'Erro desconhecido',
        data: null
      }, { status: 500 })
    }
  } catch (error) {
    console.error('DEBUG PUT: Erro inesperado', error)
    
    const errorResponse = {
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false,
      data: null
    }

    console.error('DEBUG PUT: Resposta de erro', errorResponse)

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Função para excluir usuário
export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permissão de admin
    const session = await checkAdminPermission()
    if (!session) {
      return NextResponse.json({ 
        message: 'Não autorizado',
        success: false,
        error: 'Acesso restrito a administradores',
        data: null
      }, { status: 403 })
    }

    const { id } = params

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ 
        message: 'Usuário não encontrado',
        success: false,
        error: 'Usuário não existe no banco de dados',
        data: null
      }, { status: 404 })
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Usuário excluído com sucesso',
      success: true,
      data: null
    })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    
    const errorResponse = {
      message: 'Erro interno do servidor', 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false,
      data: null
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
