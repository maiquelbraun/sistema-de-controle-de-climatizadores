'use client'

import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  AcUnit as AcUnitIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import type { DashboardStats } from '../types'

interface DashboardCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats>({
    total: 0,
    ativos: 0,
    manutencaoNecessaria: 0,
    manutencaoEmDia: 0,
    loading: true
  })
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }))
        
        const response = await fetch('/api/climatizadores?stats=true')
        
        console.log('Resposta completa:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })

        let errorText = ''
        try {
          errorText = await response.clone().text()
        } catch {
          errorText = 'Não foi possível obter detalhes do erro'
        }

        console.log('Texto da resposta:', errorText)

        if (!response.ok) {
          console.error('Erro na resposta:', JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            errorText
          }, null, 2))
          
          setError(`Erro ${response.status}: ${response.statusText}. Detalhes: ${errorText}`)
          
          setStats(prev => ({ 
            ...prev, 
            total: 0,
            ativos: 0,
            manutencaoNecessaria: 0,
            manutencaoEmDia: 0,
            loading: false 
          }))
          return
        }

        const contentType = response.headers.get('content-type')
        console.log('Tipo de conteúdo:', contentType)

        const data = await response.json()
        console.log('Dados recebidos:', data)

        console.log('Dados recebidos (stringificado):', JSON.stringify(data, null, 2))

        // Lidar com diferentes formatos de resposta
        const statsData = data.error ? { 
          total: 0, 
          ativos: 0, 
          manutencaoNecessaria: 0, 
          manutencaoEmDia: 0 
        } : data.data || data

        console.log('Dados estatísticos:', statsData)

        setStats({
          total: statsData.total || 0,
          ativos: statsData.ativos || 0,
          manutencaoNecessaria: statsData.manutencaoNecessaria || 0,
          manutencaoEmDia: statsData.manutencaoEmDia || 0,
          loading: false
        })

        // Adicionar mensagem de erro se existir
        if (data.error) {
          setError(data.error)
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', 
          error instanceof Error 
            ? `${error.name}: ${error.message}` 
            : String(error)
        )
        
        const errorMessage = error instanceof Error 
          ? `${error.name}: ${error.message}` 
          : String(error)
        
        setError(errorMessage)
        setStats(prev => ({ 
          ...prev, 
          total: 0,
          ativos: 0,
          manutencaoNecessaria: 0,
          manutencaoEmDia: 0,
          loading: false 
        }))
      }
    }

    fetchStats()
  }, [])

  const cards: DashboardCard[] = [
    {
      title: 'Total de Climatizadores',
      value: stats.total,
      icon: <AcUnitIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main'
    },
    {
      title: 'Climatizadores Ativos',
      value: stats.ativos,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main'
    },
    {
      title: 'Manutenção Necessária',
      value: stats.manutencaoNecessaria,
      icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main'
    },
    {
      title: 'Manutenções em Dia',
      value: stats.manutencaoEmDia,
      icon: <BuildIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main'
    }
  ]

  if (stats.loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon fontSize="inherit" />}
        >
          <AlertTitle>Erro ao Carregar Estatísticas</AlertTitle>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h4" color={card.color}>
                  {card.value}
                </Typography>
              </Box>
              {card.icon}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
