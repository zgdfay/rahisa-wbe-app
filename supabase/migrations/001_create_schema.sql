-- 001_create_schema.sql
-- Supabase/Postgres schema for Rahisa Bakery forecasting app

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: produk
CREATE TABLE IF NOT EXISTS produk (
  id_produk uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_produk text NOT NULL,
  kategori text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: penjualan
CREATE TABLE IF NOT EXISTS penjualan (
  id_penjualan uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL,
  id_produk uuid REFERENCES produk(id_produk) ON DELETE SET NULL,
  stok_awal integer,
  barang_masuk integer,
  jumlah_terjual integer NOT NULL DEFAULT 0,
  stok_akhir integer,
  harga_jual numeric(12,2),
  total_penjualan numeric(12,2),
  diskon numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table: forecasting
CREATE TABLE IF NOT EXISTS forecasting (
  id_forecast uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_produk uuid REFERENCES produk(id_produk) ON DELETE CASCADE,
  alpha numeric(4,2) NOT NULL,
  beta numeric(4,2) NOT NULL,
  hasil_forecast numeric(12,2) NOT NULL,
  mape numeric(6,4) NOT NULL,
  tanggal_forecast date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_penjualan_produk_tanggal ON penjualan (id_produk, tanggal);
CREATE INDEX IF NOT EXISTS idx_forecasting_produk_tanggal ON forecasting (id_produk, tanggal_forecast);

-- Optional: ensure commonly queried constraints
ALTER TABLE penjualan
  ADD CONSTRAINT chk_jumlah_nonneg CHECK (jumlah_terjual >= 0);

ALTER TABLE penjualan
  ADD CONSTRAINT chk_stock_nonneg CHECK (
    (stok_awal IS NULL OR stok_awal >= 0) AND
    (barang_masuk IS NULL OR barang_masuk >= 0) AND
    (stok_akhir IS NULL OR stok_akhir >= 0)
  );

-- End of migration
