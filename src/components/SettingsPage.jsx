import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Switch, FormControlLabel } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { supabase } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const showToast = useToast();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleDeleteAccount = () => {
        setShowConfirmDialog(true);
    };

    const confirmDeleteAccount = async () => {
        setShowConfirmDialog(false);
        try {
            await supabase.auth.signOut();
            showToast('Your account has been signed out. To permanently delete your account, please visit the Supabase dashboard.', 'info');
        } catch (error) {
            showToast(`Error signing out: ${error.message}`, 'error');
        }
    };

    return (
        <Box component="main" sx={{ width: '100%', minHeight: '100vh' }}>
            <Box
                sx={{
                    marginTop: 4,
                    marginBottom: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '80vh'
                }}
            >
                {/* Header Section */}
                <Box
                    sx={{
                        width: '100%',
                        mb: 4,
                        p: 6,
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                        color: '#ffffff',
                        position: 'relative',
                        textAlign: 'center',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                                radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.2) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.2) 0%, transparent 50%)
                            `,
                            pointerEvents: 'none'
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h3" component="h1" gutterBottom sx={{
                            fontWeight: 'bold',
                            fontSize: '3rem',
                            textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
                            background: 'linear-gradient(45deg, #00ffff, #ff6b6b)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Settings
                        </Typography>

                        <Typography variant="h5" sx={{
                            color: '#ffffff',
                            fontSize: '1.5rem',
                            textShadow: '0 0 15px rgba(0, 255, 255, 0.6)'
                        }}>
                            Manage your account settings ⚙️
                        </Typography>
                    </Box>
                </Box>

                {/* Settings Content */}
                <Box sx={{ width: '100%', maxWidth: 800, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{
                        width: '100%',
                        p: 4,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <SettingsIcon sx={{ mr: 2, color: '#00ffff', fontSize: 30 }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Account Settings
                                </Typography>
                            </Box>

                            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                                Here you can manage your account preferences and settings.
                            </Typography>

                            {/* Theme Settings Section */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#00ffff' }}>
                                    Appearance
                                </Typography>

                                <Box sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {isDarkMode ? (
                                                <Brightness4Icon sx={{ mr: 2, color: '#00ffff' }} />
                                            ) : (
                                                <Brightness7Icon sx={{ mr: 2, color: '#00ffff' }} />
                                            )}
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    Theme Mode
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    {isDarkMode ? 'Dark theme (Falante)' : 'Light theme (Airbnb style)'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={isDarkMode}
                                                    onChange={toggleTheme}
                                                    color="primary"
                                                />
                                            }
                                            label=""
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Account Management Section */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#00ffff' }}>
                                    Account Management
                                </Typography>

                                <Box sx={{ p: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        <strong>Danger Zone:</strong> These actions are permanent and cannot be undone.
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                backgroundColor: 'error.main',
                                                color: 'white'
                                            }
                                        }}
                                        onClick={handleDeleteAccount}
                                    >
                                        Delete Account
                                    </Button>
                                </Box>
                            </Box>

                            {/* Future Settings Sections */}
                            <Box sx={{ opacity: 0.6 }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    More settings options will be available in future updates.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={showConfirmDialog}
                    onClose={() => setShowConfirmDialog(false)}
                    aria-labelledby="confirm-delete-title"
                    aria-describedby="confirm-delete-description"
                    PaperProps={{
                        sx: { borderRadius: 3 }
                    }}
                >
                    <DialogTitle id="confirm-delete-title" sx={{ textAlign: 'center', pb: 1 }}>
                        🗑️ Confirm Account Deletion
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center' }}>
                        <DialogContentText id="confirm-delete-description" sx={{ mb: 2 }}>
                            Are you sure you want to delete your account? This action cannot be undone.
                            All your progress will be permanently lost.
                        </DialogContentText>
                        <DialogContentText sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            To complete the deletion, you will need to visit the Supabase dashboard after signing out.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button
                            onClick={() => setShowConfirmDialog(false)}
                            variant="outlined"
                            sx={{ borderRadius: 2, px: 3 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDeleteAccount}
                            color="error"
                            variant="contained"
                            sx={{ borderRadius: 2, px: 3 }}
                            autoFocus
                        >
                            Delete Account
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
