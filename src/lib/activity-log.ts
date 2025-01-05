import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LogActivityParams {
  userId: string
  action: string
  description: string
  ipAddress?: string
  userAgent?: string
}

export async function logActivity({
  userId, 
  action, 
  description, 
  ipAddress, 
  userAgent 
}: LogActivityParams) {
  try {
    await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        description,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Erro ao registrar log de atividade:', error)
  }
}

export async function getUserActivityLogs(userId: string, limit = 50) {
  return prisma.userActivityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}
