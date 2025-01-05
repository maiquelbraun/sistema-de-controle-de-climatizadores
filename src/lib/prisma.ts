import { PrismaClient, Prisma } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' }
  ]
})

// Adicionar logs de eventos do Prisma
prisma.$on('query', (e: Prisma.QueryEvent) => {
  console.log('Query:', {
    query: e.query ?? '',
    params: e.params ?? '',
    duration: e.duration ?? 0
  })
})

prisma.$on('error', (e: Prisma.LogEvent) => {
  console.error('Erro no Prisma:', {
    message: e.message ?? '',
    target: e.target ?? ''
  })
})

prisma.$on('info', (e: Prisma.LogEvent) => {
  console.log('Informação do Prisma:', e.message ?? '')
})

prisma.$on('warn', (e: Prisma.LogEvent) => {
  console.warn('Aviso do Prisma:', e.message ?? '')
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma as default }
