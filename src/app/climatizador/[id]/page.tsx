import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Chip, 
  Divider, 
  Card, 
  CardContent, 
  Avatar,
  Stack,
  Tooltip
} from '@mui/material'
import { 
  format 
} from 'date-fns'
import Link from 'next/link'
import { Button } from '@mui/material'
import prisma from '@/lib/prisma'
import { 
  DeviceThermostat as TemperatureIcon, 
  LocationOn as LocationIcon, 
  Build as MaintenanceIcon,
  Settings as ModelIcon,
  Label as SerialIcon,
  DateRange as DateIcon
} from '@mui/icons-material'

async function getClimatizador(id: number) {
  try {
    const climatizador = await prisma.climatizador.findUnique({
      where: { id },
      include: { manutencoes: true }
    })
    return climatizador
  } catch (error) {
    console.error('Erro ao buscar climatizador:', error)
    return null
  }
}

export default async function VisualizarClimatizador({ params }: { params: { id: string } }) {
  const climatizador = await getClimatizador(Number(params.id))

  if (!climatizador) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" color="error">
          Climatizador não encontrado
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Paper 
        elevation={6} 
        sx={{ 
          width: '100%', 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 3, 
          backgroundColor: 'primary.main', 
          color: 'white' 
        }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              mr: 2, 
              backgroundColor: 'white', 
              color: 'primary.main' 
            }}
          >
            <TemperatureIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Detalhes do Climatizador
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ p: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <ModelIcon color="primary" />
                  <Typography variant="subtitle1" color="textSecondary">
                    Modelo e Marca
                  </Typography>
                </Stack>
                <Typography variant="h6">
                  {climatizador.modelo} - {climatizador.marca}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <LocationIcon color="primary" />
                  <Typography variant="subtitle1" color="textSecondary">
                    Localização
                  </Typography>
                </Stack>
                <Typography variant="h6">
                  {climatizador.localizacao || 'Não especificada'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <DateIcon color="primary" />
                  <Typography variant="subtitle1" color="textSecondary">
                    Data de Instalação
                  </Typography>
                </Stack>
                <Typography variant="h6">
                  {climatizador.dataInstalacao 
                    ? format(new Date(climatizador.dataInstalacao), 'dd/MM/yyyy') 
                    : 'Não informada'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <SerialIcon color="primary" />
                  <Typography variant="subtitle1" color="textSecondary">
                    Número de Série
                  </Typography>
                </Stack>
                <Typography variant="h6">
                  {climatizador.numeroSerie || 'Não informado'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <MaintenanceIcon color="primary" />
                  <Typography variant="subtitle1" color="textSecondary">
                    Status
                  </Typography>
                </Stack>
                <Tooltip title="Status atual do climatizador">
                  <Chip 
                    label={climatizador.status} 
                    color={
                      climatizador.status === 'Ativo' ? 'success' : 
                      climatizador.status === 'Inativo' ? 'error' : 
                      'warning'
                    }
                    sx={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 600, 
                      borderRadius: 2 
                    }}
                  />
                </Tooltip>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          p: 2 
        }}>
          <Link href="/climatizador" passHref>
            <Button 
              variant="outlined" 
              color="primary"
            >
              Voltar para Lista
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  )
}
