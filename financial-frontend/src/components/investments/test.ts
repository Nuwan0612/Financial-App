const fetchSpecificSymbolsFromMarket = async (mySymbols: string[]) => {
  const url = "https://www.cse.lk/api/tradeSummary"; // Endpoint uses 'a'

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": "0" 
      }
    });

    const data = await response.json();
    
    // FIX: Match the API's exact spelling (Summery with an 'e')
    const allStocks = data.reqTradeSummery;

    if (!Array.isArray(allStocks)) {
      console.error("Failed to find the stock array. Something else is wrong.");
      return;
    }

    // Filter for your specific symbols
    const myWatchlist = allStocks.filter((stock: any) => 
      mySymbols.includes(stock.symbol)
    );

    console.log("Filtered Watchlist Data:", myWatchlist);
    return myWatchlist;
    
  } catch (error) {
    console.error("Error fetching market summary:", error);
  }
};

const fetchSingleStockPrice = async (symbol: string) => {
  const url = "https://www.cse.lk/api/companyInfoSummery";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        // Must be form-urlencoded, NOT application/json
        "Content-Type": "application/x-www-form-urlencoded",
        // These headers help bypass basic bot protection
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest"
      },
      // URLSearchParams formats it exactly how the CSE server wants it
      body: new URLSearchParams({ symbol: symbol }).toString(),
    });

    const data = await response.json();
    console.log(`Price data for ${symbol}:`, data);
    
  } catch (error) {
    console.error("Error fetching single stock:", error);
  }
};

const fetchAllSectors = async () => {
  const url = "https://www.cse.lk/api/allSectors";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": "0" 
      }
    });

    const data = await response.json();
    
    // The API usually returns the sectors inside a specific key, 
    // or as a direct array. We will log the raw data to be safe.
    console.log("Raw Sectors Data:", data);
    
    // Check if it's an array directly, or nested inside something like 'reqSectors'
    const sectors = Array.isArray(data) ? data : data.reqSectors || data.sectors || data;
    
    return sectors;

  } catch (error) {
    console.error("Error fetching sectors:", error);
  }
};

const fetchAllCompanies = async () => {
  const url = "https://www.cse.lk/api/allSecurityCode";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": "0" 
      }
    });

    const data = await response.json();
    
    console.log("Raw Companies Data:", data);
    
    // Similar to above, extract the array based on how the CSE server structures it
    const companies = Array.isArray(data) ? data : data.reqSecurityCode || data.securityCodes || data;
    
    return companies;

  } catch (error) {
    console.error("Error fetching all security codes:", error);
  }
};


const fetchSp20Companies = async () => {
  const url = "https://www.cse.lk/api/spsl";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": "0" 
      }
    });

    const data = await response.json();
    
    // The S&P SL20 companies are stored inside the 'reqSNPIndices' key
    const sp20Stocks = data.reqSNPIndices;

    if (!Array.isArray(sp20Stocks)) {
      console.error("Could not find the S&P 20 array in the response.");
      return [];
    }

    console.log("S&P SL20 Companies:", sp20Stocks);
    return sp20Stocks;

  } catch (error) {
    console.error("Error fetching S&P SL20:", error);
    return [];
  }
};

const checkIsSp20 = async (symbolToCheck: string) => {
  // 1. Get the list of all 20 companies
  const sp20Stocks = await fetchSp20Companies();
  
  // 2. Check if our symbol is inside that list using the .some() array method
  const isIncluded = sp20Stocks.some((stock: any) => stock.symbol === symbolToCheck);
  
  if (isIncluded) {
    console.log(`✅ ${symbolToCheck} IS in the S&P SL20.`);
  } else {
    console.log(`❌ ${symbolToCheck} is NOT in the S&P SL20.`);
  }
  
  return isIncluded;
};

const fetchCompanyAnnouncements = async (categoryFilter?: string) => {
  const url = "https://www.cse.lk/api/approvedAnnouncement";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Length": "0" 
      }
    });

    const data = await response.json();
    
    // The CSE API stores the array under this specific key
    const allAnnouncements = data.approvedAnnouncements;

    if (!Array.isArray(allAnnouncements)) {
      console.error("Could not find the announcements array.");
      return [];
    }

    // If you passed a specific filter (like "CASH DIVIDEND"), filter the array
    if (categoryFilter) {
      const filtered = allAnnouncements.filter((ann: any) => 
        ann.announcementCategory === categoryFilter
      );
      console.log(`Filtered for ${categoryFilter}:`, filtered);
      return filtered;
    }

    console.log("All Recent Announcements:", allAnnouncements);
    return allAnnouncements;

  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

