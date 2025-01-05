'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material'
import { 
  Air as ClimateIcon, 
  Build as MaintenanceIcon, 
  Settings as SettingsIcon,
  AddCircle as AddIcon,
  List as ListIcon
} from '@mui/icons-material'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ListaClimatizadores from '@/components/ListaClimatizadores'

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [dashboardStats, setDashboardStats] = useState({
    totalClimatizadores: 0,
    manutencoesPendentes: 0,
    climatizadoresAtivos: 0
  })

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const [climatizadoresResponse, manutencoesResponse] = await Promise.all([
          fetch('/api/climatizadores'),
          fetch('/api/manutencoes')
        ])

        const climatizadores = await climatizadoresResponse.json()
        const manutencoes = await manutencoesResponse.json()

        console.log('Tipo de manutencoes:', typeof manutencoes, Array.isArray(manutencoes), manutencoes)

        setDashboardStats({
          totalClimatizadores: climatizadores.length,
          manutencoesPendentes: manutencoes.filter((m: any) => m.status === 'Pendente').length,
          climatizadoresAtivos: climatizadores.filter((c: any) => c.status === 'Ativo').length
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      }
    }

    fetchDashboardStats()
  }, [])

  const quickActions = [
    {
      title: 'Adicionar Climatizador',
      icon: <AddIcon />,
      color: 'primary',
      onClick: () => router.push('/climatizadores/novo')
    },
    {
      title: 'Lista de Climatizadores',
      icon: <ListIcon />,
      color: 'secondary',
      onClick: () => router.push('/climatizadores')
    },
    {
      title: 'Adicionar Manutenção',
      icon: <MaintenanceIcon />,
      color: 'warning',
      onClick: () => router.push('/manutencoes/novo')
    }
  ]

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true, 
        callbackUrl: '/auth/login' 
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography variant="h4" component="h1">
          Painel de Controle
        </Typography>
        <Typography variant="subtitle1">
          Bem-vindo, {session?.user?.name || 'Usuário'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Estatísticas */}
        {[
          {
            title: 'Total de Climatizadores',
            value: dashboardStats.totalClimatizadores,
            icon: <ClimateIcon />,
            color: 'primary'
          },
          {
            title: 'Manutenções Pendentes',
            value: dashboardStats.manutencoesPendentes,
            icon: <MaintenanceIcon />,
            color: 'warning'
          },
          {
            title: 'Climatizadores Ativos',
            value: dashboardStats.climatizadoresAtivos,
            icon: <SettingsIcon />,
            color: 'success'
          }
        ].map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: `${stat.color}.light`, 
                    color: `${stat.color}.main` 
                  }}
                >
                  {stat.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Ações Rápidas */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <Typography variant="h6">
              Ações Rápidas
            </Typography>
            <Box>
              {quickActions.map((action, index) => (
                <Tooltip title={action.title} key={index}>
                  <IconButton 
                    color={action.color as any} 
                    sx={{ mr: 2 }}
                    onClick={action.onClick}
                  >
                    {action.icon}
                  </IconButton>
                </Tooltip>
              ))}
              <IconButton 
                color="warning" 
                onClick={handleLogout}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Lista de Climatizadores */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Climatizadores Cadastrados
          </Typography>
          <ListaClimatizadores />
        </Grid>
      </Grid>
    </Container>
  )
}
