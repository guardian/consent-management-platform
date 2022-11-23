import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter,
	Routes,
	Route
} from "react-router-dom";
import SingleMessage from "./SingleMessage";

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />}/>
				<Route path="/message/:message_id" element={<SingleMessage />}/>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)
