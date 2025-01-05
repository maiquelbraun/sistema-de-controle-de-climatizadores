import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    console.log('Buscando climatizador com ID:', id)
    
    // Verificar se o ID é um número válido
    if (isNaN(Number(id))) {
      console.error('ID inválido:', id)
      return NextResponse.json({ 
        message: 'ID de climatizador inválido' 
      }, { status: 400 })
    }

    const climatizador = await prisma.climatizador.findUnique({
      where: { 
        id: Number(id)
      },
      include: { manutencoes: true }
    })

    if (!climatizador) {
      console.error('Climatizador não encontrado')
      return NextResponse.json({ 
        message: 'Climatizador não encontrado' 
      }, { status: 404 })
    }

    console.log('Climatizador encontrado:', climatizador)

    return NextResponse.json(climatizador, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar climatizador:', error)
    
    return NextResponse.json({
      message: 'Erro ao buscar climatizador',
      error: {
        code: error.name,
        message: error.message,
        details: error.stack
      }
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    console.log('Atualizando climatizador com ID:', id)
    
    // Verificar se o ID é um número válido
    if (isNaN(Number(id))) {
      console.error('ID inválido:', id)
      return NextResponse.json({ 
        message: 'ID de climatizador inválido' 
      }, { status: 400 })
    }

    const data = await request.json()
    console.log('Dados recebidos para atualização:', data)

    const climatizador = await prisma.climatizador.update({
      where: { id: Number(id) },
      data: {
        modelo: data.modelo,
        marca: data.marca,
        localizacao: data.localizacao,
        dataInstalacao: data.dataInstalacao ? new Date(data.dataInstalacao) : undefined,
        status: data.status || 'Ativo',
        numeroSerie: data.numeroSerie || null
      }
    })

    console.log('Climatizador atualizado:', climatizador)

    return NextResponse.json(climatizador, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar climatizador:', error)
    
    return NextResponse.json({
      message: 'Erro ao atualizar climatizador',
      error: {
        code: error.name,
        message: error.message,
        details: error.stack
      }
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    console.log('Deletando climatizador com ID:', id)
    
    // Verificar se o ID é um número válido
    if (isNaN(Number(id))) {
      console.error('ID inválido:', id)
      return NextResponse.json({ 
        message: 'ID de climatizador inválido' 
      }, { status: 400 })
    }

    await prisma.climatizador.delete({
      where: { id: Number(id) }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Erro ao deletar climatizador:', error)
    
    return NextResponse.json({
      message: 'Erro ao deletar climatizador',
      error: {
        code: error.name,
        message: error.message,
        details: error.stack
      }
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