// Define TypeScript return type
interface CryptoPriceMap {
  [symbol: string]: number;
}

const fetchCryptoPrices = async (symbols: string[]): Promise<CryptoPriceMap> => {
  try {
    // 1. Format symbols into Binance pair format: ["BTC", "ETH"] -> ["BTCUSDT", "ETHUSDT"]
    const formattedPairs = symbols.map(s => `"${s.toUpperCase()}USDT"`);
    
    // 2. Build the query parameter string for Binance
    const queryString = encodeURIComponent(`[${formattedPairs.join(",")}]`);
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=${queryString}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Array<{ symbol: string; price: string }> = await response.json();

    // 3. Map the array response into a clean key-value object: { BTC: 65000.50, ETH: 3500.20 }
    const prices: CryptoPriceMap = {};
    
    data.forEach(item => {
      // Remove 'USDT' from the key name so it matches your input symbol
      const cleanSymbol = item.symbol.replace("USDT", "");
      prices[cleanSymbol] = parseFloat(item.price);
    });

    return prices;

  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return {};
  }
};

// --- HOW TO USE IT ---
const getPrices = async () => {
  const myWatchlist = ["BTC", "ETH", "SOL", "ADA", "XRP"];
  const prices = await fetchCryptoPrices(myWatchlist);
  
  console.log("Current Crypto Prices:", prices);
  // Output example:
  // {
  //   BTC: 65420.5,
  //   ETH: 3480.12,
  //   SOL: 145.8,
  //   ADA: 0.45,
  //   XRP: 0.58
  // }
};

// getPrices();

// --- HOW TO USE IT ---

// 1. Get absolutely everything (Corporate Disclosures, Dealings, etc.)
// fetchCompanyAnnouncements();

// 2. Get ONLY Cash Dividends
// fetchCompanyAnnouncements("CASH DIVIDEND");

// 3. Get ONLY Rights Issues 
// fetchCompanyAnnouncements("RIGHTS ISSUE");




// Run it
// fetchSpecificSymbolsFromMarket(["LOLC.N0000", "COMB.N0000", "HNB.N0000"]);
// fetchSingleStockPrice("LOLC.N0000")
// fetchAllSectors();
// fetchAllCompanies();
// fetchSp20Companies();

// Example test cases:
// checkIsSp20("JKH.N0000");  // Likely returns true (John Keells)
// checkIsSp20("LOLC.N0000"); // Likely returns true (LOLC Holdings)



// Define TypeScript return type
interface UnitTrustDetails {
  company: string;
  fundName: string;
  sellingPrice: number;
  buyingPrice: number;
}

const fetchFundDetails = async (fundKeyword: string): Promise<UnitTrustDetails | null> => {
  try {
    // 1. Fetch the UTASL HTML via a CORS proxy (required for browser execution)
    const targetUrl = encodeURIComponent("https://www.utasl.lk/unit-prices/");
    const proxyUrl = `https://api.allorigins.win/get?url=${targetUrl}`;

    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const proxyData = await response.json();
    
    // 2. Parse the HTML string using the browser's native DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(proxyData.contents, "text/html");

    // 3. Find all table rows containing the price data
    const rows = doc.querySelectorAll("table tbody tr");
    
    // 4. Iterate through rows to find the requested fund
    for (const row of Array.from(rows)) {
      const columns = row.querySelectorAll("td");

      // Ensure the row has the correct number of data columns
      if (columns.length >= 4) {
        const companyName = columns[0].textContent?.trim() || "";
        const fundName = columns[1].textContent?.trim() || "";
        
        // Match the fund name using a case-insensitive search
        if (fundName.toLowerCase().includes(fundKeyword.toLowerCase())) {
          
          return {
            company: companyName,
            fundName: fundName,
            // Remove commas before parsing to float (e.g., "1,245.50" -> 1245.50)
            sellingPrice: parseFloat(columns[2].textContent?.replace(/,/g, "") || "0"),
            buyingPrice: parseFloat(columns[3].textContent?.replace(/,/g, "") || "0")
          };
          
        }
      }
    }

    console.warn(`Fund matching "${fundKeyword}" was not found in the UTASL table.`);
    return null;

  } catch (error) {
    console.error("Error fetching fund details:", error);
    return null;
  }
};

