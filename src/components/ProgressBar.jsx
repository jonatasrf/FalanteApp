import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const ProgressBar = ({ current, total }) => {
    const progress = (current / total) * 100;

    return (
        <Box sx={{ mb: 2 }}>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00ffff',
                        borderRadius: 4,
                    }
                }}
            />
            <Typography variant="caption" sx={{ color: '#e0e0e0', mt: 0.5, display: 'block', textAlign: 'center' }}>
                {Math.round(progress)}% Complete
            </Typography>
        </Box>
    );
};

export default ProgressBar;
