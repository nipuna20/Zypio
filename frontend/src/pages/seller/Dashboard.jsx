import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

import AppShell from '../../layout/AppShell';
import StatusChip from '../../components/StatusChip';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem('sellerId');

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.get(`/seller/${sellerId}/orders`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load seller orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [sellerId]);

  const stats = useMemo(() => {
    const total = orders.length;

    const pending = orders.filter(
      (order) => (order.status || 'pending') === 'pending'
    ).length;

    const delivered = orders.filter(
      (order) => order.status === 'delivered'
    ).length;

    const codPending = orders
      .filter(
        (order) =>
          (order.payment_type || order.paymentType) === 'COD' &&
          order.status !== 'delivered'
      )
      .reduce((sum, order) => sum + Number(order.price || 0), 0);

    return {
      total,
      pending,
      delivered,
      codPending,
    };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 8), [orders]);

  const shareLink = sellerId
    ? `${window.location.origin}/order-form/${sellerId}`
    : '';

  const copyShareLink = async () => {
    try {
      if (!shareLink) return;

      await navigator.clipboard.writeText(shareLink);
      setSuccess('Customer order form link copied successfully.');
    } catch (err) {
      setError('Failed to copy link. Please copy it manually.');
    }
  };

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.total,
      description: 'All customer orders',
      icon: <ShoppingBagOutlinedIcon />,
      bg: '#EEF4FF',
      color: '#2563EB',
    },
    {
      label: 'Pending Orders',
      value: stats.pending,
      description: 'Waiting for processing',
      icon: <AccessTimeOutlinedIcon />,
      bg: '#FFF7ED',
      color: '#EA580C',
    },
    {
      label: 'Delivered Orders',
      value: stats.delivered,
      description: 'Completed deliveries',
      icon: <CheckCircleOutlineIcon />,
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      label: 'COD Pending',
      value: formatCurrency(stats.codPending),
      description: 'Cash to be collected',
      icon: <PaymentsOutlinedIcon />,
      bg: '#FDF2F8',
      color: '#DB2777',
    },
  ];

  return (
    <AppShell role="seller" title="Seller Dashboard">
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
              width: 260,
              height: 260,
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
                  bgcolor: 'rgba(255,255,255,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StorefrontOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.8 }}>
                  <Chip
                    size="small"
                    label="Seller Panel"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />

                  <Chip
                    size="small"
                    label={`${orders.length} Orders`}
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.22)',
                      color: '#DCFCE7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Seller Dashboard
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Track orders, share your customer form link, and monitor COD collections.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <Button
                variant="contained"
                startIcon={<LinkOutlinedIcon />}
                onClick={() => navigate('/seller/share-link')}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  borderRadius: 3,
                  fontWeight: 900,
                  px: 2.5,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.24)',
                    boxShadow: 'none',
                  },
                }}
              >
                Share Link
              </Button>

              <Button
                variant="contained"
                startIcon={<RefreshOutlinedIcon />}
                onClick={fetchOrders}
                disabled={loading || !sellerId}
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
          </Stack>
        </Paper>

        {/* Alerts */}
        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        {success ? (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
            {success}
          </Alert>
        ) : null}

        {!sellerId ? (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
            Seller ID not found. Please login again.
          </Alert>
        ) : null}

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <DashboardCard card={card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          {/* Recent Orders */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                height: '100%',
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Recent Orders
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Latest customer orders submitted through your order form
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate('/seller/orders')}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        textTransform: 'none',
                      }}
                    >
                      View All
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<RefreshOutlinedIcon />}
                      onClick={fetchOrders}
                      disabled={loading || !sellerId}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      Refresh
                    </Button>
                  </Stack>
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
                    {loading ? (
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
                                <Typography fontWeight={900}>
                                  #{order.id}
                                </Typography>
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
                              label={order.payment_type || order.paymentType || '-'}
                              sx={{
                                fontWeight: 800,
                                bgcolor:
                                  (order.payment_type || order.paymentType) === 'COD'
                                    ? '#FFF7ED'
                                    : '#EEF4FF',
                                color:
                                  (order.payment_type || order.paymentType) === 'COD'
                                    ? '#C2410C'
                                    : '#1D4ED8',
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
                          <EmptyOrdersState />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={2.5}>
              {/* Quick Actions */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" fontWeight={900}>
                  Quick Actions
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Common seller actions for daily work
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                  <ActionButton
                    title="Share Order Link"
                    description="Send your customer form link"
                    icon={<LinkOutlinedIcon />}
                    onClick={() => navigate('/seller/share-link')}
                    primary
                  />

                  <ActionButton
                    title="Manage Orders"
                    description="View and manage all submitted orders"
                    icon={<ManageSearchOutlinedIcon />}
                    onClick={() => navigate('/seller/orders')}
                  />

                  <ActionButton
                    title="View Reports"
                    description="Check sales and order performance"
                    icon={<AssessmentOutlinedIcon />}
                    onClick={() => navigate('/seller/reports')}
                  />
                </Stack>
              </Paper>

              {/* Customer Form Link */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background:
                    'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,1))',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Customer Form Link
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Share this link with your customers
                    </Typography>
                  </Box>

                  <Tooltip title="Open form">
                    <span>
                      <IconButton
                        onClick={() => shareLink && window.open(shareLink, '_blank')}
                        disabled={!shareLink}
                      >
                        <OpenInNewOutlinedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    p: 1.8,
                    bgcolor: '#fff',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    wordBreak: 'break-all',
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {shareLink || 'Login again to load link'}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ContentCopyOutlinedIcon />}
                    onClick={copyShareLink}
                    disabled={!shareLink}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 900,
                      textTransform: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    Copy Link
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<OpenInNewOutlinedIcon />}
                    onClick={() => shareLink && window.open(shareLink, '_blank')}
                    disabled={!shareLink}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 900,
                      textTransform: 'none',
                    }}
                  >
                    Open
                  </Button>
                </Stack>
              </Paper>
            </Stack>
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

function ActionButton({ title, description, icon, onClick, primary = false }) {
  return (
    <Button
      fullWidth
      variant={primary ? 'contained' : 'outlined'}
      onClick={onClick}
      sx={{
        p: 1.6,
        borderRadius: 3,
        justifyContent: 'flex-start',
        textAlign: 'left',
        textTransform: 'none',
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 3,
            bgcolor: primary ? 'rgba(255,255,255,0.18)' : '#EEF4FF',
            color: primary ? '#fff' : '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography fontWeight={900} color={primary ? '#fff' : 'text.primary'}>
            {title}
          </Typography>

          <Typography
            variant="caption"
            color={primary ? 'rgba(255,255,255,0.78)' : 'text.secondary'}
          >
            {description}
          </Typography>
        </Box>
      </Stack>
    </Button>
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
        <Skeleton width={90} />
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

function EmptyOrdersState() {
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
        <ShoppingBagOutlinedIcon sx={{ fontSize: 38 }} />
      </Box>

      <Typography variant="h6" fontWeight={900}>
        No orders yet
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Share your customer form link to start receiving orders.
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