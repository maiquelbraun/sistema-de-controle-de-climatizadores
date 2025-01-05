import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const climatizador = await prisma.climatizador.create({
      data: {
        modelo: 'Split Inverter 12000 BTUs',
        marca: 'Samsung',
        localizacao: 'Escritório Principal',
        dataInstalacao: new Date('2023-12-15'),
        numeroSerie: 'SAM12345',
        status: 'Ativo',
        ultimaManutencao: null,
        proximaManutencao: new Date('2024-06-15')
      }
    })

    console.log('Climatizador cadastrado com sucesso:', climatizador)
  } catch (error) {
    console.error('Erro ao cadastrar climatizador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
