// eslint-disable-next-line import/no-unresolved -- @amzn/synthetics-playwright only exists in the CloudWatch runtime
import { synthetics } from '@amzn/synthetics-playwright';


export const handler = async () => {
  try {
        // Launch a browser
        const browser = await synthetics.launch();

        // Create a new page
        const page = await synthetics.newPage(browser);

        // Navigate to a website
        await page.goto('https://www.example.com', {timeout: 30000});

        // Take screenshot
        await page.screenshot({ path: '/tmp/example.png' });

    } finally {
        // Ensure browser is closed
        await synthetics.close();
    }
};
