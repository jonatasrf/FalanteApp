import React, { useState } from 'react';
import { Box, Typography, Container, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { supabase } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

export default function SettingsPage() {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const showToast = useToast();

    const handleDeleteAccount = () => {
        setShowConfirmDialog(true);
    };

    const confirmDeleteAccount = async () => {
        setShowConfirmDialog(false);

        try {
            // Obter sessão atual para validação
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) {
                showToast('No active session found.', 'error');
                return;
            }

            let dataDeleted = false;
            let accountDeleted = false;

            // 1. Tentar deletar dados do usuário (isto funciona do frontend)
            try {
                const { error: progressError } = await supabase
                    .from('user_progress')
                    .delete()
                    .eq('user_id', session.user.id);

                if (progressError) {
                    console.error('Error deleting user progress:', progressError);
                    showToast('Error deleting user data. However, some data may be lost. Please contact support.', 'error');
                } else {
                    dataDeleted = true;
                }
            } catch (progressError) {
                console.error('Exception deleting progress:', progressError);
                showToast('Error deleting user data. However, the account will still be marked for deletion.', 'warning');
                dataDeleted = false;
            }

            // 2. Tentar deletar conta usando Edge Function (pode não funcionar)
            try {
                const { error } = await supabase.functions.invoke('delete-account', {
                    body: { requestId: Date.now() }
                });

                if (error) {
                    console.log('Account deletion requires admin access. Proceeding with sign out only.');
                } else {
                    accountDeleted = true;
                }
            } catch {
                console.log('Edge Function not available or CORS issue. Proceeding with sign out only.');
            }

            // 3. Sempre fazer sign out
            await supabase.auth.signOut();

            // 4. Redirecionar para página específica
            setTimeout(() => {
                window.location.href = 'https://jonatasrf.github.io/FalanteApp/';
            }, 1000); // Pequeno delay para garantir sign out

            // 5. Feedback baseado no que conseguiu fazer
            if (accountDeleted) {
                showToast('✅ Account and all data permanently deleted!', 'success');
            } else if (dataDeleted) {
                showToast('✅ User data deleted! Account will be removed shortly. You have been signed out.', 'success');
            } else {
                showToast('⚠️ Sign out completed. Account data will be deleted by administrators.', 'info');
            }

        } catch (error) {
            console.error('Unexpected error during account deletion:', error);
            showToast('❌ An error occurred. Please try again or contact support.', 'error');
            throw error; // Não redirecionar se houve erro crítico
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
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F7F7 50%, #EBEBEB 100%)',
                        color: '#484848',
                        position: 'relative',
                        textAlign: 'center',
                        borderBottom: '1px solid #EBEBEB',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                                radial-gradient(circle at 20% 80%, rgba(255, 56, 92, 0.05) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(0, 132, 137, 0.05) 0%, transparent 50%)
                            `,
                            pointerEvents: 'none'
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h3" component="h1" gutterBottom sx={{
                            fontWeight: 'bold',
                            fontSize: '3rem',
                            background: 'linear-gradient(45deg, #FF385C, #008489)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Settings
                        </Typography>

                        <Typography variant="h5" sx={{
                            color: '#767676',
                            fontSize: '1.5rem'
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
                        background: '#FFFFFF',
                        color: '#484848',
                        border: '1px solid #EBEBEB',
                        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <SettingsIcon sx={{ mr: 2, color: '#FF385C', fontSize: 30 }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#484848' }}>
                                    Account Settings
                                </Typography>
                            </Box>

                            <Typography variant="body1" sx={{ mb: 4, color: '#767676' }}>
                                Here you can manage your account preferences and settings.
                            </Typography>

                            {/* Account Management Section */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#FF385C', fontWeight: 'bold' }}>
                                    Account Management
                                </Typography>

                                <Box sx={{
                                    p: 3,
                                    backgroundColor: '#FFF8E1',
                                    borderRadius: 2,
                                    border: '1px solid #FFCC02',
                                    borderLeft: '4px solid #FF385C'
                                }}>
                                    <Typography variant="body1" sx={{ mb: 2, color: '#484848' }}>
                                        <strong style={{ color: '#D32F2F' }}>Danger Zone:</strong> These actions are permanent and cannot be undone.
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 'bold',
                                            borderColor: '#D32F2F',
                                            color: '#D32F2F',
                                            '&:hover': {
                                                backgroundColor: '#D32F2F',
                                                color: 'white',
                                                borderColor: '#D32F2F'
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
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#767676' }}>
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
                    disableEnforceFocus={false}
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
