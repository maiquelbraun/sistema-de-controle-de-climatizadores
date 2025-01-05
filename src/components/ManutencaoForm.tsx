'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  TextField, 
  Typography, 
  MenuItem, 
  Select, 
  InputLabel,
  FormControl,
  Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

// Serviços
import { 
  getClimatizadores, 
  createManutencao, 
  updateManutencao, 
  getManutencaoById 
} from '@/services/api'

console.log('ManutencaoForm: Módulo carregado')

export default function ManutencaoForm({ 
  id
}: { 
  id?: string
}) {
  console.log('ManutencaoForm: Componente iniciado', { id })

  const router = useRouter()

  // Estados do formulário
  const [formData, setFormData] = useState({
    climatizadorId: undefined,
    dataManutencao: null,
    tipo: 'preventiva',
    descricao: '',
    tecnico: '',
    custo: 0
  })

  // Estados de controle
  const [climatizadores, setClimatizadores] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Efeito para carregar dados iniciais
  useEffect(() => {
    console.log('ManutencaoForm: Efeito inicial executado')
    
    const fetchData = async () => {
      try {
        console.log('ManutencaoForm: Buscando climatizadores')
        const climatizadoresList = await getClimatizadores()
        console.log('ManutencaoForm: Climatizadores recebidos', climatizadoresList)
        
        setClimatizadores(climatizadoresList)

        // Se não tiver climatizador selecionado, usar o primeiro da lista
        if (!formData.climatizadorId && climatizadoresList.length > 0) {
          setFormData(prev => ({
            ...prev,
            climatizadorId: climatizadoresList[0].id
          }))
        }

        if (id) {
          console.log('ManutencaoForm: Buscando detalhes da manutenção', id)
          const manutencao = await getManutencaoById(Number(id))
          console.log('ManutencaoForm: Manutenção recebida', manutencao)
          
          setFormData(prev => ({
            ...prev,
            climatizadorId: manutencao.climatizadorId,
            dataManutencao: manutencao.dataManutencao ? new Date(manutencao.dataManutencao) : null,
            tipo: manutencao.tipo,
            descricao: manutencao.descricao,
            tecnico: manutencao.tecnico,
            custo: manutencao.custo
          }))
        }
      } catch (err) {
        console.error('ManutencaoForm: Erro ao carregar dados', err)
        setError(err.message)
      }
    }

    fetchData()
  }, [id])

  // Manipuladores de mudança
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'custo' ? Number(value) : value
    }))
  }

  // Manipulador de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        climatizadorId: formData.climatizadorId,
        dataManutencao: formData.dataManutencao?.toISOString(),
        tipo: formData.tipo,
        descricao: formData.descricao,
        tecnico: formData.tecnico,
        custo: formData.custo
      }

      console.log('ManutencaoForm: Payload para submissão', payload)

      if (id) {
        await updateManutencao(Number(id), payload)
      } else {
        await createManutencao(payload)
      }

      router.push('/manutencao/')
    } catch (err) {
      console.error('ManutencaoForm: Erro ao salvar', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  console.log('ManutencaoForm: Renderizando', { formData, climatizadores })

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDateFns} 
      adapterLocale={ptBR}
    >
      <Container maxWidth="md" sx={{ 
        py: 4, 
        backgroundColor: 'background.default', 
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
            mb: 3 
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                textAlign: 'center', 
                fontWeight: 600, 
                color: 'primary.main',
                mb: 2 
              }}
            >
              {id ? 'Editar Manutenção' : 'Nova Manutenção'}
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 2,
                  borderRadius: 1 
                }}
              >
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Climatizador */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Climatizador</InputLabel>
                  <Select
                    name="climatizadorId"
                    value={formData.climatizadorId || (climatizadores.length > 0 ? climatizadores[0].id : '')}
                    label="Climatizador"
                    onChange={handleChange}
                    required
                  >
                    {climatizadores.map((climatizador) => (
                      <MenuItem 
                        key={climatizador.id} 
                        value={climatizador.id}
                      >
                        {climatizador.modelo} - {climatizador.localizacao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tipo de Manutenção */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Manutenção</InputLabel>
                  <Select
                    name="tipo"
                    value={formData.tipo || 'preventiva'}
                    label="Tipo de Manutenção"
                    onChange={handleChange}
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <MenuItem 
                      value="preventiva"
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      Preventiva
                    </MenuItem>
                    <MenuItem 
                      value="corretiva"
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      Corretiva
                    </MenuItem>
                    <MenuItem 
                      value="preditiva"
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      Preditiva
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Data da Manutenção */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data da Manutenção"
                  value={formData.dataManutencao}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, dataManutencao: newValue }))}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      variant: 'outlined',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main'
                          }
                        }
                      }
                    } 
                  }}
                />
              </Grid>

              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  name="descricao"
                  label="Descrição da Manutenção"
                  value={formData.descricao}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </Grid>

              {/* Técnico e Custo */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="tecnico"
                  label="Técnico Responsável"
                  value={formData.tecnico}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="custo"
                  label="Custo da Manutenção"
                  type="number"
                  value={formData.custo}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 8 }}>R$</span>
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Botões de Ação */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              mt: 3 
            }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {isLoading ? 'Salvando...' : (id ? 'Atualizar' : 'Salvar')}
              </Button>
              <Button 
                type="button"
                variant="outlined" 
                color="secondary"
                onClick={() => router.push('/manutencao/')}
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </form>
      </Container>
    </LocalizationProvider>
  )
}
