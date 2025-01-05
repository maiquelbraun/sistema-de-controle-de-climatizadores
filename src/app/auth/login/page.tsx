'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Button, 
  Container, 
  IconButton, 
  InputAdornment, 
  Paper, 
  TextField, 
  Typography 
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  EmailOutlined 
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Esquema de validação
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .required('Senha é obrigatória')
})

// Tipo para os dados do formulário
interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Configuração do react-hook-form
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    setError: setFormError 
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Função de submissão do formulário
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password
      })

      if (result?.error) {
        // Tratamento de erro de autenticação
        setFormError('root', {
          type: 'manual',
          message: 'Credenciais inválidas. Verifique seu email e senha.'
        })
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // Tratamento de erro genérico
      setFormError('root', {
        type: 'manual',
        message: 'Erro ao fazer login. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle visibilidade da senha
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <Container 
      maxWidth="xs" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          padding: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%' 
        }}
      >
        <Typography 
          component="h1" 
          variant="h5" 
          sx={{ mb: 3 }}
        >
          Sistema de Climatizadores
        </Typography>

        {/* Mensagem de erro global */}
        {errors.root && (
          <Typography 
            color="error" 
            variant="body2" 
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {errors.root.message}
          </Typography>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)} 
          sx={{ width: '100%' }}
        >
          {/* Campo de Email com validação */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                autoComplete="email"
                autoFocus
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Campo de Senha com validação */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />

          {/* Botão de Login */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
