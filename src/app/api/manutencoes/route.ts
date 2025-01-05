import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Criar instância do Prisma fora do handler para reutilização
let prisma: PrismaClient

// Função para criar ou reutilizar a instância do Prisma
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error']
    })
  }
  return prisma
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const prismaClient = getPrismaClient()

    try {
      // Se tiver ID, buscar manutenção específica
      if (id) {
        const manutencao = await prismaClient.manutencao.findUnique({
          where: { id: Number(id) },
          include: {
            climatizador: true
          }
        })

        if (!manutencao) {
          return NextResponse.json({ 
            error: 'Manutenção não encontrada' 
          }, { status: 404 })
        }

        return NextResponse.json(manutencao)
      }

      // Caso contrário, buscar todas as manutenções
      const manutencoes = await prismaClient.manutencao.findMany({
        include: {
          climatizador: true
        }
      })

      return NextResponse.json(manutencoes)
    } catch (error) {
      console.error('Erro detalhado ao buscar manutenções:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error instanceof Error ? (error as any).code : null
      })

      return NextResponse.json({ 
        error: 'Erro ao buscar manutenções',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    } finally {
      await prismaClient.$disconnect()
    }
  } catch (error) {
    console.error('Erro na rota de manutenções:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GETById(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const prismaClient = getPrismaClient()

    try {
      // Verificar conexão com o banco de dados
      await prismaClient.$connect()

      const manutencao = await prismaClient.manutencao.findUnique({
        where: { id: Number(id) },
        include: {
          climatizador: true
        }
      })

      if (!manutencao) {
        return NextResponse.json({ 
          error: 'Manutenção não encontrada' 
        }, { status: 404 })
      }

      return NextResponse.json(manutencao)
    } catch (error) {
      console.error('Erro detalhado ao buscar manutenção por ID:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error instanceof Error ? (error as any).code : null
      })

      // Verificar tipos específicos de erros
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Erro de restrição única no banco de dados',
          details: error.message 
        }, { status: 500 })
      }

      if (error.code === 'P2025') {
        return NextResponse.json({ 
          error: 'Registro não encontrado no banco de dados',
          details: error.message 
        }, { status: 404 })
      }

      return NextResponse.json({ 
        error: 'Erro interno ao buscar manutenção por ID', 
        details: error.message 
      }, { status: 500 })
    } finally {
      // Desconectar o Prisma após a operação
      await prismaClient.$disconnect()
    }
  } catch (error) {
    console.error('Erro ao buscar manutenção por ID:', error)
    return NextResponse.json({ 
      error: 'Error fetching manutencao by ID',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Log para capturar o corpo da requisição
    const rawBody = await request.text()
    console.log('Corpo da requisição POST:', rawBody)

    // Parsear o JSON manualmente
    let data
    try {
      data = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError)
      return NextResponse.json({ 
        error: 'Corpo da requisição inválido',
        details: parseError instanceof Error ? parseError.message : 'Erro desconhecido'
      }, { status: 400 })
    }
    
    // Log dos dados recebidos com mais detalhes
    console.log('Dados recebidos:', JSON.stringify(data, null, 2))
    
    // Validar campos obrigatórios
    const requiredFields = ['climatizadorId', 'dataManutencao', 'tipo', 'tecnico']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      console.warn('Campos obrigatórios não preenchidos:', missingFields)
      return NextResponse.json({ 
        error: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`,
        missingFields: missingFields
      }, { status: 400 })
    }

    // Verificar tipos de dados
    if (typeof data.climatizadorId !== 'number') {
      console.warn('climatizadorId deve ser um número', typeof data.climatizadorId)
      return NextResponse.json({ 
        error: 'climatizadorId deve ser um número',
        receivedType: typeof data.climatizadorId,
        receivedValue: data.climatizadorId
      }, { status: 400 })
    }

    // Verificar existência do climatizador
    const prismaClient = getPrismaClient()

    try {
      // Verificar conexão com o banco de dados
      await prismaClient.$connect()

      const climatizador = await prismaClient.climatizador.findUnique({
        where: { id: data.climatizadorId }
      })

      if (!climatizador) {
        console.warn(`Climatizador não encontrado: ${data.climatizadorId}`)
        return NextResponse.json({ 
          error: `Climatizador com ID ${data.climatizadorId} não encontrado` 
        }, { status: 404 })
      }

      // Validar data de manutenção
      let dataManutencao
      try {
        dataManutencao = new Date(data.dataManutencao)
        if (isNaN(dataManutencao.getTime())) {
          throw new Error('Data inválida')
        }
      } catch (dateError) {
        console.warn('Data de manutenção inválida:', data.dataManutencao)
        return NextResponse.json({ 
          error: 'Data de manutenção inválida',
          receivedDate: data.dataManutencao
        }, { status: 400 })
      }

      // Start a transaction to update both maintenance and climatizador
      const result = await prismaClient.$transaction(async (prisma) => {
        // Create maintenance record
        const manutencao = await prisma.manutencao.create({
          data: {
            climatizadorId: data.climatizadorId,
            dataManutencao: dataManutencao,
            tipo: data.tipo,
            descricao: data.descricao || '',
            tecnico: data.tecnico,
            custo: data.custo || 0
          }
        })

        // Update climatizador's last maintenance date
        await prisma.climatizador.update({
          where: { id: data.climatizadorId },
          data: {
            ultimaManutencao: dataManutencao,
            status: data.status || 'Ativo'
          }
        })

        return manutencao
      })

      console.log('Manutenção criada com sucesso:', result)

      return NextResponse.json({
        data: result,
        message: 'Manutenção criada com sucesso'
      }, { status: 201 })
    } catch (error) {
      console.error('Erro detalhado na criação de manutenção:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error instanceof Error ? (error as any).code : null
      })

      // Tratamento de erros específicos do Prisma
      if (error instanceof Prisma.Prisma.PrismaClientKnownRequestError) {
        // Código de erro de restrição única
        if (error.code === 'P2002') {
          return NextResponse.json({ 
            error: 'Já existe uma manutenção com estes dados',
            details: error.message
          }, { status: 409 })
        }
      }

      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar manutenção',
        details: error instanceof Error ? error.stack : null
      }, { status: 500 })
    } finally {
      // Desconectar o Prisma após a operação
      await prismaClient.$disconnect()
    }
  } catch (error) {
    console.error('Erro detalhado na criação de manutenção:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    
    // Tratamento de erros específicos do Prisma
    if (error instanceof Prisma.Prisma.PrismaClientKnownRequestError) {
      // Código de erro de restrição única
      if (error.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Já existe uma manutenção com estes dados',
          details: error.message
        }, { status: 409 })
      }
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao criar manutenção',
      details: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Log para capturar o corpo da requisição
    const rawBody = await request.text()
    console.log('Corpo da requisição PUT:', rawBody)

    // Parsear o JSON manualmente
    let data
    try {
      data = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError)
      return NextResponse.json({ 
        error: 'Corpo da requisição inválido',
        details: parseError instanceof Error ? parseError.message : 'Erro desconhecido'
      }, { status: 400 })
    }

    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Validar campos obrigatórios
    const requiredFields = ['climatizadorId', 'dataManutencao', 'tipo', 'tecnico']
    for (const field of requiredFields) {
      if (!updateData[field]) {
        console.warn(`Campo obrigatório '${field}' não preenchido`, updateData)
        return NextResponse.json({ 
          error: `Campo obrigatório '${field}' não preenchido` 
        }, { status: 400 })
      }
    }

    const prismaClient = getPrismaClient()

    try {
      // Verificar conexão com o banco de dados
      await prismaClient.$connect()

      const result = await prismaClient.$transaction(async (prisma) => {
        // Update maintenance record
        const manutencao = await prisma.manutencao.update({
          where: { id: Number(id) },
          data: {
            ...updateData,
            dataManutencao: updateData.dataManutencao ? new Date(updateData.dataManutencao) : undefined,
            tecnico: updateData.tecnico,
          }
        })

        // If maintenance date is updated, also update climatizador's last maintenance date
        if (updateData.dataManutencao) {
          await prisma.climatizador.update({
            where: { id: manutencao.climatizadorId },
            data: {
              ultimaManutencao: new Date(updateData.dataManutencao)
            }
          })
        }

        return manutencao
      })

      return NextResponse.json({
        data: result,
        message: 'Manutenção atualizada com sucesso'
      })
    } catch (error) {
      console.error('Erro detalhado na atualização de manutenção:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error instanceof Error ? (error as any).code : null
      })

      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Erro ao atualizar manutenção',
        details: error instanceof Error ? error.stack : null
      }, { status: 500 })
    } finally {
      // Desconectar o Prisma após a operação
      await prismaClient.$disconnect()
    }
  } catch (error) {
    console.error('Erro detalhado na atualização de manutenção:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro ao atualizar manutenção',
      details: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const prismaClient = getPrismaClient()

    try {
      // Verificar conexão com o banco de dados
      await prismaClient.$connect()

      await prismaClient.manutencao.delete({
        where: { id: Number(id) }
      })

      return NextResponse.json({ message: 'Manutencao deleted successfully' })
    } catch (error) {
      console.error('Erro detalhado na exclusão de manutenção:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error instanceof Error ? (error as any).code : null
      })

      return NextResponse.json({ 
        error: 'Error deleting manutencao',
        details: error instanceof Error ? error.stack : null
      }, { status: 500 })
    } finally {
      // Desconectar o Prisma após a operação
      await prismaClient.$disconnect()
    }
  } catch (error) {
    console.error('Erro detalhado na exclusão de manutenção:', error)
    return NextResponse.json({ error: 'Error deleting manutencao' }, { status: 500 })
  }
}
