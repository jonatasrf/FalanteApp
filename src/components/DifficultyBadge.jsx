import React from 'react';
import { Box } from '@mui/material';

const DifficultyBadge = ({ difficultyLevel }) => {
    return (
        <Box sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: difficultyLevel === 'easy' ? '#4caf50' :
                difficultyLevel === 'normal' ? '#ff9800' : '#f44336',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }}>
            {difficultyLevel === 'easy' ? '🐣 Easy' :
                difficultyLevel === 'normal' ? '⚖️ Normal' : '🔥 Hard'}
        </Box>
    );
};

export default DifficultyBadge;
