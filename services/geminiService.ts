import { GoogleGenAI } from "@google/genai";
import { StockAnalysis, TopPicks, MarketFeedData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchMarketFeed = async (): Promise<MarketFeedData> => {
    const prompt = `
        You are an expert financial analyst AI. Your task is to provide a real-time global market feed that is highly relevant to the Indian stock market.
        Using Google Search, find the top 5-7 most impactful and recent international news events, economic data releases, and market triggers.

        For each item, you must provide:
        1.  A concise title.
        2.  A brief summary (1-2 sentences) explaining its potential impact on the Indian market.
        3.  The source or category (e.g., "US Fed Policy", "Crude Oil Prices", "China Manufacturing PMI", "Global Tech Sector", "Forex USD/INR").
        4.  A sentiment analysis ('Positive', 'Negative', or 'Neutral') from the perspective of the Indian market.
        5.  A timestamp for the event or news, formatted as "YYYY-MM-DD HH:MM UTC".

        Your entire response MUST be a single, raw, valid JSON object. Do not use markdown, do not wrap it in \`\`\`json ... \`\`\`, and do not include any explanatory text before or after the JSON.

        The JSON object must have the following structure:
        {
          "feed": [
            {
              "title": "US Federal Reserve Holds Interest Rates Steady",
              "summary": "The US Fed's decision to maintain current interest rates provides temporary relief for emerging markets like India by reducing the risk of immediate capital outflows.",
              "source": "US Fed Policy",
              "sentiment": "Positive",
              "timestamp": "YYYY-MM-DD HH:MM UTC"
            }
          ]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const rawText = response.text.trim();
        
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.error("Invalid response format for market feed:", rawText);
            throw new Error("Could not find a valid JSON object in the model's response for market feed.");
        }
        
        const jsonText = rawText.substring(startIndex, endIndex + 1);
        
        const parsedData = JSON.parse(jsonText) as MarketFeedData;

        if (!parsedData.feed || !Array.isArray(parsedData.feed)) {
            throw new Error("Invalid data structure for market feed received from API.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error fetching or parsing market feed:", error);
        throw new Error("Failed to get market feed from Gemini API.");
    }
};

export const fetchStockAnalysis = async (stockSymbol: string, timeframes: string[]): Promise<StockAnalysis> => {
    let marketContext = "No specific global market feed data available at the moment. Proceed with standard real-time analysis.";
    try {
        const marketFeedData = await fetchMarketFeed();
        const top3FeedItems = marketFeedData.feed.slice(0, 3);
        if (top3FeedItems.length > 0) {
            marketContext = top3FeedItems.map(item => `- ${item.title} (${item.sentiment}): ${item.summary}`).join('\n');
        }
    } catch (e) {
        console.warn("Could not fetch market feed for context, proceeding without it.", e);
    }

    const requestedTimeframes = (timeframes.length === 1 && timeframes[0] === 'All')
        ? ['Intraday', '1 Week', '1 Month', '6 Months', '1 Year', '2 Years']
        : timeframes;

    const quotedTimeframes = requestedTimeframes.map(t => `'${t}'`);
    let formattedTimeframeList: string;
    if (quotedTimeframes.length === 1) {
        formattedTimeframeList = quotedTimeframes[0];
    } else if (quotedTimeframes.length === 2) {
        formattedTimeframeList = quotedTimeframes.join(' and ');
    } else {
        formattedTimeframeList = `${quotedTimeframes.slice(0, -1).join(', ')}, and ${quotedTimeframes[quotedTimeframes.length - 1]}`;
    }

    const analysisPromptPart = `3. A comprehensive analysis with buy/sell/hold recommendations for the following timeframe(s): ${formattedTimeframeList}. For each timeframe, you MUST provide:
   a. A clear recommendation ('Buy', 'Sell', or 'Hold').
   b. A specific price target.
   c. A data-driven rationale. **This rationale is critical and MUST explicitly state how the 'Current Global Market Context' (particularly the sentiment and summary of the top 3 most relevant feed items) directly influences your recommendation for this stock.** For instance, if US interest rates are held steady (Positive sentiment), explain how this benefits an IT stock like TCS.`;

    const prompt = `
        You are an expert financial analyst AI specializing in the Indian stock market.

        **Current Global Market Context:**
        ${marketContext}
        ---
        
        Based on the market context above and your access to real-time data from official sources like the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), your task is to provide a detailed analysis for the stock with the symbol: "${stockSymbol}".
        
        Using real-time data from Google Search to access official NSE/BSE feeds and other reputable financial news sources, you must provide:
        1. The latest available stock price, formatted as a string (e.g., "₹XX,XXX.XX").
        2. The 52-week high and 52-week low prices, formatted as strings.
        ${analysisPromptPart}
        4. A list of the top 3-5 most recent and relevant news articles. Each article must include a title, source, URL, and a brief summary.
        5. Historical closing price data for the last 30 trading days. This should be an array of objects, each containing a 'date' (formatted as "YYYY-MM-DD") and a 'price' (as a number, not a string).

        Your entire response MUST be a single, raw, valid JSON object. Do not use markdown, do not wrap it in \`\`\`json ... \`\`\`, and do not include any explanatory text before or after the JSON.

        The JSON object must have the following structure:
        {
          "stock_name": "Full Name of the Stock",
          "current_price": "₹XX,XXX.XX",
          "fifty_two_week_high": "₹XX,XXX.XX",
          "fifty_two_week_low": "₹XX,XXX.XX",
          "analysis": [
            {
              "timeframe": "${requestedTimeframes[0]}",
              "recommendation": "Buy" | "Sell" | "Hold",
              "price_target": "₹XX,XXX.XX",
              "rationale": "Concise rationale based on NSE/BSE data, technical indicators, and market sentiment..."
            }
          ],
          "top_news": [
            {
              "title": "News article title",
              "source": "News source (e.g., Reuters)",
              "url": "https://example.com/news-article",
              "summary": "A brief summary of the news article."
            }
          ],
          "historical_data": [
            {
              "date": "YYYY-MM-DD",
              "price": 1234.56
            }
          ]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const rawText = response.text.trim();
        
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.error("Invalid response format received from API:", rawText);
            throw new Error("Could not find a valid JSON object in the model's response.");
        }
        
        const jsonText = rawText.substring(startIndex, endIndex + 1);
        
        const parsedData = JSON.parse(jsonText) as StockAnalysis;
        
        if (!parsedData.stock_name || !parsedData.current_price || !parsedData.fifty_two_week_high || !parsedData.fifty_two_week_low || !Array.isArray(parsedData.analysis) || !Array.isArray(parsedData.top_news) || !Array.isArray(parsedData.historical_data)) {
            throw new Error("Invalid data structure received from API.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error fetching or parsing stock analysis:", error);
        throw new Error("Failed to get analysis from Gemini API. The model may have returned an invalid format or the stock symbol is incorrect.");
    }
};

export const fetchTodaysPicks = async (stockSymbols: string[]): Promise<TopPicks> => {
    let marketContext = "No specific global market feed data available at the moment. Proceed with standard real-time analysis.";
    try {
        const marketFeedData = await fetchMarketFeed();
        const top3FeedItems = marketFeedData.feed.slice(0, 3);
        if (top3FeedItems.length > 0) {
          marketContext = top3FeedItems.map(item => `- ${item.title} (${item.sentiment}): ${item.summary}`).join('\n');
        }
    } catch (e) {
        console.warn("Could not fetch market feed for context, proceeding without it.", e);
    }

    const prompt = `
        You are an expert financial analyst AI specializing in the Indian stock market, with a focus on intraday trading.
        
        **Current Global Market Context:**
        ${marketContext}
        ---

        Given the market context above and the following list of Indian stock symbols: ${stockSymbols.join(', ')}.

        Your task is to identify the single best stock to **BUY** and the single best stock to **SELL** for today's trading session.

        To do this, you MUST perform a comprehensive, real-time analysis using Google Search to consult a variety of trusted feeds and data points, including:
        1.  **Official Exchange Data:** Access the latest data from NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) for pre-market indicators, volume, and price action.
        2.  **Major Financial News Outlets:** Scour top Indian financial news sources like The Economic Times, Moneycontrol, Business Standard, and Livemint for breaking news, corporate announcements, and sector-specific trends that could impact these stocks today.
        3.  **Technical Indicators:** Briefly analyze key short-term technical indicators such as RSI (Relative Strength Index), moving averages, and MACD (Moving Average Convergence Divergence) to gauge momentum.
        4.  **Market Sentiment:** Assess the overall market sentiment for the day, considering the global cues provided above and other domestic factors.

        Based on this multi-faceted analysis, select one "buy" and one "sell" candidate.

        Provide a concise, data-driven rationale (2-3 sentences) for each pick. Your rationale MUST explicitly reference how the 'Current Global Market Context' influences your decision, in addition to other factors like technical indicators or stock-specific news. For example: "Buy due to strong pre-market volume and positive sentiment from the US Fed holding rates, which boosts IT sector."

        Your entire response MUST be a single, raw, valid JSON object. Do not use markdown, do not wrap it in \`\`\`json ... \`\`\`, and do not include any explanatory text before or after the JSON.

        The JSON object must have the following structure:
        {
          "buy": {
            "symbol": "STOCKSYMBOL",
            "stock_name": "Full Stock Name",
            "rationale": "Brief, data-driven rationale for why this is a strong buy today, referencing specific data points."
          },
          "sell": {
            "symbol": "STOCKSYMBOL",
            "stock_name": "Full Stock Name",
            "rationale": "Brief, data-driven rationale for why this is a strong sell today, referencing specific data points."
          }
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const rawText = response.text.trim();

        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.error("Invalid response format for top picks:", rawText);
            throw new Error("Could not find a valid JSON object in the model's response for top picks.");
        }
        
        const jsonText = rawText.substring(startIndex, endIndex + 1);

        const parsedData = JSON.parse(jsonText) as TopPicks;

        if (!parsedData.buy || !parsedData.sell || !parsedData.buy.symbol || !parsedData.sell.symbol) {
            throw new Error("Invalid data structure for top picks received from API.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error fetching or parsing today's top picks:", error);
        throw new Error("Failed to get today's top picks from Gemini API.");
    }
};