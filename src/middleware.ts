import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const path = request.nextUrl.pathname

  // Rotas públicas
  const publicPaths = [
    '/auth/login', 
    '/auth/cadastro', 
    '/auth/error', 
    '/api/auth/session'
  ]

  // Verificar se a rota é pública
  const isPublicPath = publicPaths.some(p => path.startsWith(p))

  // Rotas de API
  const isApiPath = path.startsWith('/api')

  // Rotas de admin
  const adminPaths = [
    '/usuarios', 
    '/admin', 
    '/api/usuarios'
  ]

  // Verificar se é uma rota de admin
  const isAdminPath = adminPaths.some(p => path.startsWith(p))

  // Sem token em rotas protegidas
  if (!token && !isPublicPath && !isApiPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Verificar permissão de admin
  if (isAdminPath && (!token || token.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/:path*'
  ]
}
