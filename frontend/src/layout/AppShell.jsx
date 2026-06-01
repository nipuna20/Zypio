import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BrandLogo from '../components/BrandLogo';

const drawerWidth = 280;

const adminItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Orders', path: '/admin/orders', icon: <Inventory2OutlinedIcon /> },
  { label: 'Sellers', path: '/admin/sellers', icon: <StorefrontOutlinedIcon /> },
  { label: 'Seller Approvals', path: '/admin/approvals', icon: <VerifiedUserOutlinedIcon /> },
  { label: 'DLPs', path: '/admin/dlps', icon: <PeopleAltOutlinedIcon /> },
  { label: 'DLP Approvals', path: '/admin/dlp-approvals', icon: <LocalShippingOutlinedIcon /> },
  { label: 'Reports', path: '/admin/reports', icon: <DescriptionOutlinedIcon /> },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <HistoryOutlinedIcon /> },
  // New finance dashboard for managing COD deposits
  { label: 'Finance', path: '/admin/finance', icon: <PaymentsOutlinedIcon /> },
];

const sellerItems = [
  { label: 'Dashboard', path: '/seller/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Orders', path: '/seller/orders', icon: <Inventory2OutlinedIcon /> },
  { label: 'Share Order Link', path: '/seller/share-link', icon: <LinkOutlinedIcon /> },
  { label: 'Reports', path: '/seller/reports', icon: <DescriptionOutlinedIcon /> },
];

const dlpItems = [
  { label: 'Dashboard', path: '/dlp/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Orders', path: '/dlp/orders', icon: <Inventory2OutlinedIcon /> },
  { label: 'COD Collection', path: '/dlp/orders', icon: <PaymentsOutlinedIcon /> },
  { label: 'Scan Dispatch', path: '/dlp/scan-dispatch', icon: <QrCodeScannerOutlinedIcon /> },
  // New menu items for extended workflow
  { label: 'Inbound Scan', path: '/dlp/scan-inbound', icon: <QrCodeScannerOutlinedIcon /> },
  { label: 'Sort Scan', path: '/dlp/scan-sort', icon: <QrCodeScannerOutlinedIcon /> },
];

export default function AppShell({ role = 'admin', title = 'Dashboard', children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const roleConfig = useMemo(() => {
    if (role === 'seller') {
      return {
        label: 'Seller Panel',
        short: 'S',
        icon: <StorefrontOutlinedIcon />,
        color: '#2563EB',
        bg: '#DBEAFE',
        loginPath: '/seller/login',
      };
    }

    if (role === 'dlp') {
      return {
        label: 'DLP Panel',
        short: 'D',
        icon: <LocalShippingOutlinedIcon />,
        color: '#059669',
        bg: '#D1FAE5',
        loginPath: '/dlp/login',
      };
    }

    return {
      label: 'Admin Panel',
      short: 'A',
      icon: <AdminPanelSettingsOutlinedIcon />,
      color: '#7C3AED',
      bg: '#EDE9FE',
      loginPath: '/admin/login',
    };
  }, [role]);

  const items = useMemo(() => {
    if (role === 'admin') return adminItems;
    if (role === 'seller') return sellerItems;
    if (role === 'dlp') return dlpItems;
    return [];
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sellerId');
    localStorage.removeItem('dlpId');
    localStorage.removeItem('rememberAdmin');
    localStorage.removeItem('rememberSeller');
    localStorage.removeItem('rememberDlp');

    navigate(roleConfig.loginPath);
  };

  const isActive = (itemPath) => {
    if (itemPath === location.pathname) return true;
    return location.pathname.startsWith(`${itemPath}/`);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Brand */}
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
                <BrandLogo variant="dark" size={130} />

        </Stack>

        <Box
          sx={{
            mt: 2.2,
            p: 1.5,
            borderRadius: 3,
            bgcolor: roleConfig.bg,
            color: roleConfig.color,
            border: '1px solid rgba(148,163,184,0.22)',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2.2,
                bgcolor: '#fff',
                color: roleConfig.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {roleConfig.icon}
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={900}>
                {roleConfig.label}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Active workspace
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Divider />

      {/* Menu */}
      <Box sx={{ px: 1.2, py: 1.5, flexGrow: 1, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={900}
          sx={{ px: 1.4, mb: 1, display: 'block', letterSpacing: 0.6 }}
        >
          MAIN MENU
        </Typography>

        <List disablePadding>
          {items.map((item) => {
            const active = isActive(item.path);

            return (
              <ListItemButton
                key={`${item.label}-${item.path}`}
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  mb: 0.7,
                  minHeight: 48,
                  color: active ? '#1D4ED8' : '#475569',
                  bgcolor: active ? '#EEF4FF !important' : 'transparent',
                  border: active ? '1px solid #BFDBFE' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: active ? '#EEF4FF' : '#F8FAFC',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? '#2563EB' : '#64748B',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 900 : 700,
                    fontSize: 14,
                  }}
                />

                {active ? (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#2563EB',
                    }}
                  />
                ) : null}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Footer User / Logout */}
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            p: 1.4,
            mb: 1,
            borderRadius: 3,
            bgcolor: '#F8FAFC',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: roleConfig.color,
                fontWeight: 900,
              }}
            >
              {roleConfig.short}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={900} noWrap>
                {roleConfig.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Logged in
              </Typography>
            </Box>
          </Stack>
        </Box>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            color: '#DC2626',
            '&:hover': {
              bgcolor: '#FEF2F2',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#DC2626' }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 900,
              fontSize: 14,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <CssBaseline />

      {/* Top Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar
          sx={{
            minHeight: '72px !important',
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((prev) => !prev)}
              sx={{
                display: { sm: 'none' },
                bgcolor: '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <MenuOutlinedIcon />
            </IconButton>

            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                {title}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                {roleConfig.label} / {title}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.2} alignItems="center">
            <Chip
              size="small"
              label={roleConfig.label}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontWeight: 900,
                bgcolor: roleConfig.bg,
                color: roleConfig.color,
              }}
            />

            <Tooltip title={roleConfig.label}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: roleConfig.color,
                  fontWeight: 900,
                }}
              >
                {roleConfig.short}
              </Avatar>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Page Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '72px',
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}