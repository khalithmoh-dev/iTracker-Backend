import axios from 'axios';
import { types } from 'util';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';

interface PriceData {
  price: number;
  currency: string;
  pricePerGramUSD?: number;
  usdToInr?: number;
}

// Get USD to INR conversion rate
const getUSDToINR = async (): Promise<number> => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 5000 });
    if (response.data?.rates?.INR) {
      return response.data.rates.INR;
    }
  } catch (error) {
    console.warn('Error fetching exchange rate, using fallback:', error);
  }
  return 83;
};

// Get crypto price from CoinGecko in INR
export const getCryptoPrice = async (symbol: string): Promise<PriceData | null> => {
  try {
    const symbolMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'SOL': 'solana',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'LTC': 'litecoin',
      'CRO': 'cronos'
    };

    const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
    
    let response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'inr',
      },
    });

    if (response.data[coinId]?.inr) {
      return {
        price: response.data[coinId].inr,
        currency: 'INR',
      };
    }

    response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
      },
    });

    if (response.data[coinId]?.usd) {
      const usdToInr = await getUSDToINR();
      return {
        price: response.data[coinId].usd * usdToInr,
        currency: 'INR',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return null;
  }
};

// Get stock price in INR using Alpha Vantage API

export const getStockPrice = async (symbol: string): Promise<PriceData | null> => {
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
  const googleSheetCsvUrl = process.env.GOOGLE_SHEET_CSV_URL;

  // Normalize symbol: WIPRO → WIPRO, TCS → TCS
  const ticker = symbol.toUpperCase();

  // Finnhub & AlphaVantage require NSE format WIPRO.NS
  const nseSymbol = ticker.endsWith(".NS") ? ticker : `${ticker}.NS`;


  // ---------------------------------------------
  // 1️⃣ GOOGLE SHEETS (GOOGLEFINANCE) - Primary
  // ---------------------------------------------
 if (googleSheetCsvUrl) {
  try {
    const csvResponse = await axios.get(googleSheetCsvUrl);
    const csv = csvResponse.data;

    const rows = csv
      .trim()
      .split("\n")
      .map((line: string) => line.split(","));
    // Each row will have Stock Symbol,NSE Stock ticker and current price
    const targetSymbol = symbol.toUpperCase();

    // Find the row matching the stock symbol
    const targetRow = rows.find((r: string[]) => r[0]?.trim().toUpperCase() === targetSymbol);

    if (targetRow && targetRow[2]) {
      const price = parseFloat(targetRow[2].replace(/[^0-9.]/g, ""));

      if (!isNaN(price) && price > 0) {
        return {
          price,
          currency: "INR",
        };
      }
    }

  } catch (err: any) {
    console.warn("Google Sheets failed, trying Finnhub:", err.message);
  }
}



  // ---------------------------------------------
  // 2️⃣ FINNHUB - Secondary
  // ---------------------------------------------
  if (finnhubKey) {
    try {
      const finnhubUrl = `https://finnhub.io/api/v1/quote`;

      const response = await axios.get(finnhubUrl, {
        params: {
          symbol: nseSymbol,
          token: finnhubKey,
        },
        timeout: 8000,
      });

      const data = response.data;

      if (data?.c && data.c > 0) {
        return {
          price: data.c, // Finnhub returns INR for NSE
          currency: "INR",
        };
      }
    } catch (err: any) {
      console.warn("Finnhub failed, falling back to Alpha Vantage:", err.message);
    }
  }


  // ---------------------------------------------
  // 3️⃣ ALPHA VANTAGE - Final fallback
  // ---------------------------------------------
  if (!alphaVantageKey) {
    console.warn("Alpha Vantage key missing — cannot fallback");
    return null;
  }

  try {
    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: nseSymbol,
        apikey: alphaVantageKey,
      },
      timeout: 8000,
    });

    const quote = response?.data?.["Global Quote"];

    if (!quote || !quote["05. price"]) {
      console.warn("Alpha Vantage: price not found");
      return null;
    }

    const priceUSD = parseFloat(quote["05. price"]);
    if (!priceUSD || priceUSD <= 0) return null;

    // Convert USD → INR
    const usdToInr = await getUSDToINR();
    const priceINR = priceUSD * usdToInr;

    return {
      price: priceINR,
      currency: "INR",
    };

  } catch (err: any) {
    console.error("Alpha Vantage fallback failed:", err.message);
    return null;
  }
};



type PriceDatas = {
  data: {
    rates: any
  };
};

// Get gold price per gram in INR
export const getGoldPrice = async (): Promise<PriceData | null> => {
  try {
    try {
      // const response: PriceDatas = await axios.get('https://api.metalpriceapi.com/v1/latest?api_key=7e750275f694ffd364418383ee939c88&base=INR&currencies=XAU', { timeout: 5000 });
      
      const response: PriceDatas = {data : {
        rates: { INRXAU: 367823.1615446534, XAU: 0.0000027187 }
      }}
      if (response.data && response.data?.rates) {
        const pricePerOunceUSD = response.data?.rates?.INRXAU;
        const pricePerGram = pricePerOunceUSD / 31.1035;
        return {
          price: pricePerGram,
          currency: 'INR',
        };
      }
    } catch (e) {
      console.log('from fallback', e);
      // Continue to next option
    }

    // try {
    //   const response = await axios.get(`${COINGECKO_API}/simple/price`, {
    //     params: {
    //       ids: 'pax-gold',
    //       vs_currencies: 'inr',
    //     },
    //     timeout: 5000,
    //   });
    //   if (response.data?.['pax-gold']?.inr) {
    //     const pricePerGram = response.data['pax-gold'].inr / 31.1035;
    //     return {
    //       price: pricePerGram,
    //       currency: 'INR',
    //     };
    //   }
      
    //   const usdResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
    //     params: {
    //       ids: 'pax-gold',
    //       vs_currencies: 'usd',
    //     },
    //     timeout: 5000,
    //   });
    //   if (usdResponse.data?.['pax-gold']?.usd) {
    //     const pricePerOunceUSD = usdResponse.data['pax-gold'].usd;
    //     const pricePerGramUSD = pricePerOunceUSD / 31.1035;
    //     const usdToInr = await getUSDToINR();
    //     return {
    //       price: pricePerGramUSD * usdToInr,
    //       currency: 'INR',
    //     };
    //   }
    // } catch (e) {
    //   console.log('from fallback', e);
    //   // Continue to fallback
    // }

    console.warn('Using fallback gold price.');
    return {
      price: 5300,
      currency: 'INR',
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return {
      price: 5300,
      currency: 'INR',
    };
  }
};

