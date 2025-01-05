import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { Climatizador, ApiResponse, DashboardStats } from '@/types'
import { addMonths, parseISO, isAfter, subMonths, isValid } from 'date-fns'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

// Função de validação personalizada
function validateClimatizador(data: any) {
  console.log('Iniciando validação de dados:', JSON.stringify(data, null, 2))
  
  const errors: string[] = []

  // Log dos dados recebidos
  console.log('Dados para validação:', data)

  // Validações obrigatórias
  const requiredFields = ['modelo', 'marca', 'localizacao']
  requiredFields.forEach(field => {
    console.log(`Verificando campo obrigatório: ${field}`)
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      console.error(`Campo obrigatório ausente ou vazio: ${field}`)
      errors.push(`O campo ${field} é obrigatório`)
    }
  })

  // Validação de status
  const validStatus = ['Ativo', 'Inativo', 'Manutenção']
  if (data.status && !validStatus.includes(data.status)) {
    console.error('Status inválido:', data.status)
    errors.push(`Status inválido. Deve ser um de: ${validStatus.join(', ')}`)
  }

  // Validação de data (opcional)
  if (data.dataInstalacao) {
    try {
      const dataInstalacao = new Date(data.dataInstalacao)
      console.log('Data de instalação:', dataInstalacao)
      if (!isValid(dataInstalacao)) {
        console.error('Data de instalação inválida:', data.dataInstalacao)
        errors.push('Data de instalação inválida')
      }
    } catch (error) {
      console.error('Erro ao validar data de instalação:', error)
      errors.push('Formato de data de instalação inválido')
    }
  }

  // Validação de número de série (opcional)
  if (data.numeroSerie && data.numeroSerie.length > 50) {
    console.error('Número de série muito longo:', data.numeroSerie)
    errors.push('Número de série muito longo (máximo 50 caracteres)')
  }

  console.log('Erros de validação:', errors)
  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function GET(request: NextRequest) {
  console.log('Iniciando verificação de sessão')
  const session = await getServerSession(authOptions)

  console.log('Sessão:', session)

  if (!session) {
    console.error('Sessão não encontrada')
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  console.trace('Iniciando rota GET de climatizadores')
  try {
    console.log('Recebendo requisição GET:', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    })

    // Verificar se é uma requisição de estatísticas
    const { searchParams } = new URL(request.url)
    const isStatsRequest = searchParams.get('stats') === 'true'

    if (isStatsRequest) {
      // Buscar estatísticas
      const total = await prisma.climatizador.count()
      const ativos = await prisma.climatizador.count({
        where: { status: 'Ativo' }
      })
      const manutencaoNecessaria = await prisma.climatizador.count({
        where: { 
          status: 'Manutenção',
          proximaManutencao: { lte: new Date() }
        }
      })
      const manutencaoEmDia = await prisma.climatizador.count({
        where: { 
          status: 'Manutenção',
          proximaManutencao: { gt: new Date() }
        }
      })

      return NextResponse.json({
        total,
        ativos,
        manutencaoNecessaria,
        manutencaoEmDia
      })
    }

    // Buscar todos os climatizadores
    const climatizadores = await prisma.climatizador.findMany({
      select: {
        id: true,
        modelo: true,
        marca: true,
        localizacao: true,
        dataInstalacao: true,
        status: true
      },
      orderBy: {
        id: 'desc'
      }
    })

    console.log('Climatizadores encontrados:', climatizadores)

    return NextResponse.json({
      data: climatizadores,
      total: climatizadores.length
    })
  } catch (error) {
    console.error('Erro na rota GET de climatizadores:', error)
    return NextResponse.json({ error: 'Erro ao buscar climatizadores', details: error.message }, { status: 500 })
  }
}

