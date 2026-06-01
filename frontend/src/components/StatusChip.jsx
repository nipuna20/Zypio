import React from 'react';
import { Chip } from '@mui/material';

// Map statuses to MUI chip color names
const map = {
  pending: 'warning',
  confirmed: 'info',
  packed: 'info',
  assigned_to_rider: 'info',
  assigned_to_dlp: 'info',
  pickup_scheduled: 'info',
  picked_up: 'info',
  at_warehouse: 'info',
  out_for_delivery: 'primary',
  delivered: 'success',
  failed_delivery: 'error',
  returned: 'default',
  cancelled: 'default',
};

export default function StatusChip({ status }) {
  return (
    <Chip
      label={status || 'pending'}
      color={map[status] || 'default'}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
}