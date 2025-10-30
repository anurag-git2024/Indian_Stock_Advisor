
import { GoogleGenAI } from "@google/genai";
import { StockAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchStockAnalysis = async (stockSymbol: string, timeframes: string[]): Promise<StockAnalysis> => {

    const requestedTimeframes = (timeframes.length === 1 && timeframes[0] === 'All')
        ? ['Intraday', '1 Week', '1 Month', '6 Months', '1 Year', '2 Years']
        : timeframes;

    // FIX: Replaced Intl.ListFormat with a manual implementation to fix "Property 'ListFormat' does not exist on type 'typeof Intl'" error.
    const quotedTimeframes = requestedTimeframes.map(t => `'${t}'`);
    let formattedTimeframeList: string;
    if (quotedTimeframes.length === 1) {
        formattedTimeframeList = quotedTimeframes[0];
    } else if (quotedTimeframes.length === 2) {
        formattedTimeframeList = quotedTimeframes.join(' and ');
    } else {
        formattedTimeframeList = `${quotedTimeframes.slice(0, -1).join(', ')}, and ${quotedTimeframes[quotedTimeframes.length - 1]}`;
    }


    const analysisPromptPart = `2. A comprehensive analysis with buy/sell/hold recommendations for the following timeframe(s): ${formattedTimeframeList}. For each timeframe, provide a recommendation, a price target, and a data-driven rationale.`;

    const prompt = `
        You are an expert financial analyst AI specializing in the Indian stock market. Your analysis must be grounded in real-time data from official sources like the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).
        Your task is to provide a detailed analysis for the stock with the symbol: "${stockSymbol}".
        Using real-time data from Google Search to access official NSE/BSE feeds and other reputable financial news sources, you must provide:
        1. The latest available stock price, formatted as a string (e.g., "₹XX,XXX.XX"). Ensure this reflects the most recent trading data from NSE or BSE.
        ${analysisPromptPart}
        3. A list of the top 3-5 most recent and relevant news articles. Each article must include a title, source, URL, and a brief summary.
        4. Historical closing price data for the last 30 trading days. This should be an array of objects, each containing a 'date' (formatted as "YYYY-MM-DD") and a 'price' (as a number, not a string).

        Your entire response MUST be a single, raw, valid JSON object. Do not use markdown, do not wrap it in \`\`\`json ... \`\`\`, and do not include any explanatory text before or after the JSON.

        The JSON object must have the following structure:
        {
          "stock_name": "Full Name of the Stock",
          "current_price": "₹XX,XXX.XX",
          "analysis": [
            {
              "timeframe": "${requestedTimeframes[0]}",
              "recommendation": "Buy" | "Sell" | "Hold",
              "price_target": "₹XX,XXX.XX",
              "rationale": "Concise rationale based on NSE/BSE data, technical indicators, and market sentiment..."
            }
            // ... include one object in this array for EACH of the requested timeframes
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
        
        let jsonText = response.text.trim();
        // Clean potential markdown wrappers that the model might still add
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7);
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length - 3);
            }
        }
        
        const parsedData = JSON.parse(jsonText) as StockAnalysis;
        
        if (!parsedData.stock_name || !parsedData.current_price || !Array.isArray(parsedData.analysis) || !Array.isArray(parsedData.top_news) || !Array.isArray(parsedData.historical_data)) {
            throw new Error("Invalid data structure received from API.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error fetching or parsing stock analysis:", error);
        throw new Error("Failed to get analysis from Gemini API. The model may have returned an invalid format or the stock symbol is incorrect.");
    }
};