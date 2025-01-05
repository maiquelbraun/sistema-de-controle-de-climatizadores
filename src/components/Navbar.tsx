'use client'

import React, { useState, useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AcUnit as AcUnitIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  href: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
    { text: 'Climatizadores', icon: <AcUnitIcon />, href: '/climatizador' },
    { text: 'Manutenções', icon: <BuildIcon />, href: '/manutencao' },
    { text: 'Relatórios', icon: <AssessmentIcon />, href: '/relatorios' },
    { text: 'Usuários', icon: <PeopleIcon />, href: '/usuarios' }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Sistema de Climatizadores
      </Typography>
      <List>
        {menuItems.map((item) => (
          <Link href={item.href} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton 
              selected={pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Sistema de Climatizadores
            </Typography>
            {!isMobile && menuItems.map((item) => (
              <Link 
                href={item.href} 
                key={item.text} 
                style={{ textDecoration: 'none', color: 'inherit', marginRight: 10 }}
              >
                <Button 
                  color="inherit" 
                  startIcon={item.icon}
                  variant={pathname === item.href ? 'outlined' : 'text'}
                >
                  {item.text}
                </Button>
              </Link>
            ))}
          </Box>
          <Box>
            {session ? (
              <Button 
                color="inherit" 
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Logout
              </Button>
            ) : (
              <Button 
                color="inherit" 
                onClick={() => signIn()}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  )
}
