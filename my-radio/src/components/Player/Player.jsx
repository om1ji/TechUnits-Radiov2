import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// Добавьте в начало файла определение Safari
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                /iPad|iPhone|iPod/i.test(navigator.userAgent);

const Player = ({ stream }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isOnline, setIsOnline] = useState(false);
    const [metadata, setMetadata] = useState({
        title: '',
        artist: '',
        listeners: 0
    });
    const audioRef = useRef(null);

    const streamUrl = stream.streamUrl;
    const statsUrl = stream.statsUrl;

    const checkStreamStatus = useCallback(async () => {
        try {
            const response = await fetch(statsUrl);
            const data = await response.json();

            if (data.icestats && data.icestats.source) {
                const sources = Array.isArray(data.icestats.source)
                    ? data.icestats.source
                    : [data.icestats.source];

                const activeStream = sources.find(source =>
                    source.listenurl && source.listenurl.includes(stream.name.toLowerCase())
                );

                setIsOnline(!!activeStream);

                if (activeStream) {
                    setMetadata({
                        title: activeStream.title || activeStream.song || '',
                        artist: activeStream.artist || '',
                        listeners: activeStream.listeners || 0
                    });
                } else {
                    setMetadata({
                        title: 'Поток не активен',
                        artist: '',
                        listeners: 0
                    });
                }
            } else {
                setIsOnline(false);
                setMetadata({
                    title: 'Нет данных',
                    artist: '',
                    listeners: 0
                });
            }
        } catch (error) {
            console.error('Ошибка при проверке статуса:', error);
            setIsOnline(false);
            setMetadata({
                title: 'Ошибка получения данных',
                artist: '',
                listeners: 0
            });
        }
    }, [statsUrl, stream.name]);

    useEffect(() => {
        checkStreamStatus();
        const interval = setInterval(checkStreamStatus, 10000);
        return () => clearInterval(interval);
    }, [stream, checkStreamStatus]);

    useEffect(() => {
        if (!isOnline && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isOnline, isPlaying]);

    const handleVolumeChange = (e) => {
        const value = parseFloat(e.target.value);
        setVolume(value);
        if (audioRef.current) {
            audioRef.current.volume = value;
        }
    };

    const togglePlay = async () => {
        if (!isOnline) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                // Для Safari: пересоздаём аудио элемент перед воспроизведением
                if (isSafari) {
                    audioRef.current.src = streamUrl;
                    audioRef.current.load();
                }
                await audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.error('Ошибка воспроизведения:', error);
        }
    };

    return (
        <div className="player-container">
            <div className="player-wrapper">
                <div className="track-info stream-title">
                    <div>{metadata.title || 'Нет данных'}</div>
                    {metadata.artist && <div>{metadata.artist}</div>}
                </div>
                <div className="player-controls">
                    {isOnline && (
                        <div className="volume-control">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                        </div>
                    )}

                    <button
                        className="play-button"
                        onClick={togglePlay}
                        disabled={!isOnline}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>


                </div>

                <audio
                    ref={audioRef}
                    src={streamUrl}
                    preload="none"
                    playsInline
                    webkit-playsinline="true"
                />
            </div>
        </div>
    );
};

Player.propTypes = {
    stream: PropTypes.shape({
        streamUrl: PropTypes.string.isRequired,
        statsUrl: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired
};

export default Player; 