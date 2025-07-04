// import puppeteer from "puppeteer";

// import dotenv from 'dotenv';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const waitFor = (time) => new Promise(resolve => setTimeout(resolve, time));

// dotenv.config();

async function sendTelegramMessage(text) {
  const token = '7949811771:AAEG7eywRMob_bFr1WsgsGKqYa8-oCToWjs';
  const chatId = '-1002556767038';
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true, // Set to true for server (like Render), false for local debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto("https://oddspedia.com/hot-bets", { timeout: 0 });

  await page.waitForFunction(
    () => document.querySelectorAll('.hot-bets-stats-table-row').length > 0,
    { timeout: 60000 }
  );

  
//   arranging in order
let first_odd = "";
while (first_odd !== "100%") {
  first_odd = await page.evaluate(() => {
    const el = document.querySelector(".league-betting-stats-table-column-percentage__value");
    return el ? el.innerText.trim() : "";
  });

  if (first_odd !== "100%") {
    // console.log("Not 100% yet, waiting...");
    await page.evaluate(() => {
        //clciking button to ararnge 
        const sort = document.querySelectorAll('.league-betting-stats-table-heading')[1].click()
    })
    await waitFor(5000);
  }
}
// console.log("arranged");

  const results = await page.evaluate(() => {
    const matches = [];
    const rows = document.querySelectorAll('.hot-bets-stats-table-row');

    for (const row of rows) {
      const percents = row.querySelectorAll('.hot-bets-stats-table-row__percent');
      if (percents.length >= 2) {
        const odd1 = percents[0].innerText.trim();
        const odd2 = percents[1].innerText.trim();

        if (odd1 === "100%" && odd2 === "100%") {
          const team1 = row.querySelectorAll(".match-team")[0]?.innerText.trim() || "Team 1";
          const team2 = row.querySelectorAll(".match-team")[1]?.innerText.trim() || "Team 2";
          const match = row.querySelector('.match-breadcrumbs')?.innerText.trim() || "N/A";
          const label = row.querySelector('.hot-bets-stats-table-row__market-label')?.innerText.trim() || "N/A";
          matches.push({ match, label, team1, team2 });
        }
      }
    }

    return matches;
  });

  if (results.length > 0) {
    let message = '✅ Bets:\n\n';
    results.forEach((item, i) => {
      message += `${i + 1}. ${item.match}\nteam1: ${item.team1} \n team2: ${item.team2}\n ${item.label}\n\n`;
    });

    await sendTelegramMessage(message);
  } else {
    await sendTelegramMessage("❌ No 100% matches found.");
  }

  await browser.close();
}

run();
