import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto("https://oddspedia.com/hot-bets", { timeout: 0 });

  await page.waitForFunction(
    () => document.querySelectorAll('.hot-bets-stats-table-row').length > 0,
    { timeout: 60000 }
  );
//   await page.waitForTimeout(2000);

  const results = await page.evaluate(() => {
    const matches = [];
    const rows = document.querySelectorAll('.hot-bets-stats-table-row');

    for (const row of rows) {
      const percents = row.querySelectorAll('.hot-bets-stats-table-row__percent');
      if (percents.length >= 2) {
        const odd1 = percents[0].innerText.trim();
        const odd2 = percents[1].innerText.trim();

        if (odd1 === "100%" && odd2 === "100%") {
            const team1 = row.querySelectorAll(".match-team")[0].innerText.trim();
            const team2 = row.querySelectorAll(".match-team")[1].innerText.trim();
          const match = row.querySelector('.match-breadcrumbs')?.innerText.trim() || "N/A";
          const label = row.querySelector('.hot-bets-stats-table-row__market-label')?.innerText.trim() || "N/A";
          matches.push({ match, label ,team1 ,team2 });
        }
      }
    }

    return matches;
  });

  if (results.length > 0) {
    console.log("✅ 100% Hot Bets:");
    results.forEach((item, i) => {
      console.log(`${i + 1}`);
      console.log(item.match);
      console.log(`team1: ${item.team1}`);
      console.log(`team2: ${item.team2}`);
      console.log(`${item.label}\n`);
    });
  } else {
    console.log("No 100% matches found.");
  }

  // await browser.close();
}

run();


