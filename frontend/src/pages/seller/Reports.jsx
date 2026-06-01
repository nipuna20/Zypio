import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

import AppShell from '../../layout/AppShell';
import api from '../../services/api';

export default function SellerReports() {
  const sellerId = localStorage.getItem('sellerId');

  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [range, setRange] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      const res = await api.get(`/seller/${sellerId}/orders`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [sellerId]);

  const filtered = useMemo(() => {
    if (range === 'all') return rows;

    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 0;

    if (!days) return rows;

    const minDate = new Date(now);
    minDate.setDate(now.getDate() - days);

    return rows.filter((order) => {
      if (!order.created_at) return false;
      return new Date(order.created_at) >= minDate;
    });
  }, [rows, range]);

  const summary = useMemo(() => {
    const total = filtered.length;

    const delivered = filtered.filter(
      (order) => order.status === 'delivered'
    ).length;

    const pending = filtered.filter(
      (order) => (order.status || 'pending') === 'pending'
    ).length;

    const returned = filtered.filter(
      (order) => order.status === 'returned'
    ).length;

    const cancelled = filtered.filter(
      (order) => order.status === 'cancelled'
    ).length;

    const codOrders = filtered.filter(
      (order) => (order.payment_type || order.paymentType) === 'COD'
    ).length;

    const prepaidOrders = filtered.filter((order) =>
      ['Card', 'Bank Transfer'].includes(order.payment_type || order.paymentType)
    ).length;

    const totalRevenue = filtered.reduce(
      (sum, order) => sum + Number(order.price || 0),
      0
    );

    const deliveredRevenue = filtered
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + Number(order.price || 0), 0);

    const averageOrderValue = total > 0 ? totalRevenue / total : 0;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    const returnRate = total > 0 ? Math.round((returned / total) * 100) : 0;
    const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;

    return {
      total,
      delivered,
      pending,
      returned,
      cancelled,
      codOrders,
      prepaidOrders,
      totalRevenue,
      deliveredRevenue,
      averageOrderValue,
      successRate,
      returnRate,
      pendingRate,
    };
  }, [filtered]);

  const reportRangeLabel =
    range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time';

  const cards = [
    {
      label: 'Total Orders',
      value: summary.total,
      description: 'Orders in selected range',
      icon: <ShoppingBagOutlinedIcon />,
      bg: '#EEF4FF',
      color: '#2563EB',
    },
    {
      label: 'Delivered',
      value: summary.delivered,
      description: `${summary.successRate}% success rate`,
      icon: <CheckCircleOutlineIcon />,
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      label: 'Pending',
      value: summary.pending,
      description: `${summary.pendingRate}% still pending`,
      icon: <AccessTimeOutlinedIcon />,
      bg: '#FFF7ED',
      color: '#EA580C',
    },
    {
      label: 'Returned',
      value: summary.returned,
      description: `${summary.returnRate}% return rate`,
      icon: <AssignmentReturnOutlinedIcon />,
      bg: '#FEF2F2',
      color: '#DC2626',
    },
  ];

  return (
    <AppShell role="seller" title="Seller Reports">
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
                <AssessmentOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.8 }}>
                  <Chip
                    size="small"
                    label="Seller Reports"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />

                  <Chip
                    size="small"
                    label={reportRangeLabel}
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.22)',
                      color: '#DCFCE7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Seller Reports
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Review order performance, revenue, delivery success, and payment insights.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <Button
                variant="contained"
                startIcon={<RefreshOutlinedIcon />}
                onClick={fetchReportData}
                disabled={loading || !sellerId}
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
                Refresh
              </Button>

              <Button
                variant="contained"
                startIcon={<PrintOutlinedIcon />}
                onClick={() => window.print()}
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
                Print
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

        {!sellerId ? (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
            Seller ID not found. Please login again.
          </Alert>
        ) : null}

        {/* Filter */}
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
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Report Range
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Select a date range to calculate seller performance.
              </Typography>
            </Box>

            <TextField
              size="small"
              select
              label="Range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#F8FAFC',
                },
              }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        {/* Main Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <ReportCard card={card} loading={loading} />
            </Grid>
          ))}
        </Grid>

        {/* Revenue + Performance */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
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
                    Revenue Summary
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Order value and delivered revenue for {reportRangeLabel.toLowerCase()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PaymentsOutlinedIcon />
                </Box>
              </Stack>

              {loading ? (
                <Stack spacing={2}>
                  <Skeleton height={44} width="60%" />
                  <Skeleton height={28} />
                  <Skeleton height={28} />
                </Stack>
              ) : (
                <>
                  <Typography variant="h3" fontWeight={900}>
                    {formatCurrency(summary.totalRevenue)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Total order value from {summary.total} order
                    {summary.total === 1 ? '' : 's'}.
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={2}>
                    <MiniMetric
                      label="Delivered Revenue"
                      value={formatCurrency(summary.deliveredRevenue)}
                    />

                    <MiniMetric
                      label="Average Order Value"
                      value={formatCurrency(summary.averageOrderValue)}
                    />

                    <MiniMetric label="COD Orders" value={summary.codOrders} />

                    <MiniMetric label="Prepaid Orders" value={summary.prepaidOrders} />
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
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
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: '#DBEAFE',
                    color: '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpOutlinedIcon />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Performance Overview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Delivery health for selected range
                  </Typography>
                </Box>
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
                    label="Success Rate"
                    value={`${summary.successRate}%`}
                    percentage={summary.successRate}
                    color="success"
                  />

                  <ProgressRow
                    label="Pending Rate"
                    value={`${summary.pendingRate}%`}
                    percentage={summary.pendingRate}
                    color="warning"
                  />

                  <ProgressRow
                    label="Return Rate"
                    value={`${summary.returnRate}%`}
                    percentage={summary.returnRate}
                    color="error"
                  />

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Cancelled Orders
                    </Typography>

                    <Typography variant="h5" fontWeight={900}>
                      {summary.cancelled}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AppShell>
  );
}

function ReportCard({ card, loading }) {
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

function MiniMetric({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: '#F8FAFC',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography variant="h6" fontWeight={900}>
          {value}
        </Typography>
      </Box>
    </Grid>
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
          {value}
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

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}