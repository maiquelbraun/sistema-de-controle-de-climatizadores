const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const { addMonths, subMonths } = require('date-fns')

const prisma = new PrismaClient()

async function main() {
  const now = new Date()

  // Deletar usuário existente se houver
  await prisma.user.deleteMany({
    where: {
      email: 'maiquel.braun@gmail.com'
    }
  })

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('Sup3rs3gur@', 10)
  
  const user = await prisma.user.create({
    data: {
      name: 'Maiquel Braun',
      email: 'maiquel.braun@gmail.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Usuário de teste criado:', user)

  // Criar alguns climatizadores de exemplo
  const climatizador1 = await prisma.climatizador.create({
    data: {
      modelo: 'Split Inverter',
      marca: 'LG',
      localizacao: 'Escritório Principal',
      dataInstalacao: subMonths(now, 6),
      ultimaManutencao: subMonths(now, 3),
      proximaManutencao: addMonths(now, 3),
      status: 'Ativo',
      numeroSerie: 'NS123456',
      manutencoes: {
        create: [
          {
            dataManutencao: subMonths(now, 3),
            tipo: 'Preventiva',
            descricao: 'Limpeza e verificação de componentes',
            tecnico: 'João Silva',
            custo: 250.00
          }
        ]
      }
    }
  })

  const climatizador2 = await prisma.climatizador.create({
    data: {
      modelo: 'Janela',
      marca: 'Consul',
      localizacao: 'Sala de Reuniões',
      dataInstalacao: subMonths(now, 12),
      ultimaManutencao: subMonths(now, 6),
      proximaManutencao: addMonths(now, 6),
      status: 'Ativo',
      numeroSerie: 'NS789012',
      manutencoes: {
        create: [
          {
            dataManutencao: subMonths(now, 6),
            tipo: 'Corretiva',
            descricao: 'Substituição de filtro e reparo de vazamento',
            tecnico: 'Maria Souza',
            custo: 350.00
          }
        ]
      }
    }
  })

  console.log('Climatizadores criados:', { climatizador1, climatizador2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
