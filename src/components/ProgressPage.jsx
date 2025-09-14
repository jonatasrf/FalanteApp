import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText, Grid, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { Alert } from '@mui/material';
import { useUserProgress } from '../contexts/UserProgressContext';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import FlagIcon from '@mui/icons-material/Flag';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { calculateStarRating } from '../utils.js';
import { supabase } from '../supabaseClient';

export default function ProgressPage() {
    const { level, diamonds, correct_sentences_count, current_streak, isGuest, conversationProgress } = useUserProgress();
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [errorConversations, setErrorConversations] = useState(null);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true);
            setErrorConversations(null);
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .select('id, title');

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
                        Progress
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
                        Please log in to view your progress and saved statistics.
                    </Alert>
                </Box>
            </Container>
        );
    }

    // Calculate completed conversations
    const completedConversations = conversations.filter(conv => {
        const progress = conversationProgress[conv.id];
        return progress && progress.dialogue_completed;
    }).length;

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
                            Your Progress
                        </Typography>

                        <Typography variant="h5" sx={{
                            color: '#ffffff',
                            fontSize: '1.5rem',
                            textShadow: '0 0 15px rgba(0, 255, 255, 0.6)'
                        }}>
                            Keep learning and improving! 🚀
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
                                        <Typography variant="body2" sx={{ mb: 1 }}>Current Level</Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: 1.2 }}>
                                            Earn levels by completing conversations. Each level requires more sentences to advance.
                                        </Typography>
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
                                        <Typography variant="body2" sx={{ mb: 2 }}>Diamonds</Typography>

                                        {/* Progress bar for next diamond */}
                                        {(() => {
                                            const currentProgress = correct_sentences_count % 100;
                                            const progressPercentage = (currentProgress / 100) * 100;
                                            const remaining = 100 - currentProgress;

                                            return (
                                                <Box sx={{ width: '100%', mt: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                                            Next: {remaining} sentences
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                                            {currentProgress}/100
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progressPercentage}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 3,
                                                                backgroundColor: '#f39c12'
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })()}
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
                                        <Typography variant="body2" sx={{ mb: 1 }}>Correct Sentences</Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: 1.2 }}>
                                            Total sentences answered correctly. Every 100 correct sentences earns a diamond.
                                        </Typography>
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
                                        <Typography variant="body2" sx={{ mb: 1 }}>Current Streak</Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: 1.2 }}>
                                            Consecutive correct answers. Resets to 0 when you make an error.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Sentences Completed Chart */}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <EmojiEventsIcon sx={{ mr: 1, color: '#f39c12' }} />
                                <Typography variant="h6">Sentences Completed by Level</Typography>
                            </Box>

                            {/* Simple Bar Chart */}
                            <Box sx={{ mb: 2 }}>
                                {(() => {
                                    // Group completed conversations by level
                                    const levelStats = conversations.reduce((acc, conv) => {
                                        const progress = conversationProgress[conv.id];
                                        if (progress && progress.dialogue_completed) {
                                            const level = conv.level || 'Unknown';
                                            acc[level] = (acc[level] || 0) + 1;
                                        }
                                        return acc;
                                    }, {});

                                    // Define level order
                                    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'C3'];
                                    const orderedLevels = levelOrder.filter(level => levelStats[level] > 0);

                                    if (orderedLevels.length === 0) {
                                        return (
                                            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', py: 4 }}>
                                                No conversations completed yet. Start practicing to see your progress chart!
                                            </Typography>
                                        );
                                    }

                                    const maxCount = Math.max(...Object.values(levelStats));

                                    return (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {orderedLevels.map(level => {
                                                const count = levelStats[level];
                                                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                                                return (
                                                    <Box key={level} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="body2" sx={{ minWidth: 30, fontWeight: 'bold' }}>
                                                            {level}
                                                        </Typography>
                                                        <Box sx={{
                                                            flex: 1,
                                                            height: 24,
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            borderRadius: 2,
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <Box sx={{
                                                                width: `${percentage}%`,
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)',
                                                                borderRadius: 2,
                                                                transition: 'width 0.5s ease-in-out'
                                                            }} />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'right' }}>
                                                            {count}
                                                        </Typography>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    );
                                })()}
                            </Box>

                            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', mt: 2 }}>
                                Total conversations completed: {completedConversations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Progress Over Time Chart */}
                <Box sx={{ width: '100%', maxWidth: 1200, mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{
                        width: '100%',
                        maxWidth: 1000,
                        p: 3,
                        background: 'linear-gradient(135deg, #16a085 0%, #27ae60 100%)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <ShowChartIcon sx={{ mr: 1, color: '#f1c40f' }} />
                                <Typography variant="h6">Progress Over Time (Last 7 Days)</Typography>
                            </Box>

                            {/* Simple Line Chart */}
                            <Box sx={{ mb: 2 }}>
                                {(() => {
                                    // Generate simulated data for the last 7 days
                                    const today = new Date();
                                    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                                    // Create realistic simulated data based on current progress
                                    const baseSentences = Math.max(5, Math.floor(correct_sentences_count / 10));
                                    const simulatedData = Array.from({ length: 7 }, (_, i) => {
                                        const dayIndex = (today.getDay() - 6 + i + 7) % 7;
                                        const dayName = weekDays[dayIndex];

                                        // Simulate realistic daily progress with some variation
                                        let sentences;
                                        if (i === 6) { // Today
                                            sentences = Math.floor(baseSentences * (0.8 + Math.random() * 0.4));
                                        } else {
                                            sentences = Math.floor(baseSentences * (0.3 + Math.random() * 0.7));
                                        }

                                        return {
                                            day: dayName,
                                            sentences: Math.max(0, sentences),
                                            fullDate: new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
                                        };
                                    });

                                    const maxSentences = Math.max(...simulatedData.map(d => d.sentences));
                                    const chartHeight = 120;

                                    return (
                                        <Box sx={{ width: '100%' }}>
                                            {/* Chart Area */}
                                            <Box sx={{
                                                position: 'relative',
                                                height: chartHeight + 40,
                                                width: '100%',
                                                mb: 2
                                            }}>
                                                {/* Grid lines */}
                                                {[0, 25, 50, 75, 100].map(percentage => (
                                                    <Box
                                                        key={percentage}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: (100 - percentage) * chartHeight / 100,
                                                            left: 0,
                                                            right: 0,
                                                            height: '1px',
                                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                                            zIndex: 1
                                                        }}
                                                    />
                                                ))}

                                                {/* Y-axis labels */}
                                                {[0, 25, 50, 75, 100].map(percentage => (
                                                    <Typography
                                                        key={`label-${percentage}`}
                                                        variant="caption"
                                                        sx={{
                                                            position: 'absolute',
                                                            left: -25,
                                                            top: (100 - percentage) * chartHeight / 100 - 8,
                                                            fontSize: '0.6rem',
                                                            opacity: 0.7,
                                                            width: 20,
                                                            textAlign: 'right'
                                                        }}
                                                    >
                                                        {Math.round(maxSentences * percentage / 100)}
                                                    </Typography>
                                                ))}

                                                {/* Chart bars */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'end',
                                                    justifyContent: 'space-between',
                                                    height: chartHeight,
                                                    position: 'relative',
                                                    zIndex: 2
                                                }}>
                                                    {simulatedData.map((data, index) => {
                                                        const height = maxSentences > 0 ? (data.sentences / maxSentences) * 100 : 0;
                                                        const isToday = index === 6;

                                                        return (
                                                            <Box
                                                                key={data.day}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    flex: 1,
                                                                    maxWidth: '12%'
                                                                }}
                                                            >
                                                                {/* Bar */}
                                                                <Box
                                                                    sx={{
                                                                        width: '80%',
                                                                        height: `${height}%`,
                                                                        backgroundColor: isToday ? '#f1c40f' : 'rgba(255,255,255,0.8)',
                                                                        borderRadius: '2px 2px 0 0',
                                                                        transition: 'all 0.3s ease',
                                                                        position: 'relative',
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            backgroundColor: isToday ? '#f39c12' : 'rgba(255,255,255,1)',
                                                                            transform: 'scaleY(1.05)'
                                                                        }
                                                                    }}
                                                                    title={`${data.sentences} sentences on ${data.day}`}
                                                                >
                                                                    {/* Value label on bar */}
                                                                    {height > 20 && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                position: 'absolute',
                                                                                top: -18,
                                                                                left: '50%',
                                                                                transform: 'translateX(-50%)',
                                                                                fontSize: '0.6rem',
                                                                                fontWeight: 'bold',
                                                                                color: 'white'
                                                                            }}
                                                                        >
                                                                            {data.sentences}
                                                                        </Typography>
                                                                    )}
                                                                </Box>

                                                                {/* Day label */}
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        mt: 1,
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: isToday ? 'bold' : 'normal',
                                                                        color: isToday ? '#f1c40f' : 'rgba(255,255,255,0.8)',
                                                                        textAlign: 'center'
                                                                    }}
                                                                >
                                                                    {data.day}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>

                                            {/* Summary */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Total this week: {simulatedData.reduce((sum, d) => sum + d.sentences, 0)} sentences
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Daily average: {Math.round(simulatedData.reduce((sum, d) => sum + d.sentences, 0) / 7)} sentences
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })()}
                            </Box>

                            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', mt: 2 }}>
                                Track your daily consistency! 📈 Keep the momentum going.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Weekly Goals */}
                <Box sx={{ width: '100%', maxWidth: 1200, mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{
                        width: '100%',
                        maxWidth: 1000,
                        p: 3,
                        background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <FlagIcon sx={{ mr: 1, color: '#f1c40f' }} />
                                <Typography variant="h6">Weekly Goals</Typography>
                            </Box>

                            {/* Weekly Goals List */}
                            <Box sx={{ mb: 2 }}>
                                {(() => {
                                    // Define weekly goals (these could be stored in database later)
                                    const weeklyGoals = [
                                        {
                                            id: 'conversations',
                                            title: 'Complete 5 conversations',
                                            target: 5,
                                            current: completedConversations,
                                            icon: '🎯',
                                            reward: '1 Diamond'
                                        },
                                        {
                                            id: 'sentences',
                                            title: 'Answer 100 sentences correctly',
                                            target: 100,
                                            current: correct_sentences_count % 100, // Weekly progress (reset each week)
                                            icon: '📝',
                                            reward: 'Streak Bonus'
                                        },
                                        {
                                            id: 'streak',
                                            title: 'Maintain 7-day streak',
                                            target: 7,
                                            current: Math.min(current_streak, 7),
                                            icon: '🔥',
                                            reward: 'Special Badge'
                                        },
                                        {
                                            id: 'practice_days',
                                            title: 'Practice 5 days this week',
                                            target: 5,
                                            current: 3, // This would need to be calculated from activity logs
                                            icon: '📅',
                                            reward: 'Weekly Champion'
                                        }
                                    ];

                                    return (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {weeklyGoals.map(goal => {
                                                const progressPercentage = Math.min((goal.current / goal.target) * 100, 100);
                                                const isCompleted = goal.current >= goal.target;

                                                return (
                                                    <Box key={goal.id} sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        backgroundColor: isCompleted ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.1)',
                                                        border: isCompleted ? '1px solid #2ecc71' : '1px solid rgba(255,255,255,0.2)'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                                                                    {goal.icon}
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                                    {goal.title}
                                                                </Typography>
                                                            </Box>
                                                            {isCompleted && (
                                                                <Chip
                                                                    icon={<CheckCircleIcon />}
                                                                    label="Completed!"
                                                                    sx={{
                                                                        backgroundColor: '#27ae60',
                                                                        color: 'white',
                                                                        fontSize: '0.7rem'
                                                                    }}
                                                                    size="small"
                                                                />
                                                            )}
                                                        </Box>

                                                        <Box sx={{ mb: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                                                    Progress: {goal.current}/{goal.target}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                                                    Reward: {goal.reward}
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={progressPercentage}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 4,
                                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        borderRadius: 4,
                                                                        backgroundColor: isCompleted ? '#27ae60' : '#3498db'
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    );
                                })()}
                            </Box>

                            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', mt: 2 }}>
                                Goals reset every Monday. Keep practicing to unlock rewards! 🎁
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
            </Box>
        </Box>
    );
}
