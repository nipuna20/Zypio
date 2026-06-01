import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

import AppShell from '../../layout/AppShell';
import api from '../../services/api';

/**
 * Admin dashboard displaying aggregate statistics about orders.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const dashboardData = useMemo(() => {
    const totalOrders = Number(stats?.total_orders ?? 0);
    const pendingOrders = Number(stats?.pending_orders ?? 0);
    const deliveredOrders = Number(stats?.delivered_orders ?? 0);
    const codPendingAmount = Number(stats?.cod_pending_amount ?? 0);

    const deliveredPercentage =
      totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

    const pendingPercentage =
      totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      codPendingAmount,
      deliveredPercentage,
      pendingPercentage,
    };
  }, [stats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      label: 'Total Orders',
      value: dashboardData.totalOrders,
      description: 'All orders received',
      icon: <ShoppingCartOutlinedIcon />,
      bg: '#EEF4FF',
      color: '#2563EB',
    },
    {
      label: 'Pending Orders',
      value: dashboardData.pendingOrders,
      description: 'Waiting to be processed',
      icon: <AccessTimeOutlinedIcon />,
      bg: '#FFF7ED',
      color: '#EA580C',
    },
    {
      label: 'Delivered Orders',
      value: dashboardData.deliveredOrders,
      description: 'Successfully completed',
      icon: <LocalShippingOutlinedIcon />,
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      label: 'COD Pending',
      value: formatCurrency(dashboardData.codPendingAmount),
      description: 'Cash to be collected',
      icon: <PaymentsOutlinedIcon />,
      bg: '#FDF2F8',
      color: '#DB2777',
    },
  ];

  return (
    <AppShell role="admin" title="Dashboard">
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 4,
            background:
              'linear-gradient(135deg, #111827 0%, #1E3A8A 55%, #2563EB 100%)',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              right: -60,
              top: -80,
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  label="Admin Panel"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label="Live Overview"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(34,197,94,0.25)',
                    color: '#DCFCE7',
                    fontWeight: 600,
                  }}
                />
              </Stack>

              <Typography variant="h4" fontWeight={800}>
                Welcome back
              </Typography>

              <Typography sx={{ mt: 0.8, color: 'rgba(255,255,255,0.78)' }}>
                Monitor order performance, delivery progress, and COD collections.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RefreshOutlinedIcon />}
              onClick={fetchDashboard}
              disabled={loading}
              sx={{
                bgcolor: '#fff',
                color: '#1E3A8A',
                fontWeight: 700,
                borderRadius: 3,
                px: 2.5,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  boxShadow: 'none',
                },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

        {/* Error */}
        {error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        {/* Stat Cards */}
        <Grid container spacing={2.5}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <DashboardCard card={card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* Progress Section */}
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Order Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivery and pending order summary
                  </Typography>
                </Box>

                <Chip
                  label={`${dashboardData.deliveredPercentage}% Delivered`}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700, width: 'fit-content' }}
                />
              </Stack>

              {loading ? (
                <Stack spacing={2}>
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <ProgressRow
                    label="Delivered Orders"
                    value={dashboardData.deliveredOrders}
                    percentage={dashboardData.deliveredPercentage}
                    color="success"
                  />

                  <ProgressRow
                    label="Pending Orders"
                    value={dashboardData.pendingOrders}
                    percentage={dashboardData.pendingPercentage}
                    color="warning"
                  />
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                background:
                  'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,1))',
              }}
            >
              <Typography variant="h6" fontWeight={800}>
                Today’s Focus
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Key operational items to check.
              </Typography>

              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <FocusItem
                  title="Process pending orders"
                  value={`${dashboardData.pendingOrders} orders`}
                />
                <FocusItem
                  title="Collect COD payments"
                  value={formatCurrency(dashboardData.codPendingAmount)}
                />
                <FocusItem
                  title="Maintain delivery rate"
                  value={`${dashboardData.deliveredPercentage}% completed`}
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AppShell>
  );
}

function DashboardCard({ card, loading }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        transition: '0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.10)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {card.label}
          </Typography>

          {loading ? (
            <Skeleton width={90} height={42} sx={{ mt: 1 }} />
          ) : (
            <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
              {card.value}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {card.description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: card.bg,
            color: card.color,
            flexShrink: 0,
          }}
        >
          {card.icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function ProgressRow({ label, value, percentage, color }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {value} / {percentage}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 10,
          borderRadius: 999,
          bgcolor: 'rgba(148, 163, 184, 0.18)',
        }}
      />
    </Box>
  );
}

function FocusItem({ title, value }) {
  return (
    <Box
      sx={{
        p: 1.8,
        borderRadius: 3,
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="subtitle1" fontWeight={800}>
        {value}
      </Typography>
    </Box>
  );
}