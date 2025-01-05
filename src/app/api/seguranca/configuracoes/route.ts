import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateSecuritySettings, getSecuritySettings } from '@/lib/security'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Verificar sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' }, 
        { status: 403 }
      )
    }

    // Verificar permissão de acesso
    const allowedRoles = ['ADMIN', 'MANAGER']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    // Buscar configurações de segurança
    const settings = await getSecuritySettings()

    return NextResponse.json({
      maxLoginAttempts: settings.maxLoginAttempts,
      lockoutDuration: settings.lockoutDuration,
      passwordMinLength: settings.passwordMinLength,
      requireSpecialChar: settings.requireSpecialChar,
      requireUppercase: settings.requireUppercase,
      requireNumber: settings.requireNumber,
      enableTwoFactorAuth: settings.enableTwoFactorAuth
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de segurança:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Verificar sessão do usuário
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' }, 
        { status: 403 }
      )
    }

    // Verificar permissão de acesso
    const allowedRoles = ['ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    // Extrair dados da requisição
    const body = await req.json()

    // Validações básicas
    const settings = {
      maxLoginAttempts: body.maxLoginAttempts && 
        Number(body.maxLoginAttempts) > 0 && 
        Number(body.maxLoginAttempts) <= 10 
        ? Number(body.maxLoginAttempts) 
        : undefined,
      
      lockoutDuration: body.lockoutDuration && 
        Number(body.lockoutDuration) >= 5 && 
        Number(body.lockoutDuration) <= 60 
        ? Number(body.lockoutDuration) 
        : undefined,
      
      requireSpecialChar: typeof body.requireSpecialChar === 'boolean' 
        ? body.requireSpecialChar 
        : undefined,
      
      requireUppercase: typeof body.requireUppercase === 'boolean' 
        ? body.requireUppercase 
        : undefined,
      
      requireNumber: typeof body.requireNumber === 'boolean' 
        ? body.requireNumber 
        : undefined
    }

    // Atualizar configurações
    const updatedSettings = await updateSecuritySettings(settings)

    return NextResponse.json({
      maxLoginAttempts: updatedSettings.maxLoginAttempts,
      lockoutDuration: updatedSettings.lockoutDuration,
      requireSpecialChar: updatedSettings.requireSpecialChar,
      requireUppercase: updatedSettings.requireUppercase,
      requireNumber: updatedSettings.requireNumber
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações de segurança:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
