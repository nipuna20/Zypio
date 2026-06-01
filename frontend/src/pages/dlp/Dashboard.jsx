import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';

import AppShell from '../../layout/AppShell';
import StatusChip from '../../components/StatusChip';
import api from '../../services/api';

/**
 * Dashboard for delivery partners.
 * Displays high-level statistics and recent assigned orders.
 */
export default function DlpDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setError('');

      const res = await api.get('/dlp/dashboard');
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError('');

      const res = await api.get('/dlp/orders');
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const refreshAll = () => {
    fetchStats();
    fetchOrders();
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

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

  const isLoading = loadingStats || loadingOrders;

  const cards = [
    {
      label: 'Total Orders',
      value: dashboardData.totalOrders,
      description: 'Assigned to you',
      icon: <Inventory2OutlinedIcon />,
      bg: '#EEF4FF',
      color: '#2563EB',
    },
    {
      label: 'Pending Orders',
      value: dashboardData.pendingOrders,
      description: 'Need attention',
      icon: <AccessTimeOutlinedIcon />,
      bg: '#FFF7ED',
      color: '#EA580C',
    },
    {
      label: 'Delivered Orders',
      value: dashboardData.deliveredOrders,
      description: 'Successfully completed',
      icon: <CheckCircleOutlineIcon />,
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      label: 'COD Pending',
      value: formatCurrency(dashboardData.codPendingAmount),
      description: 'Cash to collect',
      icon: <PaymentsOutlinedIcon />,
      bg: '#FDF2F8',
      color: '#DB2777',
    },
  ];

  return (
    <AppShell role="dlp" title="Delivery Partner Dashboard">
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, #0F172A 0%, #1E40AF 55%, #2563EB 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 250,
              height: 250,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
              right: -80,
              top: -100,
            }}
          />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.16)',
                }}
              >
                <LocalShippingOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.8 }}>
                  <Chip
                    size="small"
                    label="DLP Panel"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />

                  <Chip
                    size="small"
                    label={`${orders.length} Assigned`}
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.22)',
                      color: '#DCFCE7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Delivery Partner Dashboard
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Track assigned orders, delivery progress, and COD collection.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RefreshOutlinedIcon />}
              onClick={refreshAll}
              disabled={isLoading}
              sx={{
                bgcolor: '#fff',
                color: '#1E40AF',
                borderRadius: 3,
                fontWeight: 900,
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

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        {/* Stat Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <DashboardCard card={card} loading={loadingStats} />
            </Grid>
          ))}
        </Grid>

        {/* Progress + Focus */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
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
                  <Typography variant="h6" fontWeight={900}>
                    Delivery Progress
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Your current assigned order performance
                  </Typography>
                </Box>

                <Chip
                  label={`${dashboardData.deliveredPercentage}% Delivered`}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 800, width: 'fit-content' }}
                />
              </Stack>

              {loadingStats ? (
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
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: '#DBEAFE',
                    color: '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RouteOutlinedIcon />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Today’s Focus
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Items that need attention
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <FocusItem
                  title="Pending deliveries"
                  value={`${dashboardData.pendingOrders} orders`}
                />
                <FocusItem
                  title="COD to collect"
                  value={formatCurrency(dashboardData.codPendingAmount)}
                />
                <FocusItem
                  title="Recent assigned orders"
                  value={`${recentOrders.length} shown`}
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Recent Orders
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Latest assigned orders and their delivery status
                </Typography>
              </Box>

              {loadingOrders ? (
                <Chip label="Loading..." color="primary" variant="outlined" />
              ) : (
                <Chip
                  label={`${recentOrders.length} Recent`}
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      bgcolor: '#F8FAFC',
                      color: '#475569',
                      fontWeight: 900,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  <TableCell>Order</TableCell>
                  <TableCell>Tracking</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loadingOrders ? (
                  <LoadingRows />
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      sx={{
                        '& td': {
                          py: 1.8,
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: '#DBEAFE',
                              color: '#1D4ED8',
                              fontWeight: 900,
                            }}
                          >
                            #{String(order.id).slice(-2)}
                          </Avatar>

                          <Box>
                            <Typography fontWeight={900}>#{order.id}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Order ID
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {order.tracking_number || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {order.customer_name || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {order.customer_phone || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {order.item_name || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={900}>
                          {formatCurrency(order.price)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={order.payment_type || '-'}
                          sx={{
                            fontWeight: 800,
                            bgcolor:
                              order.payment_type === 'COD' ? '#FFF7ED' : '#EEF4FF',
                            color:
                              order.payment_type === 'COD' ? '#C2410C' : '#1D4ED8',
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <StatusChip status={order.status || 'pending'} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            {card.label}
          </Typography>

          {loading ? (
            <Skeleton width={100} height={42} sx={{ mt: 1 }} />
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
            bgcolor: card.bg,
            color: card.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        <Typography variant="body2" fontWeight={800}>
          {label}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight={800}>
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

      <Typography variant="subtitle1" fontWeight={900}>
        {value}
      </Typography>
    </Box>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton width={70} height={22} />
            <Skeleton width={55} height={16} />
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Skeleton width={120} />
      </TableCell>

      <TableCell>
        <Skeleton width={130} />
      </TableCell>

      <TableCell>
        <Skeleton width={100} />
      </TableCell>

      <TableCell>
        <Skeleton width={130} />
      </TableCell>

      <TableCell>
        <Skeleton width={80} />
      </TableCell>

      <TableCell>
        <Skeleton width={80} height={28} />
      </TableCell>

      <TableCell>
        <Skeleton width={110} height={28} />
      </TableCell>
    </TableRow>
  ));
}

function EmptyState() {
  return (
    <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
      <Box
        sx={{
          width: 76,
          height: 76,
          mx: 'auto',
          mb: 2,
          borderRadius: '50%',
          bgcolor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
        }}
      >
        <LocalShippingOutlinedIcon sx={{ fontSize: 38 }} />
      </Box>

      <Typography variant="h6" fontWeight={900}>
        No orders assigned yet
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Assigned delivery orders will appear here once the admin assigns them to you.
      </Typography>
    </Box>
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}