import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const FeedbackDisplay = ({ feedback }) => {
    const getFeedbackSx = () => {
        const baseSx = {
            p: 3,
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease-in-out'
        };

        switch (feedback.severity) {
            case 'success':
                return {
                    ...baseSx,
                    bgcolor: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    border: '2px solid #4caf50',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #4caf50, #66bb6a, #4caf50)',
                        animation: 'successPulse 2s ease-in-out infinite'
                    }
                };
            case 'warning':
                return {
                    ...baseSx,
                    bgcolor: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                    color: 'white',
                    border: '2px solid #ff9800',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #ff9800, #ffb74d, #ff9800)',
                        animation: 'warningPulse 2s ease-in-out infinite'
                    }
                };
            case 'error':
                return {
                    ...baseSx,
                    bgcolor: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                    color: 'white',
                    border: '2px solid #f44336',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #f44336, #ef5350, #f44336)',
                        animation: 'errorShake 0.5s ease-in-out'
                    }
                };
            case 'info':
                return {
                    ...baseSx,
                    bgcolor: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                    color: 'white',
                    border: '2px solid #2196f3'
                };
            default:
                return { ...baseSx, bgcolor: 'background.paper', color: 'text.primary' };
        }
    };

    const FeedbackIcon = () => {
        switch (feedback.severity) {
            case 'success': return <CheckCircleOutlineIcon />;
            case 'error': return <HighlightOffIcon />;
            default: return null;
        }
    };

    return (
        <Box sx={{
            ...getFeedbackSx(),
            minHeight: '80px',
            display: 'flex',
            alignItems: 'center'
        }}>
            <FeedbackIcon />
            <Typography dangerouslySetInnerHTML={{ __html: feedback.message }} />
        </Box>
    );
};

export default FeedbackDisplay;
