import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Box } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function LevelUpPopup({ open, newLevel, levelUpMessage, onClose }) {
    // Allow closing with Enter key
    useEffect(() => {
        if (!open) return;

        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [open, onClose]);
    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="level-up-popup-title">
            <DialogTitle id="level-up-popup-title" sx={{ textAlign: 'center', color: '#ffc107' }}>
                <EmojiEventsIcon sx={{ fontSize: 60 }} />
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="div" gutterBottom>
                    Level Up!
                </Typography>
                <DialogContentText>
                    {levelUpMessage}
                </DialogContentText>
                <Typography variant="h4" sx={{ mt: 2 }}>
                    You are now Level {newLevel}!
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={onClose} variant="contained">Continue</Button>
            </DialogActions>
        </Dialog>
    );
}
