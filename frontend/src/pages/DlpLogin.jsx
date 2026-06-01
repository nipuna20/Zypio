import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

import api from '../services/api';

/**
 * Login page for delivery partners.
 * Validates the account has been approved before allowing dashboard access.
 */
function DlpLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }

      if (!password.trim()) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);

      const res = await api.post('/auth/dlp/login', {
        email: email.trim(),
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', 'dlp');
      localStorage.setItem('dlpId', String(res.data.dlp.id));

      if (rememberMe) {
        localStorage.setItem('rememberDlp', 'true');
      } else {
        localStorage.removeItem('rememberDlp');
      }

      navigate('/dlp/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'linear-gradient(135deg, #0F172A 0%, #1E3A8A 48%, #2563EB 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
          top: -120,
          right: -100,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
          bottom: -120,
          left: -80,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            minHeight: { xs: 'auto', md: 620 },
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35)',
          }}
        >
          {/* Left Branding Section */}
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              color: '#fff',
              background:
                'linear-gradient(160deg, #111827 0%, #1E40AF 58%, #2563EB 100%)',
              position: 'relative',
              overflow: 'hidden',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 220,
                height: 220,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.08)',
                right: -70,
                top: -70,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
                <Chip
                  label="Delivery Partner Portal"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.16)',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                />

                <Chip
                  label="Approved Access"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(34,197,94,0.22)',
                    color: '#DCFCE7',
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Box
                sx={{
                  width: 74,
                  height: 74,
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <LocalShippingOutlinedIcon sx={{ fontSize: 42 }} />
              </Box>

              <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                Manage deliveries faster and smarter.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  maxWidth: 430,
                  color: 'rgba(255,255,255,0.78)',
                  lineHeight: 1.8,
                }}
              >
                Login to view assigned orders, update delivery status, scan dispatches, and manage COD collections.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <FeatureItem
                icon={<RouteOutlinedIcon />}
                title="Track assigned orders"
                text="View orders assigned to your delivery account."
              />

              <FeatureItem
                icon={<Inventory2OutlinedIcon />}
                title="Update delivery progress"
                text="Move orders through pickup, warehouse, and delivery stages."
              />

              <FeatureItem
                icon={<PaymentsOutlinedIcon />}
                title="Manage COD collection"
                text="Mark COD payments as collected after delivery."
              />
            </Stack>
          </Box>

          {/* Login Section */}
          <Box
            sx={{
              p: { xs: 3, sm: 5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F8FAFC',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 430 }}>
              <Stack alignItems="center" textAlign="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: 4,
                    bgcolor: '#DBEAFE',
                    color: '#1D4ED8',
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <LocalShippingOutlinedIcon sx={{ fontSize: 38 }} />
                </Box>

                <Typography variant="h4" fontWeight={900}>
                  Delivery Partner Login
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  Enter your approved DLP account details.
                </Typography>
              </Stack>

              {error ? (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
                  {error}
                </Alert>
              ) : null}

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#fff',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.2}>
                    <TextField
                      fullWidth
                      label="Email"
                      placeholder="Enter your email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                              disabled={loading}
                            >
                              {showPassword ? (
                                <VisibilityOffOutlinedIcon />
                              ) : (
                                <VisibilityOutlinedIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        },
                      }}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          Remember this device
                        </Typography>
                      }
                    />

                    <Alert
                      severity="info"
                      icon={<SecurityOutlinedIcon />}
                      sx={{ borderRadius: 3 }}
                    >
                      Only approved delivery partners can access the DLP dashboard.
                    </Alert>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<LoginOutlinedIcon />}
                      disabled={loading}
                      sx={{
                        py: 1.25,
                        borderRadius: 3,
                        fontWeight: 900,
                        textTransform: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      {loading ? 'Logging in...' : 'Login to DLP Dashboard'}
                    </Button>
                  </Stack>
                </form>
              </Paper>

              <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/dlp/register"
                    underline="hover"
                    sx={{ fontWeight: 900 }}
                  >
                    Register
                  </Link>
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 3,
                }}
              >
                Your account must be approved by admin before login.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function FeatureItem({ icon, title, text }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontWeight={900}>{title}</Typography>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
          {text}
        </Typography>
      </Box>
    </Stack>
  );
}

export default DlpLogin;