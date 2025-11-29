import React, { useState, useEffect, useRef } from 'react';
import { normalizeText, generateWordDiffHtml } from '../utils.js';
import { useTts } from '../hooks/useTts';
import { useUserProgress } from '../contexts/UserProgressContext';
import {
    Button, Card, CardContent, Typography, TextField, Box, List, ListItem, ListItemText, IconButton, Menu, MenuItem
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FeedbackDisplay from './FeedbackDisplay';
import DifficultyBadge from './DifficultyBadge';
import ProgressBar from './ProgressBar';

export default function ConversationListenType({ conversation, onConversationComplete, onBackToConversations }) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState({ message: 'Listen to the phrase first.', type: 'default', severity: 'info' });
    const [isCorrect, setIsCorrect] = useState(false);
    const [isPracticeComplete, setIsPracticeComplete] = useState(false);
    const [isFullyCompleted, setIsFullyCompleted] = useState(false);

    const textFieldRef = useRef(null);

    const {
        speak,
        preloadMultipleAudios,
        loadingProgress,
        playbackRate,
        increasePlaybackRate,
        decreasePlaybackRate,
        formatPlaybackRate
    } = useTts();
    const { incrementCorrectSentences, resetStreak, updateConversationProgress, conversationProgress } = useUserProgress();

    const currentPhrase = conversation.phrases[currentPhraseIndex];

    // Estado para menu de velocidade
    const [speedMenuAnchor, setSpeedMenuAnchor] = useState(null);
    const [phraseErrors, setPhraseErrors] = useState({});

    // Sistema de dificuldade progressiva
    const [difficultyLevel, setDifficultyLevel] = useState('normal');
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [consecutiveErrors, setConsecutiveErrors] = useState(0);
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

    // Sistema de feedback contextual aprimorado
    const getContextualFeedback = (userText, correctText, isCorrect, currentPhraseIndex) => {
        const phraseKey = `phrase_${currentPhraseIndex}`;
        const previousErrors = phraseErrors[phraseKey] || 0;

        if (isCorrect) {
            // Feedback for correct answer with variety and streak recognition
            const successMessages = [
                { icon: '🎯', message: 'Bullseye! Perfect match!' },
                { icon: '⭐', message: 'Outstanding! You nailed it!' },
                { icon: '🎉', message: 'Fantastic! Spot on!' },
                { icon: '🏆', message: 'Champion! Excellent work!' },
                { icon: '💎', message: 'Brilliant! You\'re a star!' },
                { icon: '🚀', message: 'Amazing! You\'re flying through this!' },
                { icon: '🌟', message: 'Superb! Keep shining!' },
                { icon: '💫', message: 'Incredible! You\'re on fire!' }
            ];

            if (previousErrors === 0) {
                // First try success
                const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
                return {
                    message: `${randomMessage.icon} ${randomMessage.message} First try perfection!`,
                    type: 'correct',
                    severity: 'success'
                };
            } else if (previousErrors === 1) {
                return {
                    message: `💪 Victory! You conquered that challenge!`,
                    type: 'correct',
                    severity: 'success'
                };
            } else {
                return {
                    message: `🔥 Legendary! You never gave up and succeeded!`,
                    type: 'correct',
                    severity: 'success'
                };
            }
        } else {
            // Enhanced error feedback with helpful guidance
            const userWords = userText.split(/\s+/).filter(Boolean);
            const correctWords = correctText.split(/\s+/).filter(Boolean);

            // Check error types
            const hasSpellingErrors = userWords.some((word, i) =>
                i < correctWords.length && normalizeText(word) !== normalizeText(correctWords[i])
            );
            const isIncomplete = userWords.length < correctWords.length;
            const hasExtraWords = userWords.length > correctWords.length;

            if (previousErrors === 0) {
                // First attempt - encouraging guidance
                if (userWords.length === 0) {
                    return {
                        message: `🎧 Ready to start? Click "Speak" to hear the phrase, then type what you heard!`,
                        type: 'incorrect',
                        severity: 'info'
                    };
                } else if (isIncomplete) {
                    return {
                        message: `📝 You're on the right track! The sentence needs ${correctWords.length - userWords.length} more word(s).<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'warning'
                    };
                } else if (hasSpellingErrors && !hasExtraWords) {
                    return {
                        message: `🔤 So close! Check the spelling of these words:<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'warning'
                    };
                } else if (hasExtraWords) {
                    return {
                        message: `✂️ Almost there! You have some extra words. Focus on the exact phrase:<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'warning'
                    };
                }
            } else {
                // Repeated attempts - more specific help
                const helpfulHints = [
                    '🎯 Listen carefully to the pronunciation',
                    '📝 Pay attention to silent letters',
                    '🔤 Check for British vs American spelling',
                    '🎵 Focus on the rhythm and stress',
                    '✨ Try writing it slowly, word by word'
                ];
                const randomHint = helpfulHints[Math.floor(Math.random() * helpfulHints.length)];

                if (hasSpellingErrors) {
                    return {
                        message: `🔍 Let's zoom in on the details! ${randomHint}<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                } else if (isIncomplete) {
                    return {
                        message: `📖 Keep building! You're missing some words:<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                } else {
                    return {
                        message: `💡 You're getting warmer! ${randomHint}<br/>${generateWordDiffHtml(correctText, userText)}`,
                        type: 'incorrect',
                        severity: 'error'
                    };
                }
            }

            // Fallback
            return {
                message: `🤔 Let's try again! Listen once more and focus on the details.<br/>${generateWordDiffHtml(correctText, userText)}`,
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

    // Pré-carregar áudios quando o componente monta
    useEffect(() => {
        if (conversation?.phrases?.length > 0) {
            const audioPaths = conversation.phrases
                .map(phrase => phrase.audioPath)
                .filter(Boolean);

            if (audioPaths.length > 0) {
                // console.log(`🎵 Pré-carregando ${audioPaths.length} áudios da conversa...`);
                preloadMultipleAudios(audioPaths, 2);
            }
        }
    }, [conversation.id, conversation.phrases, preloadMultipleAudios]);

    // Listeners para atalhos de teclado de velocidade (disparados pelo MainApp)
    useEffect(() => {
        const handleSpeedUp = () => {
            increasePlaybackRate();
        };

        const handleSpeedDown = () => {
            decreasePlaybackRate();
        };

        document.addEventListener('speedUp', handleSpeedUp);
        document.addEventListener('speedDown', handleSpeedDown);

        return () => {
            document.removeEventListener('speedUp', handleSpeedUp);
            document.removeEventListener('speedDown', handleSpeedDown);
        };
    }, [increasePlaybackRate, decreasePlaybackRate]);

    // Carregar progresso salvo quando o componente monta
    useEffect(() => {
        const savedProgress = conversationProgress[conversation.id];
        if (savedProgress) {
            if (savedProgress.quiz_completed) {
                // Se completou o quiz, mostrar interface de completo (com retry)
                setIsFullyCompleted(true);
                setIsPracticeComplete(true);
            } else if (!savedProgress.dialogue_completed) {
                // Se não completou ainda, continuar de onde parou
                setCurrentPhraseIndex(savedProgress.current_phrase_index || 0);
            } else {
                // Se completou dialogo mas não quiz, mostrar interface de revisão dos diálogos
                setIsFullyCompleted(false); // Não completou quiz ainda
                setIsPracticeComplete(true);
            }
        }
    }, [conversation.id, conversationProgress, conversation.phrases.length]);

    // Removido salvamento automático durante digitação para evitar conflitos

    const handleSpeedMenuOpen = (event) => {
        setSpeedMenuAnchor(event.currentTarget);
    };

    const handleSpeedMenuClose = () => {
        setSpeedMenuAnchor(null);
    };

    const setSpeed = (speed) => {
        // Calcular diferença e ajustar
        const current = playbackRate;
        const diff = speed - current;

        if (diff > 0) {
            // Precisamos aumentar
            for (let i = 0; i < diff / 0.25; i++) {
                setTimeout(increasePlaybackRate, i * 10);
            }
        } else if (diff < 0) {
            // Precisamos diminuir
            for (let i = 0; i < Math.abs(diff) / 0.25; i++) {
                setTimeout(decreasePlaybackRate, i * 10);
            }
        }

        handleSpeedMenuClose();
    };

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
    }, [currentPhrase, isPracticeComplete, currentPhraseIndex, speak, difficultyLevel, playbackRate]);

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
            setFeedback({ message: 'Playing audio...', type: 'default', severity: 'info' });

            // Sempre executar áudio quando passar para próxima frase
            setTimeout(() => {
                speak(conversation.phrases[currentPhraseIndex + 1], () => {
                    setFeedback({ message: 'Now type what you heard.', type: 'default', severity: 'info' });
                    textFieldRef.current?.focus();
                }, (errorEvent) => {
                    setFeedback({ message: `Audio error: ${errorEvent.error || errorEvent.message || 'Unknown error'}`, type: 'incorrect', severity: 'error' });
                    textFieldRef.current?.focus();
                });
            }, 100);

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

    // Função para dar retry (reiniciar conversa completa)
    const handleRetry = () => {
        // Resetar tudo
        setCurrentPhraseIndex(0);
        setUserInput('');
        setIsCorrect(false);
        setIsPracticeComplete(false);
        setFeedback({ message: 'Click "Speak" to hear the phrase, then type what you heard.', type: 'default', severity: 'info' });
        setPhraseErrors({});
        setDifficultyLevel('normal');
        setConsecutiveCorrect(0);
        setConsecutiveErrors(0);
        textFieldRef.current?.focus();

        // Resetar progresso no database
        updateConversationProgress(conversation.id, {
            current_phrase_index: 0,
            dialogue_completed: false,
            quiz_completed: false
        });
    };



    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!isCorrect) {
                handleCheck();
            } else {
                handleNextPhrase();
            }
        }
    };

    if (isPracticeComplete) {
        const isQuizIncomplete = !isFullyCompleted; // Diálogos completos, mas quiz não

        return (
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h3" sx={{ mb: 1 }}>
                            {isQuizIncomplete ? '📝' : '🎉'}
                        </Typography>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {isQuizIncomplete ? 'Dialogue Completed!' : 'Congratulations!'}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                            {isQuizIncomplete ? 'Now practice with the quiz:' : 'You have successfully completed:'}
                            <strong> {conversation.title}</strong>
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#888', fontStyle: 'italic' }}>
                            {isQuizIncomplete ? 'Listen again to remember the phrases before the quiz:' : 'Full dialogue:'}
                        </Typography>
                        <List>
                            {conversation.phrases.map((phrase, index) => (
                                <ListItem key={index} secondaryAction={
                                    <IconButton edge="end" aria-label="play" onClick={() => speak(phrase)}>
                                        <PlayArrowIcon />
                                    </IconButton>
                                }>
                                    <ListItemText
                                        primary={`${index + 1}. ${phrase.text}`}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                color: '#666'
                                            }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRetry}
                            sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold'
                            }}
                        >
                            🔄 Try Again
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => onBackToConversations && onBackToConversations()}
                            sx={{
                                px: 3,
                                py: 1.5,
                                borderRadius: 2
                            }}
                        >
                            ✅ Back to Conversations
                        </Button>
                    </Box>
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
                    <DifficultyBadge difficultyLevel={difficultyLevel} />
                </Box>

                <ProgressBar current={currentPhraseIndex} total={conversation.phrases.length} />

                {/* Barra de progresso de carregamento de áudio */}
                {loadingProgress > 0 && loadingProgress < 100 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#00ffff', mb: 1 }}>
                            🔊 Carregando áudio... {loadingProgress}%
                        </Typography>
                        <ProgressBar
                            variant="determinate"
                            value={loadingProgress}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#00ffff',
                                    borderRadius: 2,
                                }
                            }}
                        />
                    </Box>
                )}

                <FeedbackDisplay feedback={feedback} />

                <TextField
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        // Iniciar timer na primeira digitação
                        if (!startTime) {
                            setStartTime(Date.now());
                        }
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Type what you hear..."
                    sx={{ mb: 2 }}
                    ref={textFieldRef}
                    inputProps={{
                        autoComplete: 'off',
                        autoCorrect: 'off',
                        spellCheck: 'false'
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            id="speak-button"
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => speak(currentPhrase)}
                            disabled={!currentPhrase}
                        >
                            Speak
                        </Button>
                        <Button
                            id="hint-button"
                            variant="outlined"
                            onClick={giveHint}
                            disabled={!currentPhrase || isCorrect}
                        >
                            Hint
                        </Button>

                        {/* Speed Control Button */}
                        <Button
                            id="speed-button"
                            variant="outlined"
                            startIcon={<SpeedIcon />}
                            endIcon={<ExpandMoreIcon />}
                            onClick={handleSpeedMenuOpen}
                            sx={{ minWidth: '100px' }}
                        >
                            {formatPlaybackRate(playbackRate)}
                        </Button>
                        <Menu
                            anchorEl={speedMenuAnchor}
                            open={Boolean(speedMenuAnchor)}
                            onClose={handleSpeedMenuClose}
                        >
                            {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                                <MenuItem
                                    key={rate}
                                    onClick={() => setSpeed(rate)}
                                    selected={playbackRate === rate}
                                >
                                    {rate}x
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {isCorrect ? (
                        <Button
                            id="next-button"
                            variant="contained"
                            color="success"
                            onClick={handleNextPhrase}
                            endIcon={<PlayArrowIcon />}
                        >
                            Next Phrase
                        </Button>
                    ) : (
                        <Button
                            id="check-button"
                            variant="contained"
                            color="secondary"
                            onClick={handleCheck}
                            disabled={!userInput.trim()}
                        >
                            Check
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
