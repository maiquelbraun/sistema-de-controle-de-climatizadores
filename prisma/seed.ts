import { PrismaClient } from '@prisma/client'
import { addMonths, subMonths } from 'date-fns'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()

  // Criar usuário admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@climatizadores.com',
      password: await bcrypt.hash('AdminSenha123!', 10),
      role: 'ADMIN'
    }
  })

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

  console.log('Usuário admin criado:', adminUser)
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
