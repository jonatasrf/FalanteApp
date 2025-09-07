import React, { useState, useEffect, useRef } from 'react';
import { normalizeText, generateWordDiffHtml } from '../utils.js';
import { useTts } from '../hooks/useTts';
import { useUserProgress } from '../contexts/UserProgressContext';
import {
    Button, Card, CardContent, Typography, TextField, Box, LinearProgress, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function ConversationListenType({ conversation, onConversationComplete }) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState({ message: 'Listen to the phrase first.', type: 'default', severity: 'info' });
    const [isCorrect, setIsCorrect] = useState(false);
    const [isPracticeComplete, setIsPracticeComplete] = useState(false);


    const textFieldRef = useRef(null);

    const { speak } = useTts();
    const { incrementCorrectSentences, resetStreak, updateConversationProgress, conversationProgress } = useUserProgress();

    const currentPhrase = conversation.phrases[currentPhraseIndex];

    // Estado para rastrear erros por frase
    const [phraseErrors, setPhraseErrors] = useState({});

    // Sistema de dificuldade progressiva
    const [difficultyLevel, setDifficultyLevel] = useState('normal');
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
    const [responseTime, setResponseTime] = useState(0);
    const [startTime, setStartTime] = useState(null);

    // Função para atualizar dificuldade baseada no desempenho
    const updateDifficulty = (isCorrect, timeSpent) => {
        if (isCorrect) {
            setConsecutiveCorrect(prev => prev + 1);
            setConsecutiveErrors(0);

            // Aumentar dificuldade se teve 3 acertos consecutivos e tempo rápido
            if (consecutiveCorrect >= 2 && timeSpent < 10000) { // menos de 10 segundos
                if (difficultyLevel === 'easy') setDifficultyLevel('normal');
                else if (difficultyLevel === 'normal') setDifficultyLevel('hard');
            }
        } else {
            setConsecutiveErrors(prev => prev + 1);
            setConsecutiveCorrect(0);

            // Diminuir dificuldade se teve 2 erros consecutivos
            if (consecutiveErrors >= 1) {
                if (difficultyLevel === 'hard') setDifficultyLevel('normal');
                else if (difficultyLevel === 'normal') setDifficultyLevel('easy');
            }
        }
    };

    // Função para obter configurações baseadas na dificuldade
    const getDifficultySettings = () => {
        switch (difficultyLevel) {
            case 'easy':
                return {
                    hintDelay: 3000, // 3 segundos para mostrar dica
                    maxAttempts: 5,  // 5 tentativas por frase
                    showCorrections: true,
                    autoPlay: false,
                    feedback: 'encouraging'
                };
            case 'normal':
                return {
                    hintDelay: 5000, // 5 segundos para mostrar dica
                    maxAttempts: 3,  // 3 tentativas por frase
                    showCorrections: true,
                    autoPlay: true,
                    feedback: 'balanced'
                };
            case 'hard':
                return {
                    hintDelay: 8000, // 8 segundos para mostrar dica
                    maxAttempts: 2,  // 2 tentativas por frase
                    showCorrections: false, // menos correções visuais
                    autoPlay: true,
                    feedback: 'challenging'
                };
            default:
                return {
                    hintDelay: 5000,
                    maxAttempts: 3,
                    showCorrections: true,
                    autoPlay: true,
                    feedback: 'balanced'
                };
        }
    };

    // Sistema de feedback contextual
    const getContextualFeedback = (userText, correctText, isCorrect, currentPhraseIndex) => {
        const phraseKey = `phrase_${currentPhraseIndex}`;
        const previousErrors = phraseErrors[phraseKey] || 0;

        if (isCorrect) {
            // Feedback for correct answer
            if (previousErrors === 0) {
                return {
                    message: `🎉 Perfect! You got it right on the first try!`,
                    type: 'correct',
                    severity: 'success'
                };
            } else if (previousErrors === 1) {
                return {
                    message: `💪 Great! You corrected it and got it right!`,
                    type: 'correct',
                    severity: 'success'
                };
            } else {
                return {
                    message: `🏆 Amazing! You persevered and succeeded!`,
                    type: 'correct',
                    severity: 'success'
                };
            }
        } else {
            // Feedback for incorrect answer
            const userWords = userText.split(/\s+/).filter(Boolean);
            const correctWords = correctText.split(/\s+/).filter(Boolean);

            // Check if it's spelling error or incomplete sentence
            const hasSpellingErrors = userWords.some((word, i) =>
                i < correctWords.length && normalizeText(word) !== normalizeText(correctWords[i])
            );

            if (previousErrors === 0) {
                // First error in this phrase
                if (userWords.length === 0) {
                    return {
                        message: `💭 Let's get started! Type what you heard.`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                } else if (hasSpellingErrors) {
                    return {
                        message: `📝 Almost there! There are some spelling errors.<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                } else if (userWords.length < correctWords.length) {
                    return {
                        message: `📖 The sentence is incomplete. Keep typing!<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                }
            } else {
                // Repeated error
                if (hasSpellingErrors) {
                    return {
                        message: `🔍 Let's focus on the details! Check the spelling.<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                } else {
                    return {
                        message: `✨ Keep going! You're almost there!<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                }
            }

            return {
                message: `❌ Incorrect:<br/>${generateWordDiffHtml(correctText, userText)}`,
                type: 'incorrect',
                severity: 'error'
            };
        }
    };

    // Função para posicionar cursor na primeira palavra errada ou final do texto
    const positionCursorOnFirstError = (userText, correctText) => {
        if (!textFieldRef.current) return;

        const userWords = userText.split(/\s+/).filter(Boolean);
        const correctWords = correctText.split(/\s+/).filter(Boolean);
        let foundError = false;

        // Primeiro: verificar erros de ortografia (prioridade máxima)
        for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
            const userWord = normalizeText(userWords[i]);
            const correctWord = normalizeText(correctWords[i]);

            if (userWord !== correctWord) {
                // Encontrar a primeira letra diferente
                let charIndex = 0;
                const minLength = Math.min(userWords[i].length, correctWords[i].length);

                while (charIndex < minLength) {
                    if (userWords[i][charIndex].toLowerCase() !== correctWords[i][charIndex].toLowerCase()) {
                        break;
                    }
                    charIndex++;
                }

                // Calcular a posição absoluta no texto
                let absolutePosition = 0;

                // Somar o comprimento de todas as palavras anteriores + espaços
                for (let j = 0; j < i; j++) {
                    absolutePosition += userWords[j].length + 1; // +1 para o espaço
                }

                // Adicionar a posição da letra errada na palavra atual
                absolutePosition += charIndex;

                // Posicionar o cursor
                const input = textFieldRef.current.querySelector('textarea') || textFieldRef.current.querySelector('input');
                if (input) {
                    input.focus();
                    input.setSelectionRange(absolutePosition, absolutePosition);
                }

                foundError = true;
                break; // Parar na primeira palavra errada
            }
        }

        // Segundo: se não encontrou erros de ortografia, verificar se frase está incompleta
        if (!foundError && userWords.length < correctWords.length) {
            const input = textFieldRef.current.querySelector('textarea') || textFieldRef.current.querySelector('input');
            if (input) {
                input.focus();
                const endPosition = userText.length;
                input.setSelectionRange(endPosition, endPosition);
            }
        }

        // Terceiro: se não encontrou erros mas há palavras extras, ir para o final
        if (!foundError && userWords.length > correctWords.length) {
            const input = textFieldRef.current.querySelector('textarea') || textFieldRef.current.querySelector('input');
            if (input) {
                input.focus();
                const endPosition = userText.length;
                input.setSelectionRange(endPosition, endPosition);
            }
        }
    };

    // Carregar progresso salvo quando o componente monta
    useEffect(() => {
        const savedProgress = conversationProgress[conversation.id];
        if (savedProgress && !savedProgress.dialogue_completed) {
            let targetPhraseIndex = savedProgress.current_phrase_index || 0;

            // Se a frase atual já foi respondida corretamente, avançar para a próxima
            if (savedProgress.is_correct === true && targetPhraseIndex < conversation.phrases.length - 1) {
                targetPhraseIndex += 1;
            }

            setCurrentPhraseIndex(targetPhraseIndex);
        }
    }, [conversation.id, conversationProgress, conversation.phrases.length]);

    // Removido salvamento automático durante digitação para evitar conflitos

    useEffect(() => {
        if (!isPracticeComplete && currentPhrase) {
            const settings = getDifficultySettings();

            if (currentPhraseIndex === 0) {
                // Primeira frase - não tocar áudio automaticamente
                setFeedback({ message: 'Click "Speak" to hear the phrase, then type what you heard.', type: 'default', severity: 'info' });
            } else if (settings.autoPlay) {
                // Frases subsequentes - tocar áudio automaticamente baseado na dificuldade
                setFeedback({ message: 'Playing audio...', type: 'default', severity: 'info' });
                speak(currentPhrase, () => {
                    setFeedback({ message: 'Now type what you heard.', type: 'default', severity: 'info' });
                }, (errorEvent) => {
                    setFeedback({ message: `Audio error: ${errorEvent.error || errorEvent.message || 'Unknown error'}`, type: 'incorrect', severity: 'error' });
                });
            } else {
                // Modo fácil - não tocar automaticamente
                setFeedback({ message: 'Click "Speak" to hear the phrase, then type what you heard.', type: 'default', severity: 'info' });
            }
        }
    }, [currentPhrase, isPracticeComplete, currentPhraseIndex, speak, difficultyLevel]);

    useEffect(() => {
        if (textFieldRef.current && !isPracticeComplete && currentPhrase) {
            // Small delay to ensure the component is fully rendered
            const timer = setTimeout(() => {
                if (textFieldRef.current) {
                    textFieldRef.current.focus();
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [currentPhraseIndex, isPracticeComplete, currentPhrase]);

    const handleCheck = () => {
        if (!currentPhrase) return;

        // Calcular tempo de resposta
        const endTime = Date.now();
        const timeSpent = startTime ? endTime - startTime : 0;

        const normalizedUser = normalizeText(userInput);
        const normalizedCorrect = normalizeText(currentPhrase.text);
        const isCorrect = normalizedUser === normalizedCorrect;

        // Atualizar dificuldade baseada no desempenho
        updateDifficulty(isCorrect, timeSpent);

        // Atualizar contador de erros para esta frase
        const phraseKey = `phrase_${currentPhraseIndex}`;
        if (!isCorrect) {
            setPhraseErrors(prev => ({
                ...prev,
                [phraseKey]: (prev[phraseKey] || 0) + 1
            }));
        }

        // Usar feedback contextual
        const contextualFeedback = getContextualFeedback(userInput, currentPhrase.text, isCorrect, currentPhraseIndex);
        setFeedback(contextualFeedback);

        if (isCorrect) {
            setIsCorrect(true);
            incrementCorrectSentences();

            // Resetar contador de erros para esta frase quando acertar
            setPhraseErrors(prev => ({
                ...prev,
                [phraseKey]: 0
            }));

            // Resetar timer para próxima frase
            setStartTime(null);

            // Não salvar aqui - será salvo apenas quando ir para próxima frase
        } else {
            setIsCorrect(false);
            resetStreak();

            // Posicionar cursor na primeira palavra errada
            setTimeout(() => {
                positionCursorOnFirstError(userInput, currentPhrase.text);
            }, 100);

            // Não salvar aqui - será salvo apenas quando ir para próxima frase
        }
    };

    const giveHint = () => {
        if (!currentPhrase) {
            setFeedback({ message: 'No phrase to get a hint for.', type: 'default', severity: 'info' });
            return;
        }

        const correctWords = currentPhrase.text.split(/\s+/).filter(Boolean);
        const userWords = userInput.split(/\s+/).filter(Boolean);

        let hintGiven = false;
        for (let i = 0; i < correctWords.length; i++) {
            if (i >= userWords.length || normalizeText(userWords[i]) !== normalizeText(correctWords[i])) {
                const userWord = userWords[i] || '';
                const correctWord = correctWords[i];
                setFeedback({ message: `Hint: The word "<strong>${userWord}</strong>" should be "<strong>${correctWord}</strong>"`, type: 'default', severity: 'info' });
                hintGiven = true;
                break;
            }
        }

        if (!hintGiven) {
            setFeedback({ message: 'Hint: Your input looks correct so far!', type: 'default', severity: 'info' });
        }
    };

    const handleNextPhrase = () => {
        if (currentPhraseIndex < conversation.phrases.length - 1) {
            setCurrentPhraseIndex(prevIndex => prevIndex + 1);
            setUserInput('');
            setIsCorrect(false);
            setFeedback({ message: 'Listen to the phrase first.', type: 'default', severity: 'info' });
            textFieldRef.current?.focus();

            // Salvar progresso quando ir para próxima frase
            updateConversationProgress(conversation.id, {
                current_phrase_index: currentPhraseIndex + 1,
                is_correct: true
            });
        } else {
            updateConversationProgress(conversation.id, { dialogue_completed: true });
            setIsPracticeComplete(true);
            onConversationComplete(conversation);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isCorrect) {
                handleCheck();
            } else {
                handleNextPhrase();
            }
        }
    };

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

    if (isPracticeComplete) {
        return (
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Full Dialogue: {conversation.title}
                    </Typography>
                    <List>
                        {conversation.phrases.map((phrase, index) => (
                            <ListItem key={index} secondaryAction={
                                <IconButton edge="end" aria-label="play" onClick={() => speak(phrase)}>
                                    <PlayArrowIcon />
                                </IconButton>
                            }>
                                <ListItemText primary={phrase.text} />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                    Conversation: {conversation.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Phrase {currentPhraseIndex + 1} of {conversation.phrases.length}
                    </Typography>
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
                </Box>

                <Box sx={{
                    ...getFeedbackSx(),
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <FeedbackIcon />
                    <Typography dangerouslySetInnerHTML={{ __html: feedback.message }} />
                </Box>

                <TextField
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        // Iniciar timer na primeira digitação
                        if (!startTime && e.target.value.length === 1) {
                            setStartTime(Date.now());
                        }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type what you hear..."
                    disabled={!currentPhrase || isCorrect}
                    ref={textFieldRef}
                    autoFocus
                    spellCheck={false}
                    inputRef={(input) => {
                        if (input && !isPracticeComplete && currentPhrase) {
                            setTimeout(() => input.focus(), 200);
                        }
                    }}
                    sx={{ mt: 1 }}
                />

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button id="speak-button" variant="contained" onClick={() => speak(currentPhrase)} disabled={!currentPhrase}>Speak</Button>
                    <Button id="check-button" variant="outlined" onClick={handleCheck} disabled={!currentPhrase || isCorrect}>Check</Button>
                    <Button id="hint-button" variant="outlined" onClick={giveHint} disabled={!currentPhrase || isCorrect}>Hint</Button>
                    <Button id="next-button" variant="contained" color="secondary" onClick={handleNextPhrase} disabled={!isCorrect}>
                        {currentPhraseIndex === conversation.phrases.length - 1 ? 'Finish Practice' : 'Next Phrase'}
                    </Button>
                </Box>

                <Box sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#ccc', fontWeight: 'bold' }}>
                        ⌨️ Keyboard Shortcuts:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.875rem' }}>
                            <strong>Ctrl</strong> - Speak audio
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.875rem' }}>
                            <strong>Tab</strong> - Get hint
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.875rem' }}>
                            <strong>Enter</strong> - Check/Next
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
