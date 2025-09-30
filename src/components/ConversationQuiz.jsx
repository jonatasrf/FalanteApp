import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, LinearProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useUserProgress } from '../contexts/UserProgressContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ConversationQuiz({ conversation, onQuizComplete, onBackToConversations }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const { updateConversationProgress } = useUserProgress();

    const currentQuestion = conversation.objectiveQuestions[currentQuestionIndex];

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
    };

    const handleAnswerChange = (event) => {
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: event.target.value }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < conversation.objectiveQuestions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            // All questions answered, show results
            checkQuizAnswers();
        }
    };

    const checkQuizAnswers = () => {
        let correctCount = 0;
        conversation.objectiveQuestions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setShowResults(true);
        updateConversationProgress(conversation.id, {
            quiz_score: correctCount,
            quiz_max_score: conversation.objectiveQuestions.length,
            quiz_completed: true
        });
    };



    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Quiz: {conversation.title}
                </Typography>
                {!showResults ? (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Question {currentQuestionIndex + 1} of {conversation.objectiveQuestions.length}
                        </Typography>
                        <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                            <FormLabel component="legend">{currentQuestion.question}</FormLabel>
                            <RadioGroup
                                value={userAnswers[currentQuestionIndex] || ''}
                                onChange={handleAnswerChange}
                            >
                                {currentQuestion.options.map((option, optIndex) => (
                                    <FormControlLabel 
                                        key={optIndex} 
                                        value={option} 
                                        control={<Radio />} 
                                        label={option} 
                                        id={`option-${optIndex}`}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <Button id="next-question-button" variant="contained" onClick={handleNextQuestion} sx={{ mt: 2 }}>
                            {currentQuestionIndex < conversation.objectiveQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            📊 Quiz Results
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            You got {score} out of {conversation.objectiveQuestions.length} correct!
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={(score / conversation.objectiveQuestions.length) * 100}
                            sx={{
                                height: 12,
                                borderRadius: 6,
                                mb: 3,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: score === conversation.objectiveQuestions.length ? '#4caf50' : '#2196f3'
                                }
                            }}
                        />

                        {/* Detailed Results */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            📝 Question Review:
                        </Typography>
                        <List sx={{ width: '100%', mb: 3 }}>
                            {conversation.objectiveQuestions.map((question, index) => {
                                const userAnswer = userAnswers[index];
                                const isCorrect = userAnswer === question.correctAnswer;

                                return (
                                    <ListItem key={index} sx={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 1,
                                        mb: 1,
                                        backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                                    }}>
                                        <ListItemIcon>
                                            {isCorrect ?
                                                <CheckCircleIcon sx={{ color: '#4caf50' }} /> :
                                                <CancelIcon sx={{ color: '#f44336' }} />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                    {index + 1}. {question.question}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" sx={{color: isCorrect ? '#4caf50' : '#f44336', fontWeight: 'bold'}}>
                                                        Your answer: {userAnswer || 'Not answered'}
                                                    </Typography>
                                                    {!isCorrect && (
                                                        <Typography variant="body2" sx={{color: '#4caf50', fontWeight: 'bold', mt: 0.5}}>
                                                            Correct answer: {question.correctAnswer}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleRetry}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2
                                }}
                            >
                                🔄 Try Again
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => onBackToConversations && onBackToConversations()}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                ✅ Back to Conversations
                            </Button>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