export async function buscarClimatizadores(request: NextRequest) {
  try {
    const climatizadores = await prisma.climatizador.findMany({
      select: {
        id: true,
        modelo: true,
        marca: true,
        status: true
      }
    })

    return NextResponse.json(climatizadores)
  } catch (error) {
    console.error('Erro ao buscar climatizadores:', error)
    return NextResponse.json({ error: 'Erro ao buscar climatizadores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('Iniciando rota POST de climatizadores')
  try {
    // Log raw request details
    console.log('Raw Request Details:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    })

    // Attempt to clone the request body to prevent consumption issues
    const requestClone = request.clone()
    
    let data: any
    try {
      data = await requestClone.json()
      console.log('Dados recebidos (RAW):', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError)
      return NextResponse.json(
        { 
          message: 'Erro ao processar dados da requisição', 
          error: {
            code: parseError.name,
            message: parseError.message,
            details: parseError.stack
          }
        }, 
        { status: 400 }
      )
    }

    // Validação personalizada
    const validation = validateClimatizador(data)
    console.log('Resultado da validação:', validation)
    
    if (!validation.isValid) {
      console.error('Erro de validação:', validation.errors)
      return NextResponse.json(
        { 
          message: 'Erro de validação', 
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: validation.errors.join(', ')
          }
        }, 
        { status: 400 }
      )
    }

    // Preparar dados para criação
    const createData: any = {
      modelo: data.modelo,
      marca: data.marca,
      localizacao: data.localizacao,
      status: data.status || 'Ativo'
    }

    // Adicionar campos opcionais
    if (data.dataInstalacao) {
      try {
        createData.dataInstalacao = new Date(data.dataInstalacao)
      } catch (dateError) {
        console.error('Erro ao converter data de instalação:', dateError)
        return NextResponse.json(
          { 
            message: 'Erro ao processar data de instalação', 
            error: {
              code: dateError.name,
              message: dateError.message,
              details: dateError.stack
            }
          }, 
          { status: 400 }
        )
      }
    }

    if (data.numeroSerie) {
      createData.numeroSerie = data.numeroSerie
    }

    if (data.ultimaManutencao) {
      try {
        createData.ultimaManutencao = new Date(data.ultimaManutencao)
      } catch (dateError) {
        console.error('Erro ao converter última manutenção:', dateError)
        return NextResponse.json(
          { 
            message: 'Erro ao processar data de última manutenção', 
            error: {
              code: dateError.name,
              message: dateError.message,
              details: dateError.stack
            }
          }, 
          { status: 400 }
        )
      }
    }

    if (data.proximaManutencao) {
      try {
        createData.proximaManutencao = new Date(data.proximaManutencao)
      } catch (dateError) {
        console.error('Erro ao converter próxima manutenção:', dateError)
        return NextResponse.json(
          { 
            message: 'Erro ao processar data de próxima manutenção', 
            error: {
              code: dateError.name,
              message: dateError.message,
              details: dateError.stack
            }
          }, 
          { status: 400 }
        )
      }
    }

    console.log('Dados para criação:', JSON.stringify(createData, null, 2))

    try {
      const climatizador = await prisma.climatizador.create({
        data: createData
      })

      console.log('Climatizador criado:', climatizador)

      const climatizadorMapped: Climatizador = {
        id: climatizador.id,
        modelo: climatizador.modelo,
        marca: climatizador.marca,
        localizacao: climatizador.localizacao,
        numeroSerie: climatizador.numeroSerie,
        dataInstalacao: climatizador.dataInstalacao,
        ultimaManutencao: climatizador.ultimaManutencao,
        proximaManutencao: climatizador.proximaManutencao,
        status: climatizador.status as 'Ativo' | 'Inativo' | 'Manutenção',
        createdAt: climatizador.createdAt,
        updatedAt: climatizador.updatedAt
      }

      return NextResponse.json(
        { 
          data: climatizadorMapped, 
          message: 'Climatizador criado com sucesso' 
        }, 
        { status: 201 }
      )
    } catch (prismaError: any) {
      console.error('Erro do Prisma:', prismaError)
      console.error('Nome do erro:', prismaError.name)
      console.error('Código do erro:', prismaError.code)
      console.error('Mensagem do erro:', prismaError.message)
      console.error('Detalhes do erro:', prismaError.meta)

      let errorMessage = 'Erro ao criar climatizador no banco de dados'
      let statusCode = 500

      if (prismaError.code === 'P2002') {
        errorMessage = 'Já existe um climatizador com este número de série'
        statusCode = 409 // Conflict
      } else if (prismaError.code === 'P2003') {
        errorMessage = 'Dados inválidos ou relacionamento não encontrado'
        statusCode = 400 // Bad Request
      }

      return NextResponse.json(
        { 
          data: null,
          message: errorMessage, 
          error: {
            code: prismaError.code,
            message: prismaError.message,
            details: prismaError.meta ? JSON.stringify(prismaError.meta) : null
          }
        }, 
        { status: statusCode }
      )
    }
  } catch (globalError: any) {
    console.error('Erro global:', globalError)
    console.error('Nome do erro:', globalError.name)
    console.error('Mensagem do erro:', globalError.message)
    console.error('Stack do erro:', globalError.stack)

    return NextResponse.json(
      { 
        data: null,
        message: 'Erro interno do servidor', 
        error: {
          code: globalError.name,
          message: globalError.message,
          details: globalError.stack
        }
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validação personalizada
    const validation = validateClimatizador(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          message: 'Erro de validação', 
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: validation.errors.join(', ')
          }
        }, 
        { status: 400 }
      )
    }

    // Verificar se o climatizador existe
    const existingClimatizador = await prisma.climatizador.findUnique({
      where: { id: data.id }
    })

    if (!existingClimatizador) {
      return NextResponse.json(
        { 
          data: null,
          message: 'Climatizador não encontrado', 
          error: {
            code: 'NOT_FOUND',
            message: 'Climatizador não encontrado',
            details: null
          }
        }, 
        { status: 404 }
      )
    }

    const dataInstalacao = data.dataInstalacao ? new Date(data.dataInstalacao) : null

    try {
      const updatedClimatizador = await prisma.climatizador.update({
        where: { id: data.id },
        data: {
          modelo: data.modelo,
          marca: data.marca,
          localizacao: data.localizacao,
          numeroSerie: data.numeroSerie,
          dataInstalacao: dataInstalacao,
          ultimaManutencao: data.ultimaManutencao ? new Date(data.ultimaManutencao) : null,
          proximaManutencao: data.proximaManutencao ? new Date(data.proximaManutencao) : null,
          status: data.status || 'Ativo'
        }
      })

      const climatizadorMapped: Climatizador = {
        id: updatedClimatizador.id,
        modelo: updatedClimatizador.modelo,
        marca: updatedClimatizador.marca,
        localizacao: updatedClimatizador.localizacao,
        numeroSerie: updatedClimatizador.numeroSerie,
        dataInstalacao: updatedClimatizador.dataInstalacao,
        ultimaManutencao: updatedClimatizador.ultimaManutencao,
        proximaManutencao: updatedClimatizador.proximaManutencao,
        status: updatedClimatizador.status as 'Ativo' | 'Inativo' | 'Manutenção',
        createdAt: updatedClimatizador.createdAt,
        updatedAt: updatedClimatizador.updatedAt
      }

      return NextResponse.json(
        { 
          data: climatizadorMapped, 
          message: 'Climatizador atualizado com sucesso' 
        }
      )
    } catch (prismaError: any) {
      console.error('Erro do Prisma:', prismaError)
      console.error('Nome do erro do Prisma:', prismaError.name)
      console.error('Código do erro do Prisma:', prismaError.code)
      console.error('Mensagem do erro do Prisma:', prismaError.message)
      console.error('Detalhes do erro do Prisma:', prismaError.meta)

      let errorMessage = 'Erro ao atualizar climatizador no banco de dados'
      let statusCode = 500

      if (prismaError.code === 'P2002') {
        errorMessage = 'Já existe um climatizador com este número de série'
        statusCode = 409 // Conflict
      } else if (prismaError.code === 'P2003') {
        errorMessage = 'Dados inválidos ou relacionamento não encontrado'
        statusCode = 400 // Bad Request
      }

      return NextResponse.json(
        { 
          data: null,
          message: errorMessage, 
          error: {
            code: prismaError.code,
            message: prismaError.message,
            details: prismaError.meta ? JSON.stringify(prismaError.meta) : null
          }
        }, 
        { status: statusCode }
      )
    }
  } catch (error: any) {
    console.error('Erro ao atualizar climatizador:', error)
    console.error('Nome do erro:', error.name)
    console.error('Mensagem do erro:', error.message)
    console.error('Stack do erro:', error.stack)
    return NextResponse.json(
      { 
        data: null,
        message: 'Erro ao atualizar climatizador', 
        error: {
          code: error.name,
          message: error.message,
          details: error.stack
        }
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          data: null,
          message: 'ID do climatizador é obrigatório', 
          error: {
            code: 'MISSING_ID',
            message: 'ID do climatizador é obrigatório',
            details: null
          }
        }, 
        { status: 400 }
      )
    }

    const existingClimatizador = await prisma.climatizador.findUnique({
      where: { id: Number(id) }
    })

    if (!existingClimatizador) {
      return NextResponse.json(
        { 
          data: null,
          message: 'Climatizador não encontrado', 
          error: {
            code: 'NOT_FOUND',
            message: 'Climatizador não encontrado',
            details: null
          }
        }, 
        { status: 404 }
      )
    }

    try {
      await prisma.climatizador.delete({
        where: { id: Number(id) }
      })

      return NextResponse.json(
        { 
          data: null,
          message: 'Climatizador excluído com sucesso' 
        }
      )
    } catch (prismaError: any) {
      console.error('Erro do Prisma:', prismaError)
      console.error('Nome do erro do Prisma:', prismaError.name)
      console.error('Código do erro do Prisma:', prismaError.code)
      console.error('Mensagem do erro do Prisma:', prismaError.message)
      console.error('Detalhes do erro do Prisma:', prismaError.meta)

      let errorMessage = 'Erro ao excluir climatizador no banco de dados'
      let statusCode = 500

      if (prismaError.code === 'P2002') {
        errorMessage = 'Já existe um climatizador com este número de série'
        statusCode = 409 // Conflict
      } else if (prismaError.code === 'P2003') {
        errorMessage = 'Dados inválidos ou relacionamento não encontrado'
        statusCode = 400 // Bad Request
      }

      return NextResponse.json(
        { 
          data: null,
          message: errorMessage, 
          error: {
            code: prismaError.code,
            message: prismaError.message,
            details: prismaError.meta ? JSON.stringify(prismaError.meta) : null
          }
        }, 
        { status: statusCode }
      )
    }
  } catch (error: any) {
    console.error('Erro ao excluir climatizador:', error)
    console.error('Nome do erro:', error.name)
    console.error('Mensagem do erro:', error.message)
    console.error('Stack do erro:', error.stack)
    return NextResponse.json(
      { 
        data: null,
        message: 'Erro ao excluir climatizador', 
        error: {
          code: error.name,
          message: error.message,
          details: error.stack
        }
      }, 
      { status: 500 }
    )
  }
}
