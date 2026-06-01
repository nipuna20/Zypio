import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

/**
 * A simple statistic card used in dashboards to display metrics.
 * @param {string} label - The label for the metric
 * @param {string|number} value - The value to display
 * @param {string} subtitle - Optional subtitle below the value
 */
export default function StatCard({ label, value, subtitle }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid #eaecef', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
          {value}
        </Typography>
        {subtitle ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}