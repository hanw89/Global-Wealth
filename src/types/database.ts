export type AssetType = 'Stock' | 'Crypto';

export interface Asset {
  id: string;
  user_id: string;
  asset_type: AssetType;
  ticker_symbol: string;
  quantity: number;
  average_buy_price: number;
  brokerage_name: string;
  created_at: string;
  updated_at: string;
}

export interface LivePriceMap {
  [ticker: string]: number;
}
