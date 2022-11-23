import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import axios from "axios";
import { BrowserRouter,
	Routes,
	Route
} from "react-router-dom";
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [messageID, setMessageID] = useState(738246)
	const [customCSS, setCustomCSS] = useState('')
	const [iframeSRC, setIframeSRC] = useState(`https://sourcepoint.theguardian.com/index.html?message_id=${messageID}&consentUUID=null&version=v1`)

	useEffect(()=>{
		setIframeSRC(prev => {
			return `https://sourcepoint.theguardian.com/index.html?message_id=${messageID}&consentUUID=null&version=v1`
		})

		const options = { json: true }
		axios.get(iframeSRC, options).then((response) => {
			console.log(response.data)
		});
	}, [messageID])



  return (
    <div className="App">
		<iframe src={iframeSRC} width="100%" height="100%"></iframe>
    </div>
  )
}

export default App
