import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import logo from '../assets/logo.png';

export default function BrandLogo({
  variant = 'dark',
  size = 48,
  showText = true,
//   subtitle = 'Delivery Management System',
}) {
  const isLight = variant === 'light';

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        component="img"
        src={logo}
        alt="Company Logo"
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: 2,
          alignItems: 'center',
          p: 0.5,
          boxShadow: isLight ? '0 10px 25px rgba(0,0,0,0.18)' : 'none',
        }}
      />

      {showText ? (
        <Box>
          {/* <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              lineHeight: 1.1,
              color: isLight ? '#fff' : 'text.primary',
            }}
          >
            Zypio
          </Typography> */}

          <Typography
            variant="caption"
            sx={{
              color: isLight ? 'rgba(255,255,255,0.72)' : 'text.secondary',
              fontWeight: 700,
            }}
          >
           
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}