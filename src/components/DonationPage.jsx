import React from 'react';
import { Box, Typography, Container, Paper, Button, Card, CardContent, Avatar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CoffeeIcon from '@mui/icons-material/Coffee';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import StarIcon from '@mui/icons-material/Star';

export default function DonationPage() {

    const handleDonate = () => {
        window.open('https://ko-fi.com/falante', '_blank');
    };

    return (
        <Box component="main" sx={{
            width: '100%',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.2) 0%, transparent 50%)
                `,
                pointerEvents: 'none'
            }
        }}>
            <Box
                sx={{
                    marginTop: 4,
                    marginBottom: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '80vh',
                    py: 6,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Hero Section */}
                <Box
                    sx={{
                        width: '100%',
                        mb: 6,
                        textAlign: 'center',
                        color: '#ffffff'
                    }}
                >
                    <Avatar
                        sx={{
                            width: 120,
                            height: 120,
                            mb: 3,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            border: '3px solid #00ffff',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                            mx: 'auto',
                            fontSize: '3rem'
                        }}
                    >
                        <FavoriteIcon sx={{ fontSize: '3rem', color: '#ff6b6b' }} />
                    </Avatar>

                    <Typography variant="h2" component="h1" gutterBottom sx={{
                        fontWeight: 'bold',
                        fontSize: '3.5rem',
                        textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
                        color: '#ffffff',
                        mb: 2,
                        background: 'linear-gradient(45deg, #00ffff, #ff6b6b, #ffff00)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Support Falante
                    </Typography>

                    <Typography variant="h5" sx={{
                        color: '#e0e0e0',
                        fontSize: '1.5rem',
                        maxWidth: 800,
                        mx: 'auto',
                        lineHeight: 1.6,
                        mb: 4,
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                    }}>
                        Help us keep the conversation going! Your support enables us to improve the app,
                        add new features, and make language learning accessible to everyone around the world.
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleDonate}
                        startIcon={<CoffeeIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
                            color: '#ffffff',
                            px: 6,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            borderRadius: 4,
                            boxShadow: '0 0 20px rgba(255, 107, 107, 0.6), 0 8px 25px rgba(255,107,107,0.3)',
                            border: '2px solid #ff6b6b',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #ff5252, #fb8c00)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 30px rgba(255, 107, 107, 0.8), 0 12px 35px rgba(255,107,107,0.4)',
                                border: '2px solid #ff5252'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Buy Me a Coffee ☕
                    </Button>
                </Box>

                {/* Features Grid */}
                <Box sx={{
                    width: '100%',
                    maxWidth: 1200,
                    mb: 6,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: 4,
                    justifyItems: 'center'
                }}>
                    {/* Development Card */}
                    <Card sx={{
                        width: '100%',
                        maxWidth: 350,
                        minHeight: 320,
                        background: 'rgba(26, 26, 46, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid #00ffff',
                        borderRadius: 3,
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 0 30px rgba(0, 255, 255, 0.6), 0 15px 35px rgba(0,0,0,0.3)',
                            border: '2px solid #00ffff'
                        }
                    }}>
                        <CardContent sx={{
                            textAlign: 'center',
                            p: 4,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <CodeIcon sx={{ fontSize: 60, mb: 3, color: '#00ffff', filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }} />
                            <Typography variant="h6" gutterBottom sx={{
                                fontWeight: 'bold',
                                color: '#ffffff',
                                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                                mb: 2
                            }}>
                                Development
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: '#e0e0e0',
                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                                lineHeight: 1.6,
                                maxWidth: 280
                            }}>
                                Support ongoing development and bug fixes to keep the app running smoothly.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* New Languages Card */}
                    <Card sx={{
                        width: '100%',
                        maxWidth: 350,
                        minHeight: 320,
                        background: 'rgba(26, 26, 46, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid #ff6b6b',
                        borderRadius: 3,
                        boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 0 30px rgba(255, 107, 107, 0.6), 0 15px 35px rgba(0,0,0,0.3)',
                            border: '2px solid #ff6b6b'
                        }
                    }}>
                        <CardContent sx={{
                            textAlign: 'center',
                            p: 4,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <LanguageIcon sx={{ fontSize: 60, mb: 3, color: '#ff6b6b', filter: 'drop-shadow(0 0 10px rgba(255, 107, 107, 0.5))' }} />
                            <Typography variant="h6" gutterBottom sx={{
                                fontWeight: 'bold',
                                color: '#ffffff',
                                textShadow: '0 0 10px rgba(255, 107, 107, 0.5)',
                                mb: 2
                            }}>
                                New Languages
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: '#e0e0e0',
                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                                lineHeight: 1.6,
                                maxWidth: 280
                            }}>
                                Help us add more languages and expand our conversation database.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Community Card */}
                    <Card sx={{
                        width: '100%',
                        maxWidth: 350,
                        minHeight: 320,
                        background: 'rgba(26, 26, 46, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid #ffff00',
                        borderRadius: 3,
                        boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 0 30px rgba(255, 255, 0, 0.6), 0 15px 35px rgba(0,0,0,0.3)',
                            border: '2px solid #ffff00'
                        }
                    }}>
                        <CardContent sx={{
                            textAlign: 'center',
                            p: 4,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <EmojiPeopleIcon sx={{ fontSize: 60, mb: 3, color: '#ffff00', filter: 'drop-shadow(0 0 10px rgba(255, 255, 0, 0.5))' }} />
                            <Typography variant="h6" gutterBottom sx={{
                                fontWeight: 'bold',
                                color: '#ffffff',
                                textShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
                                mb: 2
                            }}>
                                Community
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: '#e0e0e0',
                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                                lineHeight: 1.6,
                                maxWidth: 280
                            }}>
                                Support a growing community of language learners worldwide.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Impact Section */}
                <Box sx={{ width: '100%', maxWidth: 1000, mb: 6, display: 'flex', justifyContent: 'center' }}>
                    <Card sx={{
                        width: '100%',
                        background: 'rgba(26, 26, 46, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid #00ffff',
                        borderRadius: 3,
                        boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
                        p: 4
                    }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" gutterBottom sx={{
                                fontWeight: 'bold',
                                color: '#ffffff',
                                textShadow: '0 0 15px rgba(0, 255, 255, 0.8)',
                                mb: 3
                            }}>
                                Your Impact Matters
                            </Typography>
                            <Typography variant="body1" sx={{
                                mb: 3,
                                color: '#e0e0e0',
                                lineHeight: 1.7,
                                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                                fontSize: '1.1rem'
                            }}>
                                Every contribution, no matter how small, helps us maintain and improve Falante.
                                Your support allows us to:
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 4 }}>
                                {[
                                    'Keep the app free for everyone',
                                    'Add new conversation topics',
                                    'Improve audio quality',
                                    'Fix bugs and issues',
                                    'Add new features',
                                    'Support more devices'
                                ].map((item, index) => {
                                    const colors = ['#00ffff', '#ff6b6b', '#ffff00', '#ff6b6b', '#00ffff', '#ffff00'];
                                    const color = colors[index % colors.length];
                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                background: `linear-gradient(45deg, ${color}20, ${color}40)`,
                                                border: `1px solid ${color}`,
                                                color: '#ffffff',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                fontSize: '0.9rem',
                                                boxShadow: `0 0 10px ${color}30`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: `0 0 15px ${color}60`,
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <StarIcon sx={{ fontSize: 16, color: color, filter: `drop-shadow(0 0 5px ${color}80)` }} />
                                            {item}
                                        </Box>
                                    );
                                })}
                            </Box>

                            <Typography variant="h6" sx={{
                                fontStyle: 'italic',
                                color: '#ffffff',
                                mb: 3,
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                                fontSize: '1rem'
                            }}>
                                "Learning a language opens doors to new cultures, friendships, and opportunities.
                                Help us make this journey accessible to everyone." 🌍
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleDonate}
                                startIcon={<FavoriteIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
                                    color: '#ffffff',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    borderRadius: 3,
                                    border: '2px solid #ff6b6b',
                                    boxShadow: '0 0 20px rgba(255, 107, 107, 0.6)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #ff5252, #fb8c00)',
                                        boxShadow: '0 0 30px rgba(255, 107, 107, 0.8)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Make a Donation
                            </Button>
                        </CardContent>
                    </Card>
                </Box>

                {/* Thank You Section */}
                <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
                    <Typography variant="h5" gutterBottom sx={{
                        fontWeight: 'bold',
                        textShadow: '0 0 15px rgba(0, 255, 255, 0.6)',
                        fontSize: '1.8rem'
                    }}>
                        Thank You for Your Support! 🙏
                    </Typography>
                    <Typography variant="body1" sx={{
                        opacity: 0.9,
                        maxWidth: 600,
                        mx: 'auto',
                        textShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                    }}>
                        Your generosity helps us continue our mission of making language learning
                        fun, accessible, and effective for learners around the world.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
