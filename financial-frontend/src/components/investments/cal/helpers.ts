import * as cheerio from 'cheerio';


export const fmt = (n: number) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n)

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })



export const fetchAndPrintDynamicCalFunds = async () => {
  const url = "https://www.utasl.lk/unit-prices/";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlString = await response.text();
    const $ = cheerio.load(htmlString);
    
    const allFunds: any[] = [];
    const headers: string[] = [];

    // 1. Dynamically grab the table headers to use as our object keys
    $("table thead th").each((index, element) => {
      // e.g., "Management Company", "Fund Name", etc.
      headers.push($(element).text().trim()); 
    });

    // 2. Loop through every row in the table body
    $("table tbody tr").each((index, element) => {
      const columns = $(element).find("td");
      
      // We use 'any' so we aren't restricted to a strict TypeScript interface
      const fundData: any = {}; 

      if (columns.length > 0) {
        // 3. Map each cell to its corresponding dynamic header
        columns.each((colIndex, colEl) => {
          const key = headers[colIndex] || `Column_${colIndex + 1}`;
          fundData[key] = $(colEl).text().trim();
        });
        
        allFunds.push(fundData);
      }
    });

    // 4. Filter for only Capital Alliance funds
    // By turning the object into a JSON string, we can search the entire object at once
    const calFunds = allFunds.filter(fund => {
      const rawString = JSON.stringify(fund).toLowerCase();
      return rawString.includes("capital alliance");
    });

    console.log(`✅ Successfully extracted ${calFunds.length} CAL funds.\n`);

    // 5. Print EVERY key and value dynamically
    calFunds.forEach((fund, index) => {
      console.log(`--- CAL Fund #${index + 1} ---`);
      
      for (const [key, value] of Object.entries(fund)) {
        console.log(`   ${key}: ${value}`);
      }
      
      console.log("\n"); // Spacing between funds
    });

    return calFunds;

  } catch (error) {
    console.error("Error scraping UTASL dynamically:", error);
    return [];
  }
};

// Execute it
fetchAndPrintDynamicCalFunds();