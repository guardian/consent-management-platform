import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
	const [messageID, setMessageID] = useState(738246)

  return (
    <div className="App">
		<iframe src={`https://sourcepoint.theguardian.com/index.html?message_id=${messageID}&consentUUID=null&version=v1`} width="100%" height="100%"></iframe>
    </div>
  )
}

export default App
