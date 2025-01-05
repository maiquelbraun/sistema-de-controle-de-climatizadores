import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { AuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'

// Ensure a single instance of PrismaClient
const prisma: PrismaClient = new PrismaClient()

// Extend the built-in User type
declare module "next-auth" {
  interface User {
    id: string
    role: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
    }
  }
}

export const authOptions: AuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'text', 
          placeholder: 'seu@email.com' 
        },
        password: { 
          label: 'Senha', 
          type: 'password' 
        }
      },
      async authorize(credentials, req) {
        console.log('Credenciais recebidas:', JSON.stringify(credentials, null, 2))

        if (!credentials?.email || !credentials?.password) {
          console.error('Credenciais incompletas')
          return null
        }

        try {
          // Use explicit type casting
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: { 
              id: true, 
              email: true, 
              password: true,
              name: true,
              role: true
            }
          })

          if (!user) {
            console.error('Usuário não encontrado')
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password, 
            user.password
          )

          if (!isPasswordValid) {
            console.error('Senha inválida')
            return null
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          } as NextAuthUser
        } catch (error) {
          console.error('Erro durante a autenticação:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('DEBUG JWT: Token recebido', { 
        token: { 
          ...token, 
          sensitiveData: undefined 
        }, 
        user 
      });

      if (user) {
        token.id = user.id
        token.role = user.role
        
        console.log('DEBUG JWT: Token atualizado após usuário', { 
          tokenId: token.id, 
          tokenRole: token.role 
        });
      }
      return token
    },
    async session({ session, token }) {
      console.log('DEBUG Session: Token recebido', { 
        token: { 
          ...token, 
          sensitiveData: undefined 
        },
        session: {
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email
          }
        }
      });

      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        
        console.log('DEBUG Session: Sessão atualizada', { 
          userId: session.user.id, 
          userRole: session.user.role 
        });
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
}

export default NextAuth(authOptions)
