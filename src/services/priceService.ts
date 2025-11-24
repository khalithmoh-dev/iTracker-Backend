import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';

interface PriceData {
  price: number;
  currency: string;
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
  const symbolUpper = symbol.toUpperCase();
  const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!alphaVantageKey) {
    console.warn('Alpha Vantage API key not configured.');
    return null;
  }

  try {
    let formattedSymbol = symbolUpper;
    if (!symbolUpper.includes(':') && !symbolUpper.includes('.')) {
      formattedSymbol = `NSE:${symbolUpper}`;
    }

    try {
      const response = await axios.get(ALPHA_VANTAGE_API, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: formattedSymbol,
          apikey: alphaVantageKey,
        },
        timeout: 10000,
      });
      
      if (response.data?.['Global Quote']?.['05. price']) {
        const priceStr = response.data['Global Quote']['05. price'];
        const price = parseFloat(priceStr);
        
        if (price && price > 0) {
          const currency = response.data['Global Quote']['08. currency'] || 'INR';
          
          if (currency === 'INR') {
            return {
              price: price,
              currency: 'INR',
            };
          } else {
            const usdToInr = await getUSDToINR();
            return {
              price: price * usdToInr,
              currency: 'INR',
            };
          }
        }
      }
    } catch (e: any) {
      if (formattedSymbol.startsWith('NSE:') && e.response?.status !== 429) {
        try {
          const response = await axios.get(ALPHA_VANTAGE_API, {
            params: {
              function: 'GLOBAL_QUOTE',
              symbol: symbolUpper,
              apikey: alphaVantageKey,
            },
            timeout: 10000,
          });
          
          if (response.data?.['Global Quote']?.['05. price']) {
            const priceStr = response.data['Global Quote']['05. price'];
            const price = parseFloat(priceStr);
            
            if (price && price > 0) {
              const currency = response.data['Global Quote']['08. currency'] || 'INR';
              
              if (currency === 'INR') {
                return {
                  price: price,
                  currency: 'INR',
                };
              } else {
                const usdToInr = await getUSDToINR();
                return {
                  price: price * usdToInr,
                  currency: 'INR',
                };
              }
            }
          }
        } catch (e2: any) {
          console.warn('Alpha Vantage API failed:', e2.message || 'Unknown error');
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
};

// Get gold price per gram in INR
export const getGoldPrice = async (): Promise<PriceData | null> => {
  try {
    try {
      const response = await axios.get('https://api.metals.live/v1/spot/gold', { timeout: 5000 });
      if (response.data && Array.isArray(response.data) && response.data[0]?.price) {
        const pricePerOunceUSD = response.data[0].price;
        const pricePerGramUSD = pricePerOunceUSD / 31.1035;
        const usdToInr = await getUSDToINR();
        return {
          price: pricePerGramUSD * usdToInr,
          currency: 'INR',
        };
      }
    } catch (e) {
      // Continue to next option
    }

    try {
      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: 'pax-gold',
          vs_currencies: 'inr',
        },
        timeout: 5000,
      });
      if (response.data?.['pax-gold']?.inr) {
        const pricePerGram = response.data['pax-gold'].inr / 31.1035;
        return {
          price: pricePerGram,
          currency: 'INR',
        };
      }
      
      const usdResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: 'pax-gold',
          vs_currencies: 'usd',
        },
        timeout: 5000,
      });
      if (usdResponse.data?.['pax-gold']?.usd) {
        const pricePerOunceUSD = usdResponse.data['pax-gold'].usd;
        const pricePerGramUSD = pricePerOunceUSD / 31.1035;
        const usdToInr = await getUSDToINR();
        return {
          price: pricePerGramUSD * usdToInr,
          currency: 'INR',
        };
      }
    } catch (e) {
      // Continue to fallback
    }

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

