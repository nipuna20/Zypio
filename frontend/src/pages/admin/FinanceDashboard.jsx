import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AppShell from '../../layout/AppShell';
import api from '../../services/api';

/**
 * FinanceDashboard page lists COD orders that have been collected but not yet deposited.
 * Admins can mark a COD order as deposited, which updates the order status to 'bank_deposited'.
 */
export default function FinanceDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fetchDepositableOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // Fetch all orders for admin and filter client side because backend filtering route not implemented yet
      const res = await api.get('/admin/orders', {
        params: { page: 1, pageSize: 100, paymentType: 'COD' },
      });
      const data = res.data?.data?.items || res.data?.data || [];
      // Filter orders: cod_collected = true and status not bank_deposited
      const depositable = data.filter((order) => {
        return order.payment_type === 'COD' && order.cod_collected === true && order.status !== 'bank_deposited';
      });
      setOrders(depositable);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDepositableOrders();
  }, []);
  const markDeposited = async (orderId) => {
    try {
      setError('');
      setSuccess('');
      await api.patch(`/orders/${orderId}/deposit`);
      setSuccess(`Order #${orderId} marked as deposited.`);
      await fetchDepositableOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark deposit');
    }
  };
  return (
    <AppShell role="admin" title="Finance">
      <Box sx={{ pb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: 4, color: '#fff', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 55%, #2563EB 100%)' }}>
          <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', right: -80, top: -100 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 62, height: 62, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PaidOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={900}>Finance Dashboard</Typography>
                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>Manage COD deposits and release payments to merchants.</Typography>
              </Box>
            </Stack>
            <Button variant="contained" startIcon={<RefreshOutlinedIcon />} onClick={fetchDepositableOrders} sx={{ bgcolor: '#fff', color: '#1E40AF', borderRadius: 3, fontWeight: 900, px: 2.5, boxShadow: 'none', '&:hover': { bgcolor: '#F8FAFC', boxShadow: 'none' } }}>
              Refresh
            </Button>
          </Stack>
        </Paper>
        {success ? (<Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{success}</Alert>) : null}
        {error ? (<Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>) : null}
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
              <CircularProgress />
            </Stack>
          ) : orders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No COD deposits pending.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tracking #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>COD Collected</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.tracking_number || '-'}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell align="right">{Number(order.price || 0).toFixed(2)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.cod_collected ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <Button variant="contained" size="small" onClick={() => markDeposited(order.id)}>
                          Mark Deposited
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}