-- UZEX Insight AI schema (synthetic dataset)
CREATE TABLE IF NOT EXISTS brokers (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  inn TEXT,
  region TEXT
);

CREATE TABLE IF NOT EXISTS participants (
  inn TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  activity TEXT,
  role TEXT,
  vat_payer TEXT
);

CREATE TABLE IF NOT EXISTS usd_rates (
  rate_date DATE PRIMARY KEY,
  rate NUMERIC(12, 4) NOT NULL
);

CREATE TABLE IF NOT EXISTS contracts (
  contract_no TEXT PRIMARY KEY,
  product_name TEXT,
  brand TEXT,
  size TEXT,
  grade TEXT,
  product_type TEXT,
  product_class TEXT,
  tnved TEXT,
  product_group TEXT,
  category TEXT,
  industry TEXT,
  unit TEXT,
  lot NUMERIC,
  currency TEXT,
  base_price NUMERIC,
  deposit_pct TEXT,
  delivery_basis TEXT,
  region TEXT,
  warehouse_address TEXT,
  trade_type TEXT,
  contract_type TEXT,
  contract_form TEXT,
  payment_days INT,
  delivery_days INT,
  packaging TEXT,
  seller_inn TEXT,
  registered_at DATE,
  valid_until DATE
);

CREATE TABLE IF NOT EXISTS deals (
  deal_no TEXT PRIMARY KEY,
  deal_date DATE,
  deal_time TIME,
  trade_type TEXT,
  quantity NUMERIC,
  amount NUMERIC,
  start_price NUMERIC,
  contract_no TEXT REFERENCES contracts(contract_no),
  product_name TEXT,
  lot NUMERIC,
  unit TEXT,
  region TEXT,
  contract_type TEXT,
  contract_form TEXT,
  status TEXT,
  seller_inn TEXT,
  buyer_inn TEXT,
  seller_broker TEXT,
  buyer_broker TEXT,
  payment_date DATE,
  delivery_date DATE,
  delivered NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_deals_date ON deals(deal_date);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_product ON deals(product_name);
CREATE INDEX IF NOT EXISTS idx_deals_region ON deals(region);
CREATE INDEX IF NOT EXISTS idx_deals_contract ON deals(contract_no);
CREATE INDEX IF NOT EXISTS idx_contracts_category ON contracts(category);
