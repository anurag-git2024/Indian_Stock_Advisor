
import { GoogleGenAI } from "@google/genai";
import { StockAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchStockAnalysis = async (stockSymbol: string, timeframe: string): Promise<StockAnalysis> => {

    const analysisPromptPart = timeframe === 'All'
        ? `2. A comprehensive analysis with buy/sell/hold recommendations for 'Intraday', '1 Week', and '1 Month' timeframes. Each recommendation must include a price target and a data-driven rationale.`
        : `2. A comprehensive analysis with a buy/sell/hold recommendation for the '${timeframe}' timeframe. The recommendation must include a price target and a data-driven rationale.`;

    const prompt = `
        You are an expert financial analyst AI specializing in the Indian stock market.
        Your task is to provide a detailed analysis for the stock with the symbol: "${stockSymbol}".
        Using real-time data from Google Search, you must provide:
        1. The latest available stock price, formatted as a string (e.g., "₹XX,XXX.XX").
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
              "timeframe": "${timeframe === 'All' ? 'Intraday' : timeframe}",
              "recommendation": "Buy" | "Sell" | "Hold",
              "price_target": "₹XX,XXX.XX",
              "rationale": "Concise rationale..."
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