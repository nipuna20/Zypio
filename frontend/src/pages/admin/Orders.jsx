import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
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

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

import AppShell from '../../layout/AppShell';
import api from '../../services/api';
import StatusChip from '../../components/StatusChip';

const statuses = [
  '',
  'pending',
  'confirmed',
  'packed',
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

const paymentTypes = ['', 'COD', 'Card', 'Bank Transfer'];

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    paymentType: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [statusDialog, setStatusDialog] = useState({
    open: false,
    order: null,
  });
  const [nextStatus, setNextStatus] = useState('confirmed');
  const [note, setNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [assignDialog, setAssignDialog] = useState({
    open: false,
    order: null,
  });
  const [dlpList, setDlpList] = useState([]);
  const [selectedDlp, setSelectedDlp] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [dlpLoading, setDlpLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.get('/admin/orders', {
        params: filters,
      });

      setRows(res.data.data.items || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDlps = async () => {
    try {
      setDlpLoading(true);

      const res = await api.get('/admin/dlps', {
        params: { approved: 'true' },
      });

      setDlpList(res.data.data.items || []);
    } catch (e) {
      console.error('Failed to load DLPs', e);
    } finally {
      setDlpLoading(false);
    }
  };

  useEffect(() => {
  fetchOrders();
  fetchDlps();
}, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const codOrders = rows.filter((order) => order.payment_type === 'COD').length;
    const pendingOrders = rows.filter((order) => order.status === 'pending').length;
    const unassignedOrders = rows.filter((order) => !order.dlp_id).length;

    return {
      total,
      codOrders,
      pendingOrders,
      unassignedOrders,
    };
  }, [rows]);

  const updateStatus = async () => {
    if (!statusDialog.order) return;

    try {
      setSavingStatus(true);
      setError('');
      setSuccess('');

      await api.patch(`/admin/orders/${statusDialog.order.id}/status`, {
        status: nextStatus,
        note,
      });

      setSuccess(`Order #${statusDialog.order.id} status updated successfully.`);
      setStatusDialog({ open: false, order: null });
      setNote('');
      fetchOrders();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const assignDlp = async () => {
    if (!assignDialog.order) return;

    try {
      if (!selectedDlp) {
        setError('Please select a delivery partner');
        return;
      }

      setAssigning(true);
      setError('');
      setSuccess('');

      await api.patch(`/admin/orders/${assignDialog.order.id}/assign-dlp`, {
        dlpId: selectedDlp,
      });

      setSuccess(`Delivery partner assigned to order #${assignDialog.order.id}.`);
      setAssignDialog({ open: false, order: null });
      setSelectedDlp('');
      fetchOrders();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign delivery partner');
    } finally {
      setAssigning(false);
    }
  };

  const exportCsv = () => {
    const params = new URLSearchParams(filters).toString();

    let base = api.defaults.baseURL || '';

    if (base.endsWith('/api')) {
      base = base.slice(0, -4);
    }

    window.open(`${base}/api/reports/orders/csv?${params}`, '_blank');
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      status: '',
      paymentType: '',
    });
  };

  return (
    <AppShell role="admin" title="Orders">
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            background:
              'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #2563EB 100%)',
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
                  width: 60,
                  height: 60,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 34 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.8 }}>
                  <Chip
                    size="small"
                    label="Order Management"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />

                  <Chip
                    size="small"
                    label={`${summary.total} Orders`}
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.22)',
                      color: '#DCFCE7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Admin Orders
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Manage orders, update delivery status, assign DLPs, and export reports.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.2}>
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
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    boxShadow: 'none',
                  },
                }}
              >
                Refresh
              </Button>

              <Button
                variant="contained"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={exportCsv}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  borderRadius: 3,
                  fontWeight: 900,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.24)',
                    boxShadow: 'none',
                  },
                }}
              >
                CSV
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

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <SummaryCard
            title="Total Orders"
            value={summary.total}
            icon={<ShoppingBagOutlinedIcon />}
            bg="#EEF4FF"
            color="#2563EB"
          />
          <SummaryCard
            title="Pending Orders"
            value={summary.pendingOrders}
            icon={<AssignmentTurnedInOutlinedIcon />}
            bg="#FFF7ED"
            color="#EA580C"
          />
          <SummaryCard
            title="Unassigned Orders"
            value={summary.unassignedOrders}
            icon={<LocalShippingOutlinedIcon />}
            bg="#FDF2F8"
            color="#DB2777"
          />
          <SummaryCard
            title="COD Orders"
            value={summary.codOrders}
            icon={<PaymentsOutlinedIcon />}
            bg="#ECFDF5"
            color="#059669"
          />
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
                Find orders by customer, phone, item, tracking number, status, or payment type.
              </Typography>
            </Box>

            <Button
              variant="text"
              onClick={clearFilters}
              sx={{
                fontWeight: 800,
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
                placeholder="Search name / phone / item / tracking"
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
                {statuses.map((status) => (
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
                {paymentTypes.map((payment) => (
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
                onClick={fetchOrders}
                disabled={loading}
                sx={{
                  height: 40,
                  borderRadius: 3,
                  fontWeight: 900,
                  boxShadow: 'none',
                }}
              >
                {loading ? 'Loading...' : 'Apply'}
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
                  Showing {rows.length} order{rows.length === 1 ? '' : 's'}
                </Typography>
              </Box>

              {loading ? (
                <Chip label="Loading..." color="primary" variant="outlined" />
              ) : (
                <Chip
                  label="Updated"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          <TableContainer sx={{ maxHeight: 650 }}>
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
                  <TableCell>Seller</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <LoadingRows />
                ) : rows.length > 0 ? (
                  rows.map((order) => (
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
                        <Typography variant="body2" fontWeight={700}>
                          {order.tracking_number || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {order.seller_name || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
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
                        <StatusChip status={order.status} />
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Tooltip title="Update status">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditOutlinedIcon />}
                              onClick={() => {
                                setStatusDialog({ open: true, order });
                                setNextStatus(order.status || 'pending');
                              }}
                              sx={{
                                borderRadius: 3,
                                fontWeight: 800,
                                textTransform: 'none',
                              }}
                            >
                              Update
                            </Button>
                          </Tooltip>

                          {!order.dlp_id ? (
                            <Tooltip title="Assign delivery partner">
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<LocalShippingOutlinedIcon />}
                                onClick={() => {
                                  setAssignDialog({ open: true, order });
                                  fetchDlps();
                                }}
                                sx={{
                                  borderRadius: 3,
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  boxShadow: 'none',
                                }}
                              >
                                Assign
                              </Button>
                            </Tooltip>
                          ) : (
                            <Chip
                              size="small"
                              label="Assigned"
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 800 }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Status Dialog */}
        <Dialog
          open={statusDialog.open}
          onClose={() => setStatusDialog({ open: false, order: null })}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Update Order Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order #{statusDialog.order?.id}
                </Typography>
              </Box>

              <IconButton onClick={() => setStatusDialog({ open: false, order: null })}>
                <CloseOutlinedIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              select
              label="New Status"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
            >
              {statuses.filter(Boolean).map((status) => (
                <MenuItem key={status} value={status}>
                  {formatLabel(status)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Note"
              placeholder="Add a short note about this status change..."
              multiline
              minRows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button
              onClick={() => setStatusDialog({ open: false, order: null })}
              sx={{ fontWeight: 800 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={updateStatus}
              disabled={savingStatus}
              sx={{
                borderRadius: 3,
                fontWeight: 900,
                boxShadow: 'none',
              }}
            >
              {savingStatus ? 'Saving...' : 'Save Status'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign DLP Dialog */}
        <Dialog
          open={assignDialog.open}
          onClose={() => setAssignDialog({ open: false, order: null })}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Assign Delivery Partner
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order #{assignDialog.order?.id}
                </Typography>
              </Box>

              <IconButton onClick={() => setAssignDialog({ open: false, order: null })}>
                <CloseOutlinedIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            {dlpLoading ? (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Skeleton height={56} />
                <Skeleton height={24} width="70%" />
              </Stack>
            ) : dlpList.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 3, mt: 1 }}>
                No approved delivery partners available.
              </Alert>
            ) : (
              <TextField
                fullWidth
                select
                label="Delivery Partner"
                value={selectedDlp}
                onChange={(e) => setSelectedDlp(e.target.value)}
                sx={{ mt: 1 }}
              >
                {dlpList.map((dlp) => (
                  <MenuItem key={dlp.id} value={dlp.id}>
                    {dlp.name} {dlp.email ? `(${dlp.email})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button
              onClick={() => setAssignDialog({ open: false, order: null })}
              sx={{ fontWeight: 800 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={assignDlp}
              disabled={!selectedDlp || assigning}
              sx={{
                borderRadius: 3,
                fontWeight: 900,
                boxShadow: 'none',
              }}
            >
              {assigning ? 'Assigning...' : 'Assign DLP'}
            </Button>
          </DialogActions>
        </Dialog>
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
          p: 2.3,
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
            <Skeleton width={50} height={16} />
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Skeleton width={120} />
      </TableCell>
      <TableCell>
        <Skeleton width={100} />
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
        <Skeleton width={70} height={28} />
      </TableCell>
      <TableCell>
        <Skeleton width={110} height={28} />
      </TableCell>
      <TableCell align="right">
        <Skeleton width={160} height={34} sx={{ ml: 'auto' }} />
      </TableCell>
    </TableRow>
  ));
}

function EmptyState() {
  return (
    <Box sx={{ py: 7, textAlign: 'center' }}>
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
        No orders found
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Try changing your search or filter options.
      </Typography>
    </Box>
  );
}

function formatLabel(value = '') {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}