// --- HOW TO USE IT ---
const getMyFund = async () => {
  // FIOF is officially listed as "Fixed Income Opportunities" on the UTASL site
  const fiofDetails = await fetchFundDetails("Fixed Income Opportunities");
  
  console.log("FIOF Details:", fiofDetails);
  
  // Output example:
  // {
  //   company: "Capital Alliance Investments Limited",
  //   fundName: "Capital Alliance Fixed Income Opportunities Fund",
  //   sellingPrice: 12.8745,
  //   buyingPrice: 12.8745
  // }
  
  // You can easily reuse it for other CAL funds too:
  // const equityFund = await fetchFundDetails("Quantitative Equity Fund");
};

// getMyFund();

import * as cheerio from 'cheerio';

// Define TypeScript return type
interface UnitTrustDetails {
  company: string;
  fundName: string;
  sellingPrice: number;
  buyingPrice: number;
}

const fetchAllFunds = async (): Promise<UnitTrustDetails[]> => {
  const url = "https://www.utasl.lk/unit-prices/";

  try {
    // 1. Fetch directly! No proxy needed when running in Node.js
    const response = await fetch(url, {
      headers: {
        // We pretend to be a standard browser to bypass basic anti-bot protections
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlString = await response.text();

    // 2. Load the HTML into Cheerio (Node's version of DOMParser)
    const $ = cheerio.load(htmlString);
    const funds: UnitTrustDetails[] = [];

    // 3. Select all rows in the table and loop through them
    $("table tbody tr").each((index, element) => {
      const columns = $(element).find("td");

      // Ensure the row actually contains data
      if (columns.length >= 4) {
        const company = $(columns[0]).text().trim();
        const fundName = $(columns[1]).text().trim();
        
        // Remove commas and parse string to float (e.g., "1,245.50" -> 1245.50)
        const sellingPrice = parseFloat($(columns[2]).text().replace(/,/g, "") || "0");
        const buyingPrice = parseFloat($(columns[3]).text().replace(/,/g, "") || "0");

        funds.push({
          company,
          fundName,
          sellingPrice,
          buyingPrice
        });
      }
    });

    return funds;

  } catch (error) {
    console.error("Error scraping UTASL:", error);
    return [];
  }
};

// --- HOW TO TEST IT ---
const runTest = async () => {
  console.log("Fetching data from UTASL...");
  const allFunds = await fetchAllFunds();
  
  if (allFunds.length > 0) {
    console.log(`✅ Successfully found ${allFunds.length} funds!`);
    
    // Print the first 5 to verify the data structure
    console.log("Here are the first 5 funds:");
    console.log(allFunds.slice(0, 5));
    
    // Bonus: Check if CAL funds are specifically in there
    const calFunds = allFunds.filter(f => f.company.toLowerCase().includes("capital alliance"));
    console.log(`\nFound ${calFunds.length} CAL funds.`);
  } else {
    console.log("❌ No funds found. The table structure might have changed.");
  }
};

// runTest();

// Define the shape of CAL's direct API response
interface CalFundData {
  fund_code: string;       // e.g., "FIOF", "HYF", "IGF"
  fund_name: string;       // e.g., "Fixed Income Opportunities Fund"
  sell_price: number;      // Current NAV (Selling Price)
  buy_price: number;       // Current NAV (Buying Price)
  annualized_yield: number;// The current interest rate % they advertise
  date: string;            // The date of the price
}

const fetchCalSpecificFunds = async (): Promise<CalFundData[]> => {
  // CAL's internal endpoint for their calculator and portal rates
  const url = "https://cal.lk/wp-json/cal-api/v1/unit-trust-rates";

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the data is valid
    if (!data || !Array.isArray(data)) {
      console.error("CAL API returned unexpected format:", data);
      return [];
    }

    const processedFunds: CalFundData[] = data.map((fund: any) => ({
      fund_code: fund.fundCode || "N/A", // 'FIOF', 'HYF', etc.
      fund_name: fund.fundName,
      sell_price: parseFloat(fund.sellPrice || "0"),
      buy_price: parseFloat(fund.buyPrice || "0"),
      annualized_yield: parseFloat(fund.annualizedYield || "0"),
      date: fund.date || new Date().toISOString().split('T')[0]
    }));

    return processedFunds;

  } catch (error) {
    console.error("Error fetching directly from CAL:", error);
    return [];
  }
};

// --- HOW TO TEST IT ---
const runCalTest = async () => {
  console.log("Fetching live rates from CAL APIs...");
  const calFunds = await fetchCalSpecificFunds();
  
  if (calFunds.length > 0) {
    console.log(`✅ Successfully pulled ${calFunds.length} CAL funds!\n`);
    
    // Find specific funds by their shortcodes!
    const fiof = calFunds.find(f => f.fund_code === 'FIOF' || f.fund_name.includes("Fixed Income Opportunities"));
    const hyf = calFunds.find(f => f.fund_code === 'HYF' || f.fund_name.includes("High Yield"));
    
    if (fiof) {
      console.log(`📌 ${fiof.fund_code} - ${fiof.fund_name}`);
      console.log(`   Price: LKR ${fiof.sell_price.toFixed(4)}`);
      console.log(`   Yield: ${fiof.annualized_yield.toFixed(2)}%\n`);
    }

    if (hyf) {
      console.log(`📌 ${hyf.fund_code} - ${hyf.fund_name}`);
      console.log(`   Price: LKR ${hyf.sell_price.toFixed(4)}`);
      console.log(`   Yield: ${hyf.annualized_yield.toFixed(2)}%\n`);
    }

  } else {
    console.log("❌ Failed to fetch from CAL.");
  }
};

// runCalTest();

const runTestt = async () => {
  console.log("Fetching data from UTASL...");
  const allFunds = await fetchAllFunds();
  
  if (allFunds.length > 0) {
    // 1. Filter out everything except Capital Alliance
    const calFunds = allFunds.filter(f => 
      f.company.toLowerCase().includes("capital alliance") || 
      f.company.toLowerCase().includes("cal")
    );

    // 2. Define the exact fund keywords to search for, including an 'exclude' property
    const targetCategories = [
      { 
        key: "fixed income opportunities", 
        label: "Fixed Income (FIOF)", 
        exclude: null 
      },
      { 
        key: "money market", 
        label: "Money Market", 
        exclude: "islamic" // This prevents the Islamic fund from overlapping here
      },
      { 
        key: "investment grade", 
        label: "Investment Grade (IGF)", 
        exclude: null 
      },
      { 
        key: "quantitative equity", 
        label: "Quantitative Equity", 
        exclude: null 
      },
      { 
        key: "high yield", 
        label: "High Yield (HYF)", 
        exclude: null 
      },
      { 
        key: "islamic money market", 
        label: "Islamic Money Market", 
        exclude: null 
      }
    ];

    console.log("\n--- CAL MAIN FUNDS STATUS ---");
    
    targetCategories.forEach(target => {
      // Find the specific fund using a whitespace-insensitive match
      const found = calFunds.find(f => {
        // Normalize the string: lowercase it and replace any multiple spaces with a single space
        const normalizedName = f.fundName.toLowerCase().replace(/\s+/g, ' ').trim();
        
        const hasKey = normalizedName.includes(target.key);
        const hasExclude = target.exclude ? normalizedName.includes(target.exclude) : false;
        
        return hasKey && !hasExclude;
      });

      if (found) {
        console.log(`✅ ${target.label}`);
        console.log(`   Name: ${found.fundName}`);
        console.log(`   Sell (NAV): LKR ${found.sellingPrice.toFixed(4)}\n`);
        
      } else {
        console.log(`❌ ${target.label}`);
        console.log(`   Status: Not found in today's UTASL feed.\n`);
      }
    });

  } else {
    console.log("❌ No funds found from UTASL.");
  }
};

// Execute the test
// runTestt();



