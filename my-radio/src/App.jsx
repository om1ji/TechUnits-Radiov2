import { useState } from 'react'
import './App.css'
import Player from './components/Player/Player'
import StreamItem from './components/StreamItem/StreamItem'
import { streams } from './data/streams'

function App() {
  const [selectedStream, setSelectedStream] = useState(null)

  const containerStyle = selectedStream ? {
    '--bg-image': `url(${selectedStream.backgroundImage || '/images/default-background.jpg'})`
  } : {}

  return (
    <div className="app-container" style={containerStyle}>
      {!selectedStream ? (
        <div className="streams-list">
          {streams.map(stream => (
            <StreamItem
              key={stream.id}
              stream={stream}
              onSelect={setSelectedStream}
            />
          ))}
        </div>
      ) : (
        <div className="player-container">
          <button 
            className="back-button"
            onClick={() => setSelectedStream(null)}
          >
            {"<"}
          </button>
          <Player stream={selectedStream} />
        </div>
      )}
    </div>
  )
}

export default App
