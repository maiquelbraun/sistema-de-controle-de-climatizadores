const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createOrUpdateAdminUser() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash('Sup3rs3gur@', 10)

    // Criar ou atualizar usuário admin
    const user = await prisma.user.upsert({
      where: { email: 'maiquel.braun@gmail.com' },
      update: {
        name: 'Maiquel Braun',
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        name: 'Maiquel Braun',
        email: 'maiquel.braun@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Usuário admin criado/atualizado com sucesso:', user)
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createOrUpdateAdminUser()
