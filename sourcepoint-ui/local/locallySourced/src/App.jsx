import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'

function App() {
	return (
		<div className="App">
			<p>To get started, please navigate to <code>/message/[sourcepoint_message_id]</code> (e.g. <span><a href={"/message/717122"}>http://localhost:5173/message/717122</a></span>)</p>
		</div>
	)
}

export default App
