const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Ensure the path resolves directly to the artifacts folder
        const htmlPath = 'file://' + path.resolve(__dirname, 'artifacts', 'Zero_Sum_RPG_Core_Rules_DE.html');
        
        console.log(`Loading: ${htmlPath}`);
        await page.goto(htmlPath, { waitUntil: 'networkidle0' });
        
        // Ensure web fonts are fully loaded before rendering
        await page.evaluateHandle('document.fonts.ready');
        // Add a small delay for good measure regarding images
        await new Promise(resolve => setTimeout(resolve, 500));

        await page.pdf({
            path: path.resolve(__dirname, 'artifacts', 'Zero_Sum_RPG_Core_Rules_DE.pdf'),
            format: 'A4',
            printBackground: true, // IMPORTANT for dark mode CSS!
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        });
        
        console.log('PDF successfully generated with custom CSS and Web Fonts!');
        await browser.close();
    } catch (e) {
        console.error('Failed to generate PDF:', e);
        process.exit(1);
    }
})();
