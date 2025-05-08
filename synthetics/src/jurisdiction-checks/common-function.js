import {
	CloudWatchClient,
	PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import { loadPage, makeNewBrowser, makeNewPage } from "../utils/browser-utils";
import { checkCMPIsOnPage } from "../utils/cmp-checks";
import { Log } from "../utils/log";

export const logCMPLoadTimeAndVersion = async (
	loadingTime,
	cmpVersion,
	config,
) => {
	Log.info(`Logging Timestamp: Start`);
	Log.info(`CMP Loading Time: ${loadingTime}`);
	Log.info(`CMP Version: ${cmpVersion}`);

	await sendMetricData(config, loadingTime, cmpVersion);

	Log.info(`Logging Timestamp: Complete`);
};

export const sendMetricData = async (
	config,
	timeToLoadInSeconds,
	cmpVersion,
) => {
	Log.info(`config.platform.toUpperCase() ${config.stage.toUpperCase()})`);
	const region = config.region;
	const client = new CloudWatchClient({ region: region });
	const params = {
		MetricData: [
			{
				MetricName: "CmpLoadingTime",
				Dimensions: [
					{
						Name: "ApplicationName",
						Value: "consent-management-platform",
					},
					{
						Name: "Stage",
						Value: config.platform.toUpperCase(),
					},
				],
				Unit: "Seconds",
				Value: timeToLoadInSeconds,
			},
			{
				MetricName: "CmpVersion",
				Dimensions: [
					{
						Name: "ApplicationName",
						Value: "consent-management-platform",
					},
					{
						Name: "Stage",
						Value: config.platform.toUpperCase(),
					},
				],
				Unit: "None",
				Value: cmpVersion,
			},
		],
		Namespace: "Application",
	};

	const command = new PutMetricDataCommand(params);

	await client.send(command);
};

export const checkCMPLoadingTimeAndVersion = async (page, config) => {
	if (!config.isRunningAdhoc) {
		Log.info("Checking CMP Loading Time and CMP Version: Start");
		const startTimeStamp = Date.now();
		await loadPage(page, config.frontUrl);
		await checkCMPIsOnPage(page); // Wait for CMP to appear
		const endTimeStamp = Date.now();
		const loadingTime = (endTimeStamp - startTimeStamp) / 1000; //in seconds

		const functionToGetVersion = function () {
			return window._sp_.version;
		};
		const cmpVersionString = await page.evaluate(functionToGetVersion);
		const cmpVersionDouble = parseFloat(
			cmpVersionString.replace(/\./g, ""),
		);
		await logCMPLoadTimeAndVersion(loadingTime, cmpVersionDouble, config);
		Log.info("Checking CMP Loading Time and CMP Version: Finished");
	}
};

/**
 * @summary Check the CMP loading time and version
 *
 */
export const setupBrowserAndPageForLoggingMetrics = async (config) => {
	const browserForCMPLoadTime = await makeNewBrowser(false);

	const pageForCMPLoadTime = await makeNewPage(browserForCMPLoadTime);
	await checkCMPLoadingTimeAndVersion(pageForCMPLoadTime, config);

	await pageForCMPLoadTime.close();
	await browserForCMPLoadTime.close();
};
