export enum RecommendationType {
    BUY = 'Buy',
    SELL = 'Sell',
    HOLD = 'Hold',
}

export interface TimeframeAnalysis {
    timeframe: string;
    recommendation: RecommendationType;
    price_target: string;
    rationale: string;
}

export interface NewsArticle {
    title: string;
    source: string;
    url: string;
    summary: string;
}

export interface HistoricalDataPoint {
    date: string; // "YYYY-MM-DD"
    price: number;
}

export interface StockAnalysis {
    stock_name: string;
    current_price: string;
    analysis: TimeframeAnalysis[];
    top_news: NewsArticle[];
    historical_data: HistoricalDataPoint[];
}