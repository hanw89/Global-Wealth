
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log('Market Proxy v6 - Raw Request:', rawBody);
    
    if (!rawBody) {
      throw new Error('Empty request body');
    }

    const { tickers, provider = 'yahoo', apiKey } = JSON.parse(rawBody);
    
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: 'Tickers array required' }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // --- Provider 1: Polygon.io ---
    if (provider === 'polygon') {
      const polyKey = apiKey || Deno.env.get('POLYGON_API_KEY');
      if (!polyKey) {
        return new Response(JSON.stringify({ error: 'Polygon API Key required' }), { status: 400, headers: corsHeaders });
      }

      console.log(`Using Polygon.io for ${tickers.length} symbols`);
      const results: any = {};
      
      for (const ticker of tickers) {
        try {
          const polyRes = await fetch(`https://api.polygon.io/v2/last/trade/${ticker}?apiKey=${polyKey}`);
          if (polyRes.ok) {
            const data = await polyRes.json();
            results[ticker] = {
              price: data.results?.p || data.last?.price || 0,
              change: 0
            };
          }
        } catch (err) {
          console.error(`Polygon fetch failed for ${ticker}:`, err);
        }
      }
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // --- Provider 2: Yahoo Finance (Enhanced v6) ---
    // Try multiple Yahoo endpoints to bypass potential blocks
    const results: any = {};
    const remainingTickers = [...tickers];

    // Attempt 1: v7/finance/spark (Reliable batching)
    try {
      const sparkUrl = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${remainingTickers.join(',')}&range=1d&interval=5m`;
      console.log('Fetching from Yahoo Spark (v6):', sparkUrl);
      
      const sparkRes = await fetch(sparkUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (sparkRes.ok) {
        const sparkData = await sparkRes.json();
        if (sparkData.spark?.result) {
          sparkData.spark.result.forEach((res: any) => {
            const symbol = res.symbol;
            const quote = res.response[0]?.meta;
            const indicators = res.response[0]?.indicators?.quote[0];
            const lastPrice = indicators?.close?.[indicators.close.length - 1] || quote?.regularMarketPrice;
            const prevClose = quote?.chartPreviousClose;
            const change = prevClose ? ((lastPrice - prevClose) / prevClose) * 100 : 0;
            
            if (lastPrice) {
              results[symbol] = { price: lastPrice, change };
              const idx = remainingTickers.indexOf(symbol);
              if (idx > -1) remainingTickers.splice(idx, 1);
            }
          });
        }
      } else {
        console.warn('Yahoo Spark failed:', sparkRes.status);
      }
    } catch (err) {
      console.error('Yahoo Spark Exception:', err);
    }

    // Attempt 2: v8/finance/chart (Per-symbol fallback)
    if (remainingTickers.length > 0) {
      console.log(`Falling back to Yahoo Chart for ${remainingTickers.length} symbols`);
      for (const ticker of [...remainingTickers]) {
        try {
          const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
          const chartRes = await fetch(chartUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          
          if (chartRes.ok) {
            const chartData = await chartRes.json();
            const meta = chartData.chart?.result?.[0]?.meta;
            if (meta?.regularMarketPrice) {
              results[ticker] = {
                price: meta.regularMarketPrice,
                change: meta.regularMarketChangePercent || 0
              };
              const idx = remainingTickers.indexOf(ticker);
              if (idx > -1) remainingTickers.splice(idx, 1);
            }
          }
        } catch (err) {
          console.error(`Yahoo Chart fallback failed for ${ticker}:`, err);
        }
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Market Proxy v6 Exception:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: corsHeaders 
    });
  }
});
