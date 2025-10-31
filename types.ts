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
    symbol?: string;
    stock_name: string;
    current_price: string;
    fifty_two_week_high: string;
    fifty_two_week_low: string;
    analysis: TimeframeAnalysis[];
    top_news: NewsArticle[];
    historical_data: HistoricalDataPoint[];
}

export interface TodaysPick {
  symbol: string;
  stock_name: string;
  rationale: string;
}

export interface TopPicks {
  buy: TodaysPick;
  sell: TodaysPick;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  status: 'active' | 'triggered';
}