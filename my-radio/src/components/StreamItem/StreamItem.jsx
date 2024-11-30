import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './StreamItem.css';

const StreamItem = ({ stream, onSelect }) => {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const checkStreamStatus = async () => {
            try {
                const response = await fetch(stream.statsUrl);
                const data = await response.json();
                
                if (data.icestats && data.icestats.source) {
                    const sources = Array.isArray(data.icestats.source) 
                        ? data.icestats.source 
                        : [data.icestats.source];
                    
                    const activeStream = sources.find(source => 
                        source.listenurl && source.listenurl.includes(stream.name.toLowerCase())
                    );
                    
                    setIsOnline(!!activeStream);
                } else {
                    setIsOnline(false);
                }
            } catch {
                setIsOnline(false);
            }
        };

        checkStreamStatus();
        const interval = setInterval(checkStreamStatus, 10000);
        return () => clearInterval(interval);
    }, [stream]);

    const style = {
        '--bg-image': `url(${stream.backgroundImage || '/images/default-background.jpg'})`,
    };

    return (
        <div 
            className={`stream-item ${!isOnline ? 'stream-item-offline' : ''}`}
            onClick={() => isOnline && onSelect(stream)}
            style={style}
        >
            <div className="stream-item-content">
                {stream.logo && <img src={stream.logo} alt={stream.name} className="stream-item-logo" />}
                <div className="stream-name">{stream.name}</div>
                <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`} />
            </div>
        </div>
    );
};

StreamItem.propTypes = {
    stream: PropTypes.shape({
        name: PropTypes.string.isRequired,
        logo: PropTypes.string,
        statsUrl: PropTypes.string.isRequired,
        backgroundImage: PropTypes.string
    }).isRequired,
    onSelect: PropTypes.func.isRequired
};

export default StreamItem; 