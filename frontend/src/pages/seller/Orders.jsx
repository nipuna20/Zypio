import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import AppShell from '../../layout/AppShell';
import StatusChip from '../../components/StatusChip';
import api from '../../services/api';

const statusOptions = [
  '',
  'pending',
  'confirmed',
  'packed',
  'assigned_to_rider',
  'assigned_to_dlp',
  'pickup_scheduled',
  'picked_up',
  'at_warehouse',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'cancelled',
];

const paymentOptions = ['', 'COD', 'Card', 'Bank Transfer'];

export default function SellerOrders() {
  const sellerId = localStorage.getItem('sellerId');

  const [allRows, setAllRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const [filters, setFilters] = useState({
    q: '',
    status: '',
    paymentType: '',
  });

  const fetchOrders = async () => {
    try {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.get(`/seller/${sellerId}/orders`);
      setAllRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sellerId]);

  const rows = useMemo(() => {
    return allRows.filter((order) => {
      const q = filters.q.trim().toLowerCase();
      const status = order.status || 'pending';
      const paymentType = (order.payment_type || '').toLowerCase();

      const qMatch =
        !q ||
        String(order.id || '').toLowerCase().includes(q) ||
        (order.tracking_number || '').toLowerCase().includes(q) ||
        (order.customer_name || '').toLowerCase().includes(q) ||
        (order.customer_phone || '').toLowerCase().includes(q) ||
        (order.item_name || '').toLowerCase().includes(q) ||
        (order.delivery_address || order.customer_address || '')
          .toLowerCase()
          .includes(q);

      const statusMatch = !filters.status || status === filters.status;

      const paymentMatch =
        !filters.paymentType ||
        paymentType === filters.paymentType.toLowerCase();

      return qMatch && statusMatch && paymentMatch;
    });
  }, [allRows, filters]);

  const summary = useMemo(() => {
    const total = allRows.length;

    const pending = allRows.filter(
      (order) => (order.status || 'pending') === 'pending'
    ).length;

    const delivered = allRows.filter(
      (order) => order.status === 'delivered'
    ).length;

    const codPendingAmount = allRows
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
      codPendingAmount,
    };
  }, [allRows]);

  const clearFilters = () => {
    setFilters({
      q: '',
      status: '',
      paymentType: '',
    });
  };

  const openWaybill = async (orderId) => {
    try {
      setDownloadingId(orderId);
      setError('');
      setSuccess('');

      const apiBase = (api.defaults.baseURL || 'http://localhost:5000/api').replace(
        /\/api$/,
        ''
      );

      const token = localStorage.getItem('token');

      const response = await fetch(`${apiBase}/api/orders/${orderId}/pdf`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download waybill (${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `waybill-order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setSuccess(`Waybill downloaded for order #${orderId}.`);
    } catch (err) {
      setError(err.message || 'Failed to download waybill');
    } finally {
      setDownloadingId(null);
    }
  };

  const statCards = [
    {
      label: 'Total Orders',
      value: summary.total,
      description: 'All submitted orders',
      icon: <ShoppingBagOutlinedIcon />,
      bg: '#EEF4FF',
      color: '#2563EB',
    },
    {
      label: 'Pending Orders',
      value: summary.pending,
      description: 'Waiting for processing',
      icon: <AccessTimeOutlinedIcon />,
      bg: '#FFF7ED',
      color: '#EA580C',
    },
    {
      label: 'Delivered Orders',
      value: summary.delivered,
      description: 'Completed deliveries',
      icon: <CheckCircleOutlineIcon />,
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      label: 'COD Pending',
      value: formatCurrency(summary.codPendingAmount),
      description: 'Cash still pending',
      icon: <PaymentsOutlinedIcon />,
      bg: '#FDF2F8',
      color: '#DB2777',
    },
  ];

  return (
    <AppShell role="seller" title="Seller Orders">
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
                <ReceiptLongOutlinedIcon sx={{ fontSize: 36 }} />
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
                    label={`${allRows.length} Orders`}
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.22)',
                      color: '#DCFCE7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Seller Orders
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Search orders, track delivery status, and download waybills.
                </Typography>
              </Box>
            </Stack>

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

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Search & Filter
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Find orders by ID, tracking number, customer, phone, item, or address.
              </Typography>
            </Box>

            <Button
              variant="text"
              onClick={clearFilters}
              sx={{
                fontWeight: 900,
                width: { xs: '100%', md: 'auto' },
              }}
            >
              Clear Filters
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search ID / tracking / customer / phone / item"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status || 'all'} value={status}>
                    {status ? formatLabel(status) : 'All Statuses'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Payment"
                value={filters.paymentType}
                onChange={(e) =>
                  setFilters({ ...filters, paymentType: e.target.value })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                {paymentOptions.map((payment) => (
                  <MenuItem key={payment || 'all'} value={payment}>
                    {payment || 'All Payments'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<RefreshOutlinedIcon />}
                onClick={fetchOrders}
                disabled={loading || !sellerId}
                sx={{
                  height: 40,
                  borderRadius: 3,
                  fontWeight: 900,
                  boxShadow: 'none',
                }}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Orders Table */}
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
                  Orders List
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Showing {rows.length} of {allRows.length} order
                  {allRows.length === 1 ? '' : 's'}
                </Typography>
              </Box>

              {loading ? (
                <Chip label="Loading..." color="primary" variant="outlined" />
              ) : (
                <Chip
                  label="Ready"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          <TableContainer sx={{ maxHeight: 680 }}>
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
                  <TableCell>Address</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <LoadingRows />
                ) : rows.length > 0 ? (
                  rows.map((order) => {
                    const paymentType = order.payment_type || order.paymentType || '-';
                    const address = order.delivery_address || order.customer_address || '-';

                    return (
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

                          <Typography variant="caption" color="text.secondary">
                            {order.customer_phone || '-'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={0.8} alignItems="flex-start">
                            <PlaceOutlinedIcon
                              sx={{ fontSize: 17, color: 'text.secondary', mt: 0.2 }}
                            />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 230,
                                whiteSpace: 'normal',
                                lineHeight: 1.4,
                              }}
                            >
                              {address}
                            </Typography>
                          </Stack>
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
                            label={paymentType}
                            sx={{
                              fontWeight: 800,
                              bgcolor: paymentType === 'COD' ? '#FFF7ED' : '#EEF4FF',
                              color: paymentType === 'COD' ? '#C2410C' : '#1D4ED8',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <StatusChip status={order.status || 'pending'} />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(order.created_at)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Tooltip title="Download waybill PDF">
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadOutlinedIcon />}
                                onClick={() => openWaybill(order.id)}
                                disabled={downloadingId === order.id}
                                sx={{
                                  borderRadius: 3,
                                  fontWeight: 900,
                                  textTransform: 'none',
                                }}
                              >
                                {downloadingId === order.id
                                  ? 'Downloading...'
                                  : 'Waybill'}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <EmptyState hasFilters={Boolean(filters.q || filters.status || filters.paymentType)} />
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

function LoadingRows() {
  return Array.from({ length: 6 }).map((_, index) => (
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
        <Skeleton width={100} />
      </TableCell>

      <TableCell>
        <Skeleton width={190} />
      </TableCell>

      <TableCell>
        <Skeleton width={120} />
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

      <TableCell>
        <Skeleton width={120} />
      </TableCell>

      <TableCell align="right">
        <Skeleton width={100} height={34} sx={{ ml: 'auto' }} />
      </TableCell>
    </TableRow>
  ));
}

function EmptyState({ hasFilters }) {
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
        {hasFilters ? 'No matching orders found' : 'No orders yet'}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {hasFilters
          ? 'Try changing your search text, status, or payment filter.'
          : 'New customer orders will appear here after customers submit the order form.'}
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

function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLabel(value = '') {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}