'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Container, 
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material'
import { useRouter, useParams } from 'next/navigation'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale'

interface ClimatizadorFormData {
  id?: number
  modelo: string
  marca: string
  localizacao: string
  dataInstalacao: Date | null
  numeroSerie?: string
  status: string
  ultimaManutencao?: Date | null
  proximaManutencao?: Date | null
}

interface ClimatizadorFormErrors {
  [key: string]: string
}

export default function ClimatizadorForm() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState<ClimatizadorFormData>({
    modelo: '',
    marca: '',
    localizacao: '',
    dataInstalacao: null,
    numeroSerie: '',
    status: 'Ativo',
    ultimaManutencao: null,
    proximaManutencao: null
  })
  const [formErrors, setFormErrors] = useState<ClimatizadorFormErrors>({})
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchClimatizador = useCallback(async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/climatizadores/${id}`)
      if (!response.ok) {
        throw new Error('Falha ao buscar climatizador')
      }
      const data = await response.json()
      console.log('Dados do climatizador recebidos:', data)
      
      setFormData({
        id: data.id,
        modelo: data.modelo || '',
        marca: data.marca || '',
        localizacao: data.localizacao || '',
        dataInstalacao: data.dataInstalacao ? new Date(data.dataInstalacao) : null,
        numeroSerie: data.numeroSerie || '',
        status: data.status || 'Ativo',
        ultimaManutencao: data.ultimaManutencao ? new Date(data.ultimaManutencao) : null,
        proximaManutencao: data.proximaManutencao ? new Date(data.proximaManutencao) : null
      })
    } catch (error) {
      console.error('Erro ao buscar climatizador:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (params.id) {
      setIsEditing(true)
      fetchClimatizador(Number(params.id))
    }
  }, [params.id, fetchClimatizador])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const { name, value } = e.target || e
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validação de campos obrigatórios
    const requiredFields = ['modelo', 'marca', 'localizacao']
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`
      }
    })

    // Validação de datas
    const dateFields = ['dataInstalacao', 'ultimaManutencao', 'proximaManutencao']
    dateFields.forEach(field => {
      if (formData[field]) {
        const date = new Date(formData[field])
        if (isNaN(date.getTime())) {
          newErrors[field] = 'Data inválida'
        }
      }
    })

    // Validação de número de série (opcional)
    if (formData.numeroSerie && formData.numeroSerie.length > 50) {
      newErrors['numeroSerie'] = 'Número de série muito longo (máximo 50 caracteres)'
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    console.log('Iniciando submissão do formulário')
    console.log('Dados do formulário:', JSON.stringify(formData, null, 2))
    
    if (!validateForm()) {
      console.error('Validação do formulário falhou')
      return
    }

    try {
      setLoading(true)
      const url = isEditing 
        ? `/api/climatizadores/${params.id}` 
        : '/api/climatizadores'
      const method = isEditing ? 'PUT' : 'POST'
      
      const payload: any = {
        modelo: formData.modelo,
        marca: formData.marca,
        localizacao: formData.localizacao,
        status: formData.status || 'Ativo'
      }

      // Adicionar campos opcionais
      if (formData.dataInstalacao) {
        try {
          payload.dataInstalacao = new Date(formData.dataInstalacao).toISOString()
        } catch (dateError) {
          console.error('Erro ao converter data de instalação:', dateError)
          setError('Data de instalação inválida')
          return
        }
      }

      if (formData.numeroSerie) {
        payload.numeroSerie = formData.numeroSerie
      }

      if (formData.ultimaManutencao) {
        try {
          payload.ultimaManutencao = new Date(formData.ultimaManutencao).toISOString()
        } catch (dateError) {
          console.error('Erro ao converter última manutenção:', dateError)
          setError('Data de última manutenção inválida')
          return
        }
      }

      if (formData.proximaManutencao) {
        try {
          payload.proximaManutencao = new Date(formData.proximaManutencao).toISOString()
        } catch (dateError) {
          console.error('Erro ao converter próxima manutenção:', dateError)
          setError('Data de próxima manutenção inválida')
          return
        }
      }

      // Adicionar ID para edição
      if (isEditing) {
        payload.id = params.id
      }

      console.log('Payload para envio:', JSON.stringify(payload, null, 2))
      console.log('URL:', url)
      console.log('Método:', method)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      let responseData = null
      try {
        responseData = await response.json()
        console.log('Dados da resposta:', JSON.stringify(responseData, null, 2))
      } catch (jsonError) {
        console.warn('Não foi possível parsear a resposta JSON:', jsonError)
      }

      if (!response.ok) {
        const errorMessage = 
          responseData?.message || 
          responseData?.error?.message ||
          `Erro ${response.status}: ${response.statusText}` || 
          'Falha ao salvar climatizador'
        
        console.error('Erro na resposta:', errorMessage)
        console.error('Detalhes do erro:', responseData)
        
        // Tenta extrair erros de validação
        if (responseData?.errors) {
          const validationErrors = responseData.errors.map((error: any) => {
            return `${error.field}: ${error.message}`
          }).join(', ')
          throw new Error(`Erro de validação: ${validationErrors}`)
        }
        
        if (responseData?.error?.details) {
          const errorDetails = responseData.error.details.map((detail: any) => {
            return `${detail.field}: ${detail.message}`
          }).join(', ')
          throw new Error(`Erro de validação: ${errorDetails}`)
        }
        
        throw new Error(errorMessage)
      }

      console.log('Navegando para lista de climatizadores')
      router.push('/climatizador')
    } catch (error) {
      console.error('Erro completo:', error)
      console.error('Tipo do erro:', typeof error)
      console.error('Propriedades do erro:', Object.keys(error))
      
      // More comprehensive error handling
      let errorMessage = 'Não foi possível salvar o climatizador'
      
      // Handle different types of errors
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Try to extract message from error object
        errorMessage = (error as any).message || 
                       (error as any).error?.message || 
                       JSON.stringify(error)
      }
      
      // Ensure error is always a string
      errorMessage = String(errorMessage)
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseError = () => {
    setError(null)
  }

  return (
    <Container maxWidth="sm">
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3, 
          mt: 4 
        }}
      >
        <Typography variant="h4">
          {isEditing ? 'Editar Climatizador' : 'Novo Climatizador'}
        </Typography>

        <TextField
          name="modelo"
          label="Modelo"
          value={formData.modelo}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!formErrors.modelo}
          helperText={formErrors.modelo}
        />

        <TextField
          name="marca"
          label="Marca"
          value={formData.marca}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!formErrors.marca}
          helperText={formErrors.marca}
        />

        <TextField
          name="localizacao"
          label="Localização"
          value={formData.localizacao}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
          error={!!formErrors.localizacao}
          helperText={formErrors.localizacao}
        />

        <TextField
          name="numeroSerie"
          label="Número de Série"
          value={formData.numeroSerie}
          onChange={handleChange}
          fullWidth
          disabled={loading}
          error={!!formErrors.numeroSerie}
          helperText={formErrors.numeroSerie}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            label="Data de Instalação"
            value={formData.dataInstalacao}
            onChange={(date) => handleChange({ name: 'dataInstalacao', target: { name: 'dataInstalacao', value: date } })}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                disabled: loading,
                error: !!formErrors.dataInstalacao,
                helperText: formErrors.dataInstalacao
              }
            }}
            format="dd/MM/yyyy"
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            label="Última Manutenção"
            value={formData.ultimaManutencao}
            onChange={(date) => handleChange({ name: 'ultimaManutencao', target: { name: 'ultimaManutencao', value: date } })}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                disabled: loading,
                error: !!formErrors.ultimaManutencao,
                helperText: formErrors.ultimaManutencao
              }
            }}
            format="dd/MM/yyyy"
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DatePicker
            label="Próxima Manutenção"
            value={formData.proximaManutencao}
            onChange={(date) => handleChange({ name: 'proximaManutencao', target: { name: 'proximaManutencao', value: date } })}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                fullWidth: true,
                disabled: loading,
                error: !!formErrors.proximaManutencao,
                helperText: formErrors.proximaManutencao
              }
            }}
            format="dd/MM/yyyy"
          />
        </LocalizationProvider>

        <TextField
          name="status"
          label="Status"
          select
          value={formData.status || 'Ativo'}
          onChange={handleChange}
          fullWidth
          disabled={loading}
        >
          <MenuItem value="Ativo">Ativo</MenuItem>
          <MenuItem value="Inativo">Inativo</MenuItem>
          <MenuItem value="Manutenção">Em Manutenção</MenuItem>
        </TextField>

        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
        </Button>
      </Box>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}
