import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import AppShell from '../../layout/AppShell';
import api from '../../services/api';

/**
 * SortScan page allows DLPs or admins to scan a waybill barcode after sorting at the sorting centre.
 * Upon scanning, the order status is updated to 'sorted'.
 */
export default function SortScan() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  const scanSort = async () => {
    const value = trackingNumber.trim();
    try {
      setMessage('');
      setError('');
      if (!value) {
        setError('Please scan or enter tracking number');
        focusInput();
        return;
      }
      setLoading(true);
      const res = await api.patch('/orders/scan-sort', { trackingNumber: value });
      const successMessage = res.data.message || 'Order sorting scan successful';
      setMessage(successMessage);
      setScanHistory((prev) => [
        { trackingNumber: value, status: 'success', message: successMessage, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
      setTrackingNumber('');
      focusInput();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to scan sort';
      setError(errorMessage);
      setScanHistory((prev) => [
        { trackingNumber: value, status: 'error', message: errorMessage, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
      setTrackingNumber('');
      focusInput();
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      scanSort();
    }
  };
  const clearInput = () => {
    setTrackingNumber('');
    setMessage('');
    setError('');
    focusInput();
  };
  return (
    <AppShell role="dlp" title="Sort Scan">
      <Box sx={{ pb: 4 }}>
        <Paper
          elevation={0}
          sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: 4, color: '#fff', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 55%, #2563EB 100%)' }}
        >
          <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', right: -80, top: -100 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 62, height: 62, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCodeScannerOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 0.8 }}>
                  <Chip size="small" label="Barcode Scanner" sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 800 }} />
                  <Chip size="small" label="Sorting" sx={{ bgcolor: 'rgba(34,197,94,0.22)', color: '#DCFCE7', fontWeight: 800 }} />
                </Stack>
                <Typography variant="h4" fontWeight={900}>Scan Sort</Typography>
                <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>Scan a waybill barcode after sorting to update its status.</Typography>
              </Box>
            </Stack>
            <Button variant="contained" startIcon={<QrCodeScannerOutlinedIcon />} onClick={() => inputRef.current?.focus()} sx={{ bgcolor: '#fff', color: '#1E40AF', borderRadius: 3, fontWeight: 900, px: 2.5, boxShadow: 'none', '&:hover': { bgcolor: '#F8FAFC', boxShadow: 'none' } }}>
              Focus Scanner
            </Button>
          </Stack>
        </Paper>
        {message ? (<Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 2, borderRadius: 3 }}>{message}</Alert>) : null}
        {error ? (<Alert severity="error" icon={<ErrorOutlineOutlinedIcon />} sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>) : null}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', flex: 1 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={900}>Scan Waybill Barcode</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Keep the cursor inside the box. After scanning, press Enter or let the scanner send Enter automatically.</Typography>
              </Box>
              <Box onClick={() => inputRef.current?.focus()} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: '2px dashed', borderColor: trackingNumber ? '#2563EB' : '#CBD5E1', bgcolor: trackingNumber ? '#EFF6FF' : '#F8FAFC', transition: '0.2s ease', cursor: 'text' }}>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Box sx={{ width: 86, height: 86, borderRadius: '50%', bgcolor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCodeScannerOutlinedIcon sx={{ fontSize: 46 }} />
                  </Box>
                  <TextField inputRef={inputRef} fullWidth autoFocus label="Tracking Number" placeholder="Scan barcode or enter tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} InputProps={{ startAdornment: (<InputAdornment position="start"><LocalShippingOutlinedIcon /></InputAdornment>), endAdornment: trackingNumber ? (<InputAdornment position="end"><Button size="small" onClick={clearInput} startIcon={<ClearOutlinedIcon />} sx={{ fontWeight: 800 }}>Clear</Button></InputAdornment>) : null, }} sx={{ maxWidth: 520, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff', fontSize: 18, fontWeight: 800 } }} />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
                    <Button variant="contained" size="large" onClick={scanSort} disabled={loading || !trackingNumber.trim()} startIcon={loading ? (<CircularProgress size={18} color="inherit" />) : (<LocalShippingOutlinedIcon />)} sx={{ borderRadius: 3, fontWeight: 900, px: 3, boxShadow: 'none' }}>{loading ? 'Scanning...' : 'Scan Sort'}</Button>
                    <Button variant="outlined" size="large" startIcon={<KeyboardReturnOutlinedIcon />} onClick={scanSort} disabled={loading || !trackingNumber.trim()} sx={{ borderRadius: 3, fontWeight: 900, px: 3 }}>Enter</Button>
                  </Stack>
                </Stack>
              </Box>
              <Alert severity="info" sx={{ borderRadius: 3 }}>For best results, print the barcode clearly, avoid very small barcode size, and make sure the scanner sends an Enter key after scanning.</Alert>
            </Stack>
          </Paper>
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', width: { xs: '100%', lg: 380 } }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Recent Scans</Typography>
              {scanHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No scans yet.</Typography>
              ) : (
                scanHistory.map((scan, index) => (
                  <Stack key={index} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.2, borderRadius: 3, bgcolor: scan.status === 'success' ? '#ECFDF5' : '#FEF2F2' }}>
                    {scan.status === 'success' ? (<CheckCircleOutlineIcon sx={{ color: '#059669' }} />) : (<ErrorOutlineOutlinedIcon sx={{ color: '#DC2626' }} />)}
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{scan.trackingNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">{scan.message}</Typography>
                    </Box>
                    <Box sx={{ marginLeft: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">{scan.time}</Typography>
                    </Box>
                  </Stack>
                ))
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShell>
  );
}