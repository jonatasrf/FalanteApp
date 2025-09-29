import { useState, useEffect, useCallback, useRef } from 'react';

export const useTts = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const currentAudioRef = useRef(null);
    const audioCache = useRef(new Map()); // Cache para armazenar áudios pré-carregados
    const isPreloading = useRef(false);

    // Função para pré-carregar áudio
    const preloadAudio = useCallback(async (audioPath) => {
        if (!audioPath || audioCache.current.has(audioPath)) {
            return audioCache.current.get(audioPath);
        }

        try {
            const audio = new Audio();

            // Configurar preload
            audio.preload = 'auto';
            audio.src = audioPath;

            // Promise para controlar o carregamento
            const loadPromise = new Promise((resolve, reject) => {
                audio.oncanplaythrough = () => {
                    console.log(`✅ Audio pré-carregado: ${audioPath}`);
                    resolve(audio);
                };

                audio.onerror = (error) => {
                    console.error(`❌ Erro ao pré-carregar áudio: ${audioPath}`, error);
                    reject(error);
                };

                // Timeout de 10 segundos para evitar travamentos
                setTimeout(() => {
                    if (audio.readyState < 4) {
                        console.warn(`⏰ Timeout no pré-carregamento: ${audioPath}`);
                        reject(new Error('Preload timeout'));
                    }
                }, 10000);
            });

            // Armazenar no cache
            audioCache.current.set(audioPath, { audio, promise: loadPromise, loaded: false });

            // Marcar como carregado quando terminar
            await loadPromise;
            audioCache.current.get(audioPath).loaded = true;

            return audio;
        } catch (error) {
            console.error(`Erro ao pré-carregar ${audioPath}:`, error);
            audioCache.current.delete(audioPath);
            return null;
        }
    }, []);

    // Função para pré-carregar múltiplos áudios com barra de progresso
    const preloadMultipleAudios = useCallback(async (audioPaths, maxConcurrent = 3, onProgress) => {
        if (isPreloading.current) return;

        isPreloading.current = true;
        let loadedCount = 0;
        const totalCount = audioPaths.length;

        const updateProgress = () => {
            loadedCount++;
            const progress = Math.round((loadedCount / totalCount) * 100);
            if (onProgress) onProgress(progress);
        };

        const promises = [];

        for (let i = 0; i < audioPaths.length; i += maxConcurrent) {
            const batch = audioPaths.slice(i, i + maxConcurrent);
            const batchPromises = batch.map(async (path) => {
                await preloadAudio(path);
                updateProgress();
            });
            promises.push(...batchPromises);

            // Pequena pausa entre batches para não sobrecarregar
            if (i + maxConcurrent < audioPaths.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        try {
            await Promise.allSettled(promises);
            console.log(`🎵 Pré-carregamento concluído: ${audioPaths.length} áudios`);
            if (onProgress) onProgress(100);
        } catch (error) {
            console.error('Erro no pré-carregamento em lote:', error);
            if (onProgress) onProgress(100); // Considerar completo mesmo com erro
        } finally {
            isPreloading.current = false;
        }
    }, [preloadAudio]);

    // Função para limpar cache antigo (manter apenas os últimos 20 áudios)
    const cleanupCache = useCallback(() => {
        if (audioCache.current.size > 20) {
            const entries = Array.from(audioCache.current.entries());
            const toRemove = entries.slice(0, entries.length - 20);

            toRemove.forEach(([path, cached]) => {
                if (cached.audio) {
                    cached.audio.src = '';
                    cached.audio = null;
                }
                audioCache.current.delete(path);
            });

            console.log(`🧹 Cache limpo: ${toRemove.length} áudios removidos`);
        }
    }, []);

    // Função otimizada para falar
    const speak = useCallback(async (sentence, onEnd, onError) => {
        const audioPath = sentence?.audioPath;

        if (!audioPath) {
            setIsSpeaking(false);
            if (onEnd) onEnd();
            return;
        }

        // Clear any existing timeout to debounce calls
        if (window.speechSynthesis.__speakTimeout) {
            clearTimeout(window.speechSynthesis.__speakTimeout);
        }

        // Stop any currently playing audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        window.speechSynthesis.__speakTimeout = setTimeout(async () => {
            setIsSpeaking(true);
            setLoadingProgress(0);

            try {
                let audio;

                // Verificar se já está no cache
                const cached = audioCache.current.get(audioPath);
                if (cached && cached.loaded) {
                    audio = cached.audio;
                    console.log(`⚡ Áudio carregado do cache: ${audioPath}`);
                } else {
                    // Criar novo áudio com otimizações
                    audio = new Audio();
                    audio.preload = 'auto';
                    audio.src = audioPath;

                    // Mostrar progresso de carregamento
                    audio.onprogress = () => {
                        if (audio.buffered.length > 0) {
                            const loaded = (audio.buffered.end(0) / audio.duration) * 100;
                            setLoadingProgress(Math.round(loaded));
                        }
                    };

                    // Aguardar carregamento mínimo antes de tocar
                    await new Promise((resolve, reject) => {
                        const onCanPlay = () => {
                            audio.removeEventListener('canplay', onCanPlay);
                            audio.removeEventListener('error', onError);
                            resolve();
                        };

                        const onError = (error) => {
                            audio.removeEventListener('canplay', onCanPlay);
                            audio.removeEventListener('error', onError);
                            reject(error);
                        };

                        audio.addEventListener('canplay', onCanPlay);
                        audio.addEventListener('error', onError);

                        // Timeout de 5 segundos
                        setTimeout(() => {
                            if (audio.readyState < 3) {
                                reject(new Error('Audio load timeout'));
                            }
                        }, 5000);
                    });

                    // Armazenar no cache para uso futuro
                    audioCache.current.set(audioPath, { audio, loaded: true });
                    cleanupCache();
                }

                currentAudioRef.current = audio;

                // Configurar eventos
                audio.onended = () => {
                    setIsSpeaking(false);
                    setLoadingProgress(0);
                    currentAudioRef.current = null;
                    if (onEnd) onEnd();
                };

                audio.onerror = (event) => {
                    setIsSpeaking(false);
                    setLoadingProgress(0);
                    currentAudioRef.current = null;
                    if (onError) onError(event);
                    console.error("Audio playback error:", event);
                };

                // Tocar áudio
                await audio.play();
                setLoadingProgress(100);

            } catch (error) {
                setIsSpeaking(false);
                setLoadingProgress(0);
                currentAudioRef.current = null;
                if (onError) onError(error);
                console.error("Erro ao reproduzir áudio:", error);
            }
        }, 50); // Debounce reduzido para resposta mais rápida
    }, [cleanupCache]);

    // Função para parar áudio
    const stop = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setLoadingProgress(0);
    }, []);

    // Cleanup ao desmontar componente
    useEffect(() => {
        return () => {
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            // Limpar cache
            audioCache.current.forEach((cached) => {
                if (cached.audio) {
                    cached.audio.src = '';
                }
            });
            audioCache.current.clear();
        };
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        loadingProgress,
        preloadAudio,
        preloadMultipleAudios,
        cacheSize: audioCache.current.size
    };
};
