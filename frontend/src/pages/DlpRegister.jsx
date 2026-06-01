import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import api from '../services/api';

/**
 * Registration page for delivery partners.
 */
function DlpRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (form.password.length >= 6) score += 25;
    if (form.password.length >= 8) score += 25;
    if (/[A-Z]/.test(form.password)) score += 15;
    if (/[0-9]/.test(form.password)) score += 15;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 20;

    return Math.min(score, 100);
  }, [form.password]);

  const passwordStrengthLabel = useMemo(() => {
    if (!form.password) return 'Not started';
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 75) return 'Medium';
    return 'Strong';
  }, [form.password, passwordStrength]);

  const passwordStrengthColor = useMemo(() => {
    if (passwordStrength < 40) return 'error';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  }, [passwordStrength]);

  const passwordsMatch =
    form.password && form.confirmPassword && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (!form.name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      if (!form.email.trim()) {
        setError('Please enter your email address.');
        return;
      }

      if (!form.telephone.trim()) {
        setError('Please enter your telephone number.');
        return;
      }

      if (!form.password.trim()) {
        setError('Please enter a password.');
        return;
      }

      if (form.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        password: form.password,
      };

      const res = await api.post('/auth/dlp/register', payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', 'dlp');
      localStorage.setItem('dlpId', String(res.data.dlp.id));

      navigate('/dlp/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            minHeight: { xs: 'auto', md: 700 },
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
                  label="Delivery Partner Registration"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.16)',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                />

                <Chip
                  label="Admin Approval Required"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(251,191,36,0.25)',
                    color: '#FEF3C7',
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
                Join as a delivery partner.
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
                Register your delivery partner account to receive assigned orders, update delivery status, and manage COD collection.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <FeatureItem
                icon={<RouteOutlinedIcon />}
                title="Receive assigned orders"
                text="View delivery jobs assigned by the admin team."
              />

              <FeatureItem
                icon={<Inventory2OutlinedIcon />}
                title="Update delivery progress"
                text="Manage pickup, warehouse, delivery, return, and failed delivery stages."
              />

              <FeatureItem
                icon={<PaymentsOutlinedIcon />}
                title="Collect COD payments"
                text="Mark cash-on-delivery payments as collected after successful delivery."
              />
            </Stack>
          </Box>

          {/* Register Section */}
          <Box
            sx={{
              p: { xs: 3, sm: 5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F8FAFC',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 480 }}>
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
                  <PersonAddAltOutlinedIcon sx={{ fontSize: 38 }} />
                </Box>

                <Typography variant="h4" fontWeight={900}>
                  Delivery Partner Registration
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  Create your account and wait for admin approval.
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
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="name"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutlineOutlinedIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={form.email}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="email"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailOutlinedIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Telephone"
                          name="telephone"
                          placeholder="Enter your phone number"
                          value={form.telephone}
                          onChange={handleChange}
                          disabled={loading}
                          autoComplete="tel"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneOutlinedIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box>
                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        placeholder="Create password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        disabled={loading}
                        autoComplete="new-password"
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

                      <Box sx={{ mt: 1 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.7 }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Password strength
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={900}
                            color={`${passwordStrengthColor}.main`}
                          >
                            {passwordStrengthLabel}
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength}
                          color={passwordStrengthColor}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: 'rgba(148, 163, 184, 0.18)',
                          }}
                        />
                      </Box>
                    </Box>

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="new-password"
                      required
                      error={Boolean(form.confirmPassword) && !passwordsMatch}
                      helperText={
                        form.confirmPassword && !passwordsMatch
                          ? 'Passwords do not match'
                          : passwordsMatch
                            ? 'Passwords match'
                            : ''
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                              edge="end"
                              disabled={loading}
                            >
                              {showConfirmPassword ? (
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

                    <Alert
                      severity="info"
                      icon={<SecurityOutlinedIcon />}
                      sx={{ borderRadius: 3 }}
                    >
                      After registration, your account may require admin approval before full access is available.
                    </Alert>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<PersonAddAltOutlinedIcon />}
                      disabled={loading}
                      sx={{
                        py: 1.25,
                        borderRadius: 3,
                        fontWeight: 900,
                        textTransform: 'none',
                        boxShadow: 'none',
                      }}
                    >
                      {loading ? 'Creating account...' : 'Create DLP Account'}
                    </Button>
                  </Stack>
                </form>
              </Paper>

              <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/dlp/login"
                    underline="hover"
                    sx={{ fontWeight: 900 }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>

              <Stack
                direction="row"
                justifyContent="center"
                spacing={1}
                alignItems="center"
                sx={{ mt: 3 }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 18, color: 'text.secondary' }}
                />

                <Typography variant="caption" color="text.secondary">
                  Your information will be reviewed by the admin team.
                </Typography>
              </Stack>
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

export default DlpRegister;