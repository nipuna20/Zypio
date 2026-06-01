import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import api from '../services/api';

function OrderForm() {
  const { sellerId } = useParams();

  const [form, setForm] = useState({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    itemName: '',
    price: '',
    deliveryAddress: '',
    paymentType: 'COD',
    paid: false,
    bankSlip: null,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const paymentHelper = useMemo(() => {
    if (form.paymentType === 'COD') {
      return 'You can pay when the item is delivered.';
    }

    if (form.paymentType === 'Card') {
      return 'Card payment will be recorded as a prepaid order.';
    }

    if (form.paymentType === 'Bank Transfer') {
      return 'Please upload your bank transfer slip if available.';
    }

    return '';
  }, [form.paymentType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      bankSlip: e.target.files?.[0] || null,
    }));
  };

  const handlePaidChange = (e) => {
    setForm((prev) => ({
      ...prev,
      paid: e.target.checked,
    }));
  };

  const validateForm = () => {
    if (!form.customerName.trim()) return 'Please enter customer name.';
    if (!form.customerAddress.trim()) return 'Please enter customer address.';
    if (!form.customerPhone.trim()) return 'Please enter customer phone number.';
    if (!form.itemName.trim()) return 'Please enter item name.';
    if (!form.price || Number(form.price) <= 0) return 'Please enter a valid price.';
    if (!form.deliveryAddress.trim()) return 'Please enter delivery address.';

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setMessage('');

      const validationError = validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setSubmitting(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'bankSlip') {
          if (value) {
            data.append('bankSlip', value);
          }
        } else {
          data.append(key, value);
        }
      });

      await api.post(`/seller/${sellerId}/orders`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Order submitted successfully. Thank you!');

      setForm({
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        itemName: '',
        price: '',
        deliveryAddress: '',
        paymentType: 'COD',
        paid: false,
        bankSlip: null,
      });

      const fileInput = document.getElementById('bank-slip-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
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
              width: 240,
              height: 240,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
              right: -80,
              top: -100,
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 0.8, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label="Customer Order Form"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                />

                <Chip
                  size="small"
                  label="Secure Submission"
                  sx={{
                    bgcolor: 'rgba(34,197,94,0.22)',
                    color: '#DCFCE7',
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Typography variant="h4" fontWeight={900}>
                Place Your Order
              </Typography>

              <Typography sx={{ mt: 0.6, color: 'rgba(255,255,255,0.78)' }}>
                Fill in your delivery and payment details carefully.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Alerts */}
        {message ? (
          <Alert
            severity="success"
            icon={<CheckCircleOutlineIcon />}
            sx={{ mb: 2, borderRadius: 3 }}
          >
            {message}
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        ) : null}

        {!sellerId ? (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
            Seller link is invalid. Please check the order form link again.
          </Alert>
        ) : null}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Stack spacing={3}>
              {/* Customer Details */}
              <Box>
                <SectionTitle
                  icon={<PersonOutlineOutlinedIcon />}
                  title="Customer Details"
                  subtitle="Enter the receiver contact information."
                />

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Customer Name"
                      name="customerName"
                      placeholder="Enter full name"
                      value={form.customerName}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineOutlinedIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyle}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Customer Phone"
                      name="customerPhone"
                      placeholder="Enter phone number"
                      value={form.customerPhone}
                      onChange={handleChange}
                      disabled={submitting}
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Customer Address"
                      name="customerAddress"
                      placeholder="Enter customer address"
                      value={form.customerAddress}
                      onChange={handleChange}
                      disabled={submitting}
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

              {/* Order Details */}
              <Box>
                <SectionTitle
                  icon={<Inventory2OutlinedIcon />}
                  title="Order Details"
                  subtitle="Enter item and delivery information."
                />

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      name="itemName"
                      placeholder="Example: T-shirt, Shoes, Bag"
                      value={form.itemName}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory2OutlinedIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyle}
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="price"
                      type="number"
                      placeholder="Enter amount"
                      value={form.price}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            LKR
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyle}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Delivery Address"
                      name="deliveryAddress"
                      placeholder="Enter delivery address"
                      value={form.deliveryAddress}
                      onChange={handleChange}
                      disabled={submitting}
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

              {/* Payment Details */}
              <Box>
                <SectionTitle
                  icon={<PaymentsOutlinedIcon />}
                  title="Payment Details"
                  subtitle="Choose the customer payment method."
                />

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Payment Type"
                      name="paymentType"
                      value={form.paymentType}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                      sx={fieldStyle}
                    >
                      <MenuItem value="COD">Cash on Delivery</MenuItem>
                      <MenuItem value="Card">Card</MenuItem>
                      <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 3,
                        bgcolor: '#F8FAFC',
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.paid}
                            onChange={handlePaidChange}
                            disabled={submitting || form.paymentType === 'COD'}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={800}>
                              Already Paid
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Use for card or bank transfer payments.
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                      {paymentHelper}
                    </Alert>
                  </Grid>

                  {form.paymentType === 'Bank Transfer' ? (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '1px dashed',
                          borderColor: '#94A3B8',
                          bgcolor: '#F8FAFC',
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography fontWeight={900}>
                              Upload Bank Slip
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              JPG, PNG, or PDF file is recommended.
                            </Typography>

                            {form.bankSlip ? (
                              <Typography
                                variant="caption"
                                color="primary"
                                sx={{ display: 'block', mt: 0.5, fontWeight: 800 }}
                              >
                                Selected: {form.bankSlip.name}
                              </Typography>
                            ) : null}
                          </Box>

                          <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadOutlinedIcon />}
                            disabled={submitting}
                            sx={{
                              borderRadius: 3,
                              fontWeight: 900,
                              textTransform: 'none',
                            }}
                          >
                            Choose File
                            <input
                              id="bank-slip-upload"
                              type="file"
                              name="bankSlip"
                              hidden
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                            />
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  ) : null}
                </Grid>
              </Box>

              <Divider />

              {/* Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#F8FAFC',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Order Amount
                    </Typography>

                    <Typography variant="h5" fontWeight={900}>
                      {formatCurrency(form.price)}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<ReceiptLongOutlinedIcon />}
                    label={form.paymentType}
                    sx={{
                      fontWeight: 900,
                      bgcolor:
                        form.paymentType === 'COD' ? '#FFF7ED' : '#EEF4FF',
                      color:
                        form.paymentType === 'COD' ? '#C2410C' : '#1D4ED8',
                    }}
                  />
                </Stack>
              </Paper>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SendOutlinedIcon />}
                disabled={submitting || !sellerId}
                sx={{
                  py: 1.35,
                  borderRadius: 3,
                  fontWeight: 900,
                  textTransform: 'none',
                  boxShadow: 'none',
                }}
              >
                {submitting ? 'Submitting Order...' : 'Submit Order'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
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

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: '#fff',
  },
};

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default OrderForm;