import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

import AppShell from '../../layout/AppShell';

/**
 * Page for sellers to copy their customer order form link.
 */
export default function SellerShareLink() {
  const sellerId = localStorage.getItem('sellerId');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const link = useMemo(() => {
    if (!sellerId) return '';
    return `${window.location.origin}/order-form/${sellerId}`;
  }, [sellerId]);

  const copy = async () => {
    try {
      if (!link) {
        setError('Order form link is not available. Please login again.');
        return;
      }

      await navigator.clipboard.writeText(link);
      setError('');
      setSuccess('Order form link copied successfully.');
    } catch (err) {
      setSuccess('');
      setError('Failed to copy link. Please copy it manually.');
    }
  };

  const openLink = () => {
    if (!link) return;
    window.open(link, '_blank');
  };

  const shareLink = async () => {
    try {
      if (!link) {
        setError('Order form link is not available. Please login again.');
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Customer Order Form',
          text: 'Please use this link to submit your order details.',
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(link);
        setSuccess('Sharing is not supported on this device, so the link was copied instead.');
      }
    } catch (err) {
      setError('Unable to share the link.');
    }
  };

  return (
    <AppShell role="seller" title="Share Order Link">
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
                <LinkOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.8 }}>
                  <Chip
                    size="small"
                    label="Seller Tool"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  />

                  <Chip
                    size="small"
                    label="Customer Order Form"
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.22)',
                      color: '#DCFCE7',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography variant="h4" fontWeight={900}>
                  Share Order Link
                </Typography>

                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                  Share this link with customers to collect delivery and payment details.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<OpenInNewOutlinedIcon />}
              onClick={openLink}
              disabled={!link}
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
              Open Form
            </Button>
          </Stack>
        </Paper>

        {/* Alerts */}
        {!sellerId ? (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
            Seller ID not found. Please login again to generate your customer order form link.
          </Alert>
        ) : null}

        {success ? (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            sx={{ mb: 2, borderRadius: 3 }}
          >
            {success}
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          {/* Main Share Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              flex: 1,
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Customer Order Form Link
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Customers can use this link to submit item, address, contact, and payment information.
                </Typography>
              </Box>

              <TextField
                fullWidth
                value={link || 'Login again to load your order form link'}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy link">
                        <span>
                          <IconButton onClick={copy} disabled={!link}>
                            <ContentCopyOutlinedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                    fontWeight: 700,
                  },
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={copy}
                  disabled={!link}
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
                  size="large"
                  startIcon={<ShareOutlinedIcon />}
                  onClick={shareLink}
                  disabled={!link}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 900,
                    textTransform: 'none',
                  }}
                >
                  Share
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<OpenInNewOutlinedIcon />}
                  onClick={openLink}
                  disabled={!link}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 900,
                    textTransform: 'none',
                  }}
                >
                  Open
                </Button>
              </Stack>

              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Send this link through WhatsApp, Facebook, SMS, or email. Every customer order submitted through this form will appear in your seller orders page.
              </Alert>
            </Stack>
          </Paper>

          {/* Help Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              width: { xs: '100%', lg: 380 },
              background:
                'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,1))',
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 4,
                  bgcolor: '#DBEAFE',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StorefrontOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={900}>
                  How this works
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Share the link with your customer. The customer fills the form. Then the order will be available in your seller dashboard.
                </Typography>
              </Box>

              <Divider />

              <Stack spacing={1.5}>
                <HelpStep number="1" title="Copy your order form link" />
                <HelpStep number="2" title="Send it to your customer" />
                <HelpStep number="3" title="Customer submits order details" />
                <HelpStep number="4" title="Track the order from Seller Orders" />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShell>
  );
}

function HelpStep({ number, title }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          bgcolor: '#2563EB',
          color: '#fff',
          fontSize: 13,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {number}
      </Box>

      <Typography variant="body2" fontWeight={800}>
        {title}
      </Typography>
    </Stack>
  );
}