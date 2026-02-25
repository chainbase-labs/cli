export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  next_page?: number;
  count?: number;
}

// Token types
export interface TokenMetadata {
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  logos: string[];
  urls: string[];
  current_usd_price: number;
}

export interface TokenTransfer {
  block_number: number;
  block_timestamp: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value: string;
}

export interface TokenPrice {
  price: number;
  symbol: string;
  decimals: number;
  updated_at: string;
}

export interface TokenHolder {
  wallet_address: string;
  original_amount: string;
  amount: string;
  usd_value: string;
}

// NFT types
export interface NftMetadata {
  contract_address: string;
  token_id: string;
  name: string;
  description: string;
  image_uri: string;
  traits: unknown[];
}

export interface NftCollection {
  contract_address: string;
  name: string;
  symbol: string;
  description: string;
  banner_image_url: string;
  image_url: string;
  total: number;
  floor_price: number;
}

export interface NftOwner {
  wallet_address: string;
  token_id: string;
}

export interface NftFloorPrice {
  floor_price: number;
  symbol: string;
}

export interface NftTrending {
  contract_address: string;
  name: string;
  volume: number;
  sales: number;
  floor_price: number;
}

// Balance types
export interface NativeBalance {
  balance: string;
}

export interface TokenBalance {
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  current_usd_price: number;
}

export interface Portfolio {
  protocol: string;
  chain: string;
  positions: unknown[];
}

// Domain types
export interface EnsDomain {
  name: string;
  address: string;
  registrant: string;
  owner: string;
  resolver: string;
}

export interface EnsRecord {
  name: string;
  address: string;
  text_records: Record<string, string>;
}

// Block/Tx types
export interface BlockDetail {
  number: number;
  hash: string;
  timestamp: number;
  transactions_count: number;
  miner: string;
  gas_used: number;
  gas_limit: number;
}

export interface TxDetail {
  hash: string;
  block_number: number;
  from_address: string;
  to_address: string;
  value: string;
  gas: number;
  gas_price: string;
  status: number;
}

export interface AddressLabel {
  address: string;
  labels: string[];
}

// SQL types
export interface SqlQueryResult {
  task_id: string;
  rows: unknown[];
  total_count: number;
}

export interface SqlExecutionStatus {
  executionId: string;
  status: string;
  progress: number;
  submittedAt: string;
  expiresAt: string;
}
