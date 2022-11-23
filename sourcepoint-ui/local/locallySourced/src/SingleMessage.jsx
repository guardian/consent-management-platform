import {useEffect, useState} from 'react'
import './App.css'
import {
	BrowserRouter as Router,
	Route,
	Link,
	useParams
} from "react-router-dom";
import axios from "axios";

export default function SingleMessage() {
	let params = useParams();
	const [messageID, setMessageID] = useState(params.message_id)
	const [customCSS, setCustomCSS] = useState('')
	const [iframeSRC, setIframeSRC] = useState(`https://sourcepoint.theguardian.com/index.html?message_id=${messageID}&consentUUID=null&version=v1`)

	useEffect(()=>{
		setIframeSRC(prev => {
			return `https://sourcepoint.theguardian.com/index.html?message_id=${messageID}&consentUUID=null&version=v1`
		})

		const options = { json: true }
		axios.get(iframeSRC, options).then((response) => {
			setCustomCSS(existing => {
				console.log(response.data)
				return response.data
			})
		});
	}, [messageID])

	return (
		<div className="App">
			<iframe src={iframeSRC} width="100%" height="100%"></iframe>
		</div>
	)
}




