import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
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

import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import AppShell from '../../layout/AppShell';
import api from '../../services/api';

/**
 * Page for admins to approve pending sellers.
 */
export default function SellerApprovals() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await api.get('/admin/sellers', {
        params: { approved: 'false' },
      });

      setRows(res.data.data.items || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id, name) => {
    try {
      setApprovingId(id);
      setError('');
      setSuccess('');

      await api.patch(`/admin/sellers/${id}/approve`);

      setSuccess(`${name || 'Seller'} approved successfully.`);
      await fetchPending();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to approve seller');
    } finally {
      setApprovingId(null);
    }
  };

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((seller) => {
      return (
        seller.name?.toLowerCase().includes(keyword) ||
        seller.email?.toLowerCase().includes(keyword) ||
        seller.telephone?.toLowerCase().includes(keyword) ||
        seller.business_reg_no?.toLowerCase().includes(keyword)
      );
    });
  }, [rows, search]);

  return (
    <AppShell role="admin" title="Seller Approvals">
      <Box sx={{ pb: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 4,
            background:
              'linear-gradient(135deg, #111827 0%, #1E40AF 55%, #2563EB 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
              right: -80,
              top: -90,
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
                  width: 58,
                  height: 58,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.16)',
                }}
              >
                <StorefrontOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.7 }}>
                  <Chip
                    size="small"
                    label="Admin Review"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />

                  <Chip
                    size="small"
                    label={`${rows.length} Pending`}
                    sx={{
                      bgcolor: 'rgba(251,191,36,0.25)',
                      color: '#FEF3C7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Seller Approvals
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Review and approve sellers before they start adding orders.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RefreshOutlinedIcon />}
              onClick={fetchPending}
              disabled={loading}
              sx={{
                bgcolor: '#fff',
                color: '#1E40AF',
                fontWeight: 900,
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

        {/* Main Content */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          {/* Toolbar */}
          <Box sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Pending Sellers
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Approve verified sellers to activate their seller dashboard access.
                </Typography>
              </Box>

              <TextField
                size="small"
                placeholder="Search seller, email, phone, reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  minWidth: { xs: '100%', sm: 360 },
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
          </Box>

          <Divider />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: '#F8FAFC',
                    '& th': {
                      fontWeight: 900,
                      color: '#475569',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  <TableCell>Seller</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telephone</TableCell>
                  <TableCell>Business Reg No</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <LoadingRows />
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((seller) => (
                    <TableRow
                      key={seller.id}
                      hover
                      sx={{
                        '& td': {
                          py: 2,
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: '#DBEAFE',
                              color: '#1D4ED8',
                              fontWeight: 900,
                            }}
                          >
                            {getInitials(seller.name)}
                          </Avatar>

                          <Box>
                            <Typography fontWeight={900}>
                              {seller.name || 'Unnamed Seller'}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              Seller Account
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {seller.email || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {seller.telephone || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          icon={<BusinessOutlinedIcon />}
                          label={seller.business_reg_no || 'Not provided'}
                          variant="outlined"
                          sx={{
                            fontWeight: 800,
                            maxWidth: 220,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label="Pending Approval"
                          sx={{
                            bgcolor: '#FFF7ED',
                            color: '#C2410C',
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Approve seller">
                          <span>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={
                                approvingId === seller.id ? (
                                  <CircularProgress size={16} color="inherit" />
                                ) : (
                                  <CheckCircleOutlineIcon />
                                )
                              }
                              disabled={approvingId === seller.id}
                              onClick={() => approve(seller.id, seller.name)}
                              sx={{
                                borderRadius: 3,
                                fontWeight: 900,
                                textTransform: 'none',
                                boxShadow: 'none',
                                bgcolor: '#16A34A',
                                '&:hover': {
                                  bgcolor: '#15803D',
                                  boxShadow: 'none',
                                },
                              }}
                            >
                              {approvingId === seller.id ? 'Approving...' : 'Approve'}
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
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

function LoadingRows() {
  return Array.from({ length: 4 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={42} height={42} />
          <Box>
            <Skeleton width={150} height={22} />
            <Skeleton width={90} height={18} />
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Skeleton width={180} height={24} />
      </TableCell>

      <TableCell>
        <Skeleton width={120} height={24} />
      </TableCell>

      <TableCell>
        <Skeleton width={150} height={30} />
      </TableCell>

      <TableCell>
        <Skeleton width={120} height={30} />
      </TableCell>

      <TableCell align="right">
        <Skeleton width={90} height={34} sx={{ ml: 'auto' }} />
      </TableCell>
    </TableRow>
  ));
}

function EmptyState({ search }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
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
        <StorefrontOutlinedIcon sx={{ fontSize: 36 }} />
      </Box>

      <Typography variant="h6" fontWeight={900}>
        {search ? 'No matching sellers' : 'No pending sellers'}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {search
          ? 'Try searching with another seller name, email, phone number, or business registration number.'
          : 'All sellers are already reviewed and approved.'}
      </Typography>
    </Box>
  );
}

function getInitials(name = '') {
  const words = name.trim().split(' ').filter(Boolean);

  if (words.length === 0) return 'SE';

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}