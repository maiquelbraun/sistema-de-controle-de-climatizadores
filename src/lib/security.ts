import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function checkLoginAttempts(email: string, ipAddress: string) {
  try {
    // Configurações de segurança padrão
    let securitySettings = await prisma.securitySettings.findFirst() || 
      await prisma.securitySettings.create({ 
        data: {
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          passwordMinLength: 8,
          requireSpecialChar: true,
          requireUppercase: true,
          requireNumber: true,
          enableTwoFactorAuth: false
        } 
      })

    // Buscar tentativas de login recentes
    const loginAttempts = await prisma.loginAttempt.findMany({
      where: {
        email,
        ipAddress,
        timestamp: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // 15 minutos atrás
        }
      }
    })

    const failedAttempts = loginAttempts.filter(attempt => !attempt.success)

    return {
      isBlocked: failedAttempts.length >= securitySettings.maxLoginAttempts,
      attempts: failedAttempts.length,
      maxAttempts: securitySettings.maxLoginAttempts
    }
  } catch (error) {
    console.error('Erro ao verificar tentativas de login:', error)
    return {
      isBlocked: false,
      attempts: 0,
      maxAttempts: 5
    }
  }
}

export async function recordLoginAttempt(
  email: string, 
  success: boolean,
  ipAddress: string
) {
  try {
    await prisma.loginAttempt.create({
      data: {
        email,
        success,
        ipAddress,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Erro ao registrar tentativa de login:', error)
  }
}
