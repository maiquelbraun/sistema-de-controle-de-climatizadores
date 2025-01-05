import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash('Sup3rs3gur@', 10)

    // Criar usuário admin
    const user = await prisma.user.create({
      data: {
        name: 'Maiquel Braun',
        email: 'maiquel.braun@gmail.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Usuário admin criado com sucesso:', user)
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
