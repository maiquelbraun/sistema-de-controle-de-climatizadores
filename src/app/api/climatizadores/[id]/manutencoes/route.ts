import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const manutencoes = await prisma.manutencao.findMany({
      where: { climatizador_id: parseInt(params.id) },
      orderBy: { data_manutencao: 'desc' }
    })
    return NextResponse.json(manutencoes)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching manutencoes' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const manutencao = await prisma.manutencao.create({
      data: {
        climatizador_id: parseInt(params.id),
        data_manutencao: new Date(data.data_manutencao),
        tipo: data.tipo,
        descricao: data.descricao,
        tecnico: data.tecnico,
        custo: parseFloat(data.custo)
      }
    })

    // Update climatizador's ultima_manutencao
    await prisma.climatizador.update({
      where: { id: parseInt(params.id) },
      data: { ultimaManutencao: new Date(data.data_manutencao) }
    })

    return NextResponse.json(manutencao, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating manutencao' }, { status: 500 })
  }
}
