import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Avatar, Grid, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { Alert } from '@mui/material';
import { useUserProgress } from '../contexts/UserProgressContext';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import { calculateStarRating } from '../utils.js';
import { supabase } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

export default function ProfilePage() {
    const { level, diamonds, correct_sentences_count, current_streak, isGuest, conversationProgress, userProfile } = useUserProgress();
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [errorConversations, setErrorConversations] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const showToast = useToast();

    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true);
            setErrorConversations(null);
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .select('id, title'); // Only need id and title for this view

                if (error) {
                    throw error;
                }
                setConversations(data);
            } catch (err) {
                console.error("Error fetching conversations:", err);
                setErrorConversations(err.message);
            } finally {
                setLoadingConversations(false);
            }
        };

        fetchConversations();
    }, []);

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

    if (isGuest) {
        return (
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        Profile
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
                        Please log in to view your profile and saved progress.
                    </Alert>
                </Box>
            </Container>
        );
    }

    // Calculate completion percentage
    const totalConversations = conversations.length;
    const completedConversations = conversations.filter(conv => {
        const progress = conversationProgress[conv.id];
        return progress && progress.dialogue_completed;
    }).length;
    const completionPercentage = totalConversations > 0 ? (completedConversations / totalConversations) * 100 : 0;

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
                {/* Header Section - Full Width */}
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
                        {/* Google Profile Avatar */}
                        {userProfile?.avatar ? (
                            <Avatar
                                src={userProfile.avatar}
                                alt="Profile Picture"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 3,
                                    border: '3px solid #00ffff',
                                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                                    mx: 'auto'
                                }}
                            />
                        ) : (
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 3,
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    border: '3px solid #00ffff',
                                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                                    fontSize: '2.5rem',
                                    mx: 'auto'
                                }}
                            >
                                👤
                            </Avatar>
                        )}

                        <Typography variant="h3" component="h1" gutterBottom sx={{
                            fontWeight: 'bold',
                            fontSize: '3rem',
                            textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
                            background: 'linear-gradient(45deg, #00ffff, #ff6b6b)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {userProfile?.name || 'Your Profile'}
                        </Typography>

                        {/* Google Profile Information */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{
                                color: '#e0e0e0',
                                fontSize: '1.2rem',
                                mb: 1,
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                            }}>
                                {userProfile?.email}
                            </Typography>
                            {userProfile?.provider && (
                                <Typography variant="body1" sx={{
                                    color: '#00ffff',
                                    fontSize: '1rem',
                                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                                }}>
                                    Connected via {userProfile.provider.charAt(0).toUpperCase() + userProfile.provider.slice(1)}
                                </Typography>
                            )}
                            {userProfile?.createdAt && (
                                <Typography variant="body2" sx={{
                                    color: '#e0e0e0',
                                    fontSize: '0.9rem',
                                    mt: 1,
                                    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                                }}>
                                    Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="h5" sx={{
                            color: '#ffffff',
                            fontSize: '1.5rem',
                            textShadow: '0 0 15px rgba(0, 255, 255, 0.6)'
                        }}>
                            Welcome back! Keep learning! 🚀
                        </Typography>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Box sx={{ width: '100%', mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ maxWidth: 1000, width: '100%' }}>
                        <Grid container spacing={3} justifyContent="center">
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                    color: 'white',
                                    height: '100%',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <SchoolIcon sx={{ fontSize: 40, mb: 1, color: '#3498db' }} />
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {level}
                                        </Typography>
                                        <Typography variant="body2">Current Level</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                                    color: 'white',
                                    height: '100%',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <DiamondOutlinedIcon sx={{ fontSize: 40, mb: 1, color: '#f39c12' }} />
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {diamonds}
                                        </Typography>
                                        <Typography variant="body2">Diamonds</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                    color: 'white',
                                    height: '100%',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <TrendingUpIcon sx={{ fontSize: 40, mb: 1, color: '#e67e22' }} />
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {correct_sentences_count}
                                        </Typography>
                                        <Typography variant="body2">Correct Sentences</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card sx={{
                                    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                                    color: 'white',
                                    height: '100%',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <TimelineIcon sx={{ fontSize: 40, mb: 1, color: '#f1c40f' }} />
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {current_streak}
                                        </Typography>
                                        <Typography variant="body2">Current Streak</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Progress Overview */}
                <Box sx={{ width: '100%', maxWidth: 1200, mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{
                        width: '100%',
                        maxWidth: 1000,
                        p: 3,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmojiEventsIcon sx={{ mr: 1, color: '#f39c12' }} />
                                <Typography variant="h6">Your Overall Progress</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Conversations Completed</Typography>
                                    <Typography variant="body2">{completedConversations}/{totalConversations}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={completionPercentage}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            background: 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)'
                                        }
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.8 }} align="center">
                                {completionPercentage.toFixed(1)}% of conversations completed
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Conversation Progress */}
                <Box sx={{ width: '100%', maxWidth: 1200, mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{
                        width: '100%',
                        maxWidth: 1000,
                        p: 3,
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon sx={{ mr: 1, color: '#27ae60' }} />
                                Conversation Progress
                            </Typography>
                            {loadingConversations ? (
                                <Typography sx={{ opacity: 0.8 }}>Loading conversations...</Typography>
                            ) : errorConversations ? (
                                <Typography color="error">Error loading conversations: {errorConversations}</Typography>
                            ) : (() => {
                                // Filter only completed conversations and take first 5
                                const completedConversations = conversations
                                    .filter(conv => {
                                        const progress = conversationProgress[conv.id];
                                        return progress && progress.dialogue_completed;
                                    })
                                    .slice(0, 5);

                                return completedConversations.length === 0 ? (
                                    <Typography sx={{ opacity: 0.8 }}>No completed conversations yet.</Typography>
                                ) : (
                                    <Box sx={{
                                        maxHeight: completedConversations.length > 3 ? 300 : 'auto',
                                        overflowY: completedConversations.length > 3 ? 'auto' : 'visible',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                            borderRadius: '4px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.5)',
                                            },
                                        },
                                    }}>
                                        <List sx={{ width: '100%', p: 0 }}>
                                            {completedConversations.map((conv) => {
                                                const progress = conversationProgress[conv.id];
                                                const starRating = progress ? calculateStarRating(progress.quiz_score, progress.quiz_max_score) : 0;

                                                return (
                                                    <ListItem
                                                        key={conv.id}
                                                        divider
                                                        sx={{
                                                            borderRadius: 2,
                                                            mb: 1,
                                                            backgroundColor: 'rgba(39, 174, 96, 0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'white' }}>
                                                                    {conv.title}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                                    <Chip
                                                                        icon={<CheckCircleIcon />}
                                                                        label="Completed"
                                                                        sx={{
                                                                            backgroundColor: 'rgba(39, 174, 96, 0.8)',
                                                                            color: 'white',
                                                                            border: '1px solid rgba(39, 174, 96, 0.5)'
                                                                        }}
                                                                        size="small"
                                                                    />
                                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                        {Array.from({ length: 3 }).map((_, i) => (
                                                                            <StarIcon
                                                                                key={`star-${i}`}
                                                                                sx={{
                                                                                    color: i < starRating ? '#f1c40f' : 'rgba(255,255,255,0.3)',
                                                                                    fontSize: 18
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            }
                                                            secondaryTypographyProps={{ component: 'div' }}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </Box>

                {/* Delete Account Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
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
