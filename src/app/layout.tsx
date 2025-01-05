import '@/styles/globals.css'
import type { Metadata } from 'next'
import CssBaseline from '@mui/material/CssBaseline'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import { Container, Box } from '@mui/material'
import { NotistackProvider } from '@/components/NotistackProvider'

export const metadata: Metadata = {
  title: 'Sistema de Climatizadores',
  description: 'Sistema para gerenciamento de climatizadores e manutenções',
  applicationName: 'Sistema de Climatizadores',
  keywords: ['climatizadores', 'manutenção', 'gestão'],
  authors: [{ name: 'Sua Empresa' }],
  creator: 'Sua Empresa',
  publisher: 'Sua Empresa',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://seu-site.com.br',
    siteName: 'Sistema de Climatizadores',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        <Providers>
          <CssBaseline />
          <NotistackProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                <Box sx={{ my: 4 }}>
                  {children}
                </Box>
              </Container>
            </Box>
          </NotistackProvider>
        </Providers>
      </body>
    </html>
  )
}
