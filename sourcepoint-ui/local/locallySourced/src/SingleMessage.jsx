import {useEffect, useState} from 'react'
import { useParams } from "react-router-dom";
import axios from "axios";
import './App.css'

const stylePattern = /(?<=<style id="custom-styles">)[\s\S]*?(?=<\/style>)/gm;
const polyPattern = /src="\/polyfills/g;
const hrefPattern = /href="\//g;
const noticePattern = /\/Notice\.[a-z0-9]{3,6}\.js/
const polySRCPattern = /\/polyfills\.[a-z0-9]{3,6}\.js/
const hostnamePattern = /"\//
const replacementScriptTagPattern = /<script type="text\/javascript" src="\/Notice.[a-z0-9]{3,6}\.js"><\/script>/
const polyScriptTagPattern = /<script type="text\/javascript" src="\/polyfills.[a-z0-9]{3,6}\.js"><\/script>/

const SPURL = "https://sourcepoint.theguardian.com"

export default function SingleMessage() {
	const savingParamsFromTheSPiFrame = {
		message_id: "717122",
		consentUUID: null,
		requestUUID: "bbb263f2-dd60-4d4f-9d31-b953a617c3cf",
		preload_message: true,
		hasCsp: true,
		version: "v1"
	}

	let params = useParams();

	const [messageID, setMessageID] = useState(params.message_id)
	const [customCSS, setCustomCSS] = useState('')
	const [apiCallURL, setApiCallURL] = useState(`/api/message/${messageID}`)
	const [iframeSRCDOC, setIframeSRCDOC] = useState('<div>working</div>')

	useEffect(()=>{
		setApiCallURL(prev => {
			return `/api/message/${messageID}`
		})

		const options = {}

		// fetch the html from sourcepoint based on the message id
		// store that html in a let or const
		// grab contents of the working css file
		// select target style tag
		// replace target style tag with contents of working css file
		// rerender
		// rerender on saving the working css file (keep up to date)

		console.log(`iframeSRC: ${apiCallURL}`)
		axios.get(apiCallURL, options)
			.then((response) => {

				const customStyleElementContents = response.data.match(stylePattern)

				const noticeResult = response.data.match(noticePattern)
				const polyResult = response.data.match(polySRCPattern)

				const polyReplaced = response.data.replace(polyPattern, `src="${SPURL}/polyfills`)
				const hrefReplaced = polyReplaced.replace(hrefPattern, `href="${SPURL}/`)

				axios.get(`${SPURL}${noticeResult[0]}`, options).then(res => {
					const updatedNoticeJS = res.data.replace(hostnamePattern, `"${SPURL}/`)
					// const newNoticeScript = `<script type="text/javascript">${"updatedNoticeJS"}</script>`
					const newNoticeScript = `<script type="text/javascript"></script>`
					const domWithNewNoticeScript = hrefReplaced.replace(replacementScriptTagPattern, newNoticeScript)

					axios.get(`${SPURL}${polyResult[0]}`, options).then(r => {
						const updatedPolyJS = r.data.replace(hostnamePattern, `"${SPURL}/`)
						const newPolyScript = `<script type="text/javascript">${updatedPolyJS}</script>`
						const domWithNewPolyScript = domWithNewNoticeScript.replace(polyScriptTagPattern, newPolyScript)

						setIframeSRCDOC(prev => {
							return domWithNewPolyScript
						})
					})
				})

			// setCustomCSS(existing => {
			// 	// console.log(response.data)
			// 	return response.data
			// })
		});
	}, [messageID])

	useEffect(() => {

	}, [customCSS])

	return (
		<div className="App">
			<iframe srcDoc={iframeSRCDOC} width="100%" height="100%"></iframe>
		</div>
	)
}




