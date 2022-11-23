'use strict';

import Hapi from '@hapi/hapi'
import puppeteer from 'puppeteer';
import axios from "axios";

const proxy = async (req) => {
	axios.get(`https://sourcepoint.theguardian.com/${req.params.asset}`)
		.then(response => {
			return response.data
		})
}

 const bannerRender = async (req) => {
	 const messageID = req.params.message_id
 	try {
 		const browser = await puppeteer.launch();
 		const page = await browser.newPage();

 		await page.goto(`https://sourcepoint.theguardian.com/index.html?message_id=${messageID ? messageID : 717122}&consentUUID=null&version=v1`);
		const exampleElementSelector = '.body-copy';
		await page.waitForSelector(exampleElementSelector);
 		const data = await page.evaluate(() => document.querySelector('*').outerHTML);

 		await browser.close();
 		return data
 	} catch (err) {
 		console.error(err);
 	}
 }

const init = async () => {
	const server = Hapi.server({
		port: 3000,
		host: 'localhost'
	});

	// server.route({
	// 	method: 'GET',
	// 	path: '/{asset}',
	// 	handler: proxy
	// });

	server.route({
		method: 'GET',
		path: '/',
		handler: (request, h) => {
			return 'Hello World!';
		}
	});

	server.route({
		method: 'GET',
		path: '/message/{message_id}',
		handler: bannerRender
	});

	await server.start();
	console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

	console.log(err);
	process.exit(1);
});

init();
