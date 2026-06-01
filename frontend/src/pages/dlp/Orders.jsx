import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import AppShell from '../../layout/AppShell';
import StatusChip from '../../components/StatusChip';
import api from '../../services/api';

/**
 * Orders page for delivery partners.
 * Lists all assigned orders and allows status/COD updates.
 */
export default function DlpOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingStatuses, setEditingStatuses] = useState({});
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [collectingCodId, setCollectingCodId] = useState(null);
  const [search, setSearch] = useState('');

  const statusOptions = [
    { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'at_warehouse', label: 'At Warehouse' },
    { value: 'received_at_hub', label: 'Received at Hub' },
    { value: 'sorted', label: 'Sorted at Centre' },
    { value: 'out_for_delivery', label: 'Out For Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed_delivery', label: 'Failed Delivery' },
    { value: 'returned', label: 'Returned' },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.get('/dlp/orders');
      const data = Array.isArray(res.data.data) ? res.data.data : [];

      setOrders(data);

      const initialStatuses = {};
      data.forEach((order) => {
        initialStatuses[order.id] = order.status || 'pending';
      });

      setEditingStatuses(initialStatuses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, value) => {
    setEditingStatuses((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  const saveStatus = async (orderId) => {
    const newStatus = editingStatuses[orderId];

    try {
      setSavingStatusId(orderId);
      setError('');
      setSuccess('');

      await api.patch(`/dlp/orders/${orderId}/status`, {
        status: newStatus,
      });

      setSuccess(`Order #${orderId} status updated successfully.`);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSavingStatusId(null);
    }
  };

  const markCodCollected = async (orderId) => {
    try {
      setCollectingCodId(orderId);
      setError('');
      setSuccess('');

      await api.patch(`/dlp/orders/${orderId}/cod-collected`);

      setSuccess(`COD payment marked as collected for order #${orderId}.`);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark COD as collected');
    } finally {
      setCollectingCodId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return orders;

    return orders.filter((order) => {
      return (
        String(order.id || '').toLowerCase().includes(keyword) ||
        order.tracking_number?.toLowerCase().includes(keyword) ||
        order.customer_name?.toLowerCase().includes(keyword) ||
        order.customer_phone?.toLowerCase().includes(keyword) ||
        order.delivery_address?.toLowerCase().includes(keyword) ||
        order.item_name?.toLowerCase().includes(keyword) ||
        order.payment_type?.toLowerCase().includes(keyword) ||
        order.status?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, search]);

  const summary = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((order) => order.status === 'delivered').length;
    const pending = orders.filter((order) => {
      // consider an order pending if it's not in one of the terminal states
      const status = order.status || 'pending';
      return !['delivered', 'failed_delivery', 'returned', 'residual', 'bank_deposited', 'payment_released'].includes(status);
    }).length;

    const codPending = orders.filter(
      (order) => order.payment_type === 'COD' && !order.cod_collected
    ).length;

    return {
      total,
      delivered,
      pending,
      codPending,
    };
  }, [orders]);

  return (
    <AppShell role="dlp" title="Assigned Orders">
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
                  bgcolor: 'rgba(255,255,255,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  Assigned Orders
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Manage delivery progress, update order status, and collect COD payments.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RefreshOutlinedIcon />}
              onClick={fetchOrders}
              disabled={loading}
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

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <SummaryCard
            title="Assigned Orders"
            value={summary.total}
            icon={<Inventory2OutlinedIcon />}
            bg="#EEF4FF"
            color="#2563EB"
          />

          <SummaryCard
            title="In Progress"
            value={summary.pending}
            icon={<AccessTimeOutlinedIcon />}
            bg="#FFF7ED"
            color="#EA580C"
          />

          <SummaryCard
            title="Delivered"
            value={summary.delivered}
            icon={<CheckCircleOutlineIcon />}
            bg="#ECFDF5"
            color="#059669"
          />

          <SummaryCard
            title="COD Pending"
            value={summary.codPending}
            icon={<PaymentsOutlinedIcon />}
            bg="#FDF2F8"
            color="#DB2777"
          />
        </Grid>

        {/* Toolbar */}
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
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Delivery Worklist
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Search assigned orders and update each delivery stage.
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search ID, tracking, customer, phone, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                minWidth: { xs: '100%', md: 420 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#F8FAFC',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
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
                  Orders
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Showing {filteredOrders.length} of {orders.length} assigned orders
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
                  <TableCell>Current Status</TableCell>
                  <TableCell align="center">Update Status</TableCell>
                  <TableCell align="center">COD</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <LoadingRows />
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const selectedStatus = editingStatuses[order.id] || order.status || '';
                    const statusChanged = selectedStatus !== (order.status || 'pending');
                    const isCod = order.payment_type === 'COD';

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
                                maxWidth: 220,
                                whiteSpace: 'normal',
                                lineHeight: 1.4,
                              }}
                            >
                              {order.delivery_address || '-'}
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
                            label={order.payment_type || '-'}
                            sx={{
                              fontWeight: 800,
                              bgcolor: isCod ? '#FFF7ED' : '#EEF4FF',
                              color: isCod ? '#C2410C' : '#1D4ED8',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <StatusChip status={order.status || 'pending'} />
                        </TableCell>

                        <TableCell align="center">
                          <Stack spacing={1} alignItems="center">
                            <TextField
                              select
                              size="small"
                              value={selectedStatus}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              sx={{
                                minWidth: 180,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  bgcolor: '#F8FAFC',
                                },
                              }}
                            >
                              {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>

                            <Tooltip
                              title={
                                statusChanged
                                  ? 'Save this status update'
                                  : 'Change status first'
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={
                                    savingStatusId === order.id ? (
                                      <CircularProgress size={16} color="inherit" />
                                    ) : (
                                      <SaveOutlinedIcon />
                                    )
                                  }
                                  disabled={
                                    savingStatusId === order.id || !statusChanged
                                  }
                                  onClick={() => saveStatus(order.id)}
                                  sx={{
                                    borderRadius: 3,
                                    fontWeight: 900,
                                    textTransform: 'none',
                                    boxShadow: 'none',
                                  }}
                                >
                                  {savingStatusId === order.id ? 'Saving...' : 'Save'}
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          {!isCod ? (
                            <Chip
                              size="small"
                              label="Not COD"
                              variant="outlined"
                              sx={{ fontWeight: 800 }}
                            />
                          ) : order.cod_collected ? (
                            <Chip
                              size="small"
                              color="success"
                              label="Collected"
                              sx={{ fontWeight: 800 }}
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                collectingCodId === order.id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <PaymentsOutlinedIcon />
                                )
                              }
                              disabled={collectingCodId === order.id}
                              onClick={() => markCodCollected(order.id)}
                              sx={{
                                borderRadius: 3,
                                fontWeight: 900,
                                textTransform: 'none',
                              }}
                            >
                              {collectingCodId === order.id
                                ? 'Updating...'
                                : 'Mark Collected'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <EmptyState search={search} />
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

function SummaryCard({ title, value, icon, bg, color }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={0}
        sx={{
          p: 2.4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
          transition: '0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.10)',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={900} sx={{ mt: 0.8 }}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: bg,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </Paper>
    </Grid>
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
        <Skeleton width={140} />
        <Skeleton width={100} />
      </TableCell>

      <TableCell>
        <Skeleton width={190} />
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

      <TableCell align="center">
        <Skeleton width={180} height={40} sx={{ mx: 'auto' }} />
        <Skeleton width={80} height={32} sx={{ mx: 'auto', mt: 1 }} />
      </TableCell>

      <TableCell align="center">
        <Skeleton width={120} height={34} sx={{ mx: 'auto' }} />
      </TableCell>
    </TableRow>
  ));
}

function EmptyState({ search }) {
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
        {search ? 'No matching orders found' : 'No orders assigned yet'}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {search
          ? 'Try searching with another order ID, tracking number, customer name, phone, or item.'
          : 'Assigned delivery orders will appear here once the admin assigns them to you.'}
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