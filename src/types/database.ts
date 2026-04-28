export type AssetType = 'stock' | 'crypto' | 'korean_rental';
export type Currency = 'USD' | 'KRW';

export interface StockMetadata {
  ticker: string;
  shares: number;
  avg_cost: number;
}

export interface CryptoMetadata {
  symbol: string;
  amount: number;
  venue: string;
}

export interface KoreanRentalMetadata {
  monthly_rent: number;
  deposit: number;
  management_fee: number;
  rental_type: 'jeonse' | 'wolse';
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: AssetType;
  currency: Currency;
  metadata: StockMetadata | CryptoMetadata | KoreanRentalMetadata;
  created_at: string;
}

export interface CurrencyRate {
  pair: string;
  rate: number;
  updated_at: string;
}
