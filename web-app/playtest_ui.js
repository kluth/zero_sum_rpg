const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Starte LIVE UI Playtest...");
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Console-Logs der App abfangen (z.B. WhisperNet SSE Streams)
    page.on('console', msg => console.log('APP-LOG:', msg.text()));
    
    try {
        console.log("Navigiere zur Live-Seite...");
        await page.goto('http://localhost:4200', { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log("Seite geladen. Lasse den Handler-Algorithmus (SSE) 15 Sekunden wirken...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        console.log("Lese den finalen Zustand des UIs...");
        const html = await page.content();
        
        // Speichere das DOM zur Analyse
        fs.writeFileSync('Live_UI_Playtest_Log.html', html);
        
        console.log("Mache einen Screenshot der Diegetic UI...");
        await page.screenshot({ path: 'Live_UI_Screenshot.png', fullPage: true });
        
        console.log("UI-Test erfolgreich abgeschlossen. Daten gespeichert.");
    } catch (e) {
        console.error("Fehler beim UI-Playtest:", e);
    } finally {
        await browser.close();
    }
})();
