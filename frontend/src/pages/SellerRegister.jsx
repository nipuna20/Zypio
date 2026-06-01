import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
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

import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BrandLogo from '../components/BrandLogo';

import api from '../services/api';

function SellerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    businessRegNo: '',
    email: '',
    telephone: '',
    nic: '',
    address: '',
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
        setError('Please enter your seller name.');
        return;
      }

      if (!form.businessRegNo.trim()) {
        setError('Please enter your business registration number.');
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

      if (!form.nic.trim()) {
        setError('Please enter your NIC number.');
        return;
      }

      if (!form.address.trim()) {
        setError('Please enter your business address.');
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
        businessRegNo: form.businessRegNo.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        nic: form.nic.trim(),
        address: form.address.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      const res = await api.post('/auth/seller/register', payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', 'seller');
      localStorage.setItem('sellerId', String(res.data.seller.id));

      navigate('/seller/dashboard');
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
            minHeight: { xs: 'auto', md: 760 },
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
                  label="Seller Registration"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.16)',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                />

                <Chip
                  label="Business Account"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(34,197,94,0.22)',
                    color: '#DCFCE7',
                    fontWeight: 800,
                  }}
                />
              </Stack>

              {/* <Box
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
                <StorefrontOutlinedIcon sx={{ fontSize: 42 }} />
              </Box> */}

              <Box sx={{ mb: 3 }}>
  <BrandLogo variant="light" size={64} />
</Box>

              <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                Start selling with a professional delivery workflow.
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
                Create your seller account to share customer order forms, track orders,
                download waybills, and view seller reports.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <FeatureItem
                icon={<LinkOutlinedIcon />}
                title="Share customer order links"
                text="Send a simple form link to customers and collect order details."
              />

              <FeatureItem
                icon={<ShoppingBagOutlinedIcon />}
                title="Manage all orders"
                text="Track customer information, payment type, waybills, and order status."
              />

              <FeatureItem
                icon={<AssessmentOutlinedIcon />}
                title="View seller reports"
                text="Monitor order performance, revenue, COD value, and returns."
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
            <Box sx={{ width: '100%', maxWidth: 520 }}>
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
                  Seller Registration
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  Create your seller account to manage customer orders.
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
                  <Stack spacing={2.5}>
                    {/* Business Details */}
                    <Box>
                      <SectionTitle
                        icon={<BusinessOutlinedIcon />}
                        title="Business Details"
                        subtitle="Enter your business and identification information."
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Seller / Business Name"
                            name="name"
                            placeholder="Enter seller or business name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StorefrontOutlinedIcon />
                                </InputAdornment>
                              ),
                            }}
                            sx={fieldStyle}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Business Registration No"
                            name="businessRegNo"
                            placeholder="Enter BR number"
                            value={form.businessRegNo}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessOutlinedIcon />
                                </InputAdornment>
                              ),
                            }}
                            sx={fieldStyle}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="NIC"
                            name="nic"
                            placeholder="Enter NIC number"
                            value={form.nic}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BadgeOutlinedIcon />
                                </InputAdornment>
                              ),
                            }}
                            sx={fieldStyle}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Business Address"
                            name="address"
                            placeholder="Enter business address"
                            value={form.address}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            multiline
                            minRows={2}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PlaceOutlinedIcon />
                                </InputAdornment>
                              ),
                            }}
                            sx={fieldStyle}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Contact Details */}
                    <Box>
                      <SectionTitle
                        icon={<EmailOutlinedIcon />}
                        title="Contact Details"
                        subtitle="These details will be used for seller account communication."
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="Enter email address"
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
                            sx={fieldStyle}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Telephone"
                            name="telephone"
                            placeholder="Enter phone number"
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
                            sx={fieldStyle}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Security Details */}
                    <Box>
                      <SectionTitle
                        icon={<SecurityOutlinedIcon />}
                        title="Account Security"
                        subtitle="Create a secure password for your seller account."
                      />

                      <Stack spacing={2.2}>
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
                            sx={fieldStyle}
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
                          sx={fieldStyle}
                        />
                      </Stack>
                    </Box>

                    <Alert
                      severity="info"
                      icon={<CheckCircleOutlineIcon />}
                      sx={{ borderRadius: 3 }}
                    >
                      After registration, your seller account may require admin approval before full access is available.
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
                      {loading ? 'Creating account...' : 'Create Seller Account'}
                    </Button>
                  </Stack>
                </form>
              </Paper>

              <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/seller/login"
                    underline="hover"
                    sx={{ fontWeight: 900 }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.8 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 3,
          bgcolor: '#DBEAFE',
          color: '#1D4ED8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
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

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: '#fff',
  },
};

export default SellerRegister;