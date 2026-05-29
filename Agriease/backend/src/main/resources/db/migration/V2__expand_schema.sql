-- AgriEase Delivery Agent System schema extension

CREATE TABLE IF NOT EXISTS delivery_agents (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    vehicle_type VARCHAR(80),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    rating NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_tracking (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(40) NOT NULL,
    location TEXT,
    photo_proof_url TEXT,
    tracking_time TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS delivery_agent_id BIGINT REFERENCES delivery_agents(id),
    ADD COLUMN IF NOT EXISTS delivery_address TEXT,
    ADD COLUMN IF NOT EXISTS order_date TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent_id ON orders(delivery_agent_id);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_available ON delivery_agents(is_available);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_time ON delivery_tracking(order_id, tracking_time);


-- Smart Agriculture feature schema changes

CREATE TABLE IF NOT EXISTS crop_recommendation_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    location VARCHAR(255) NOT NULL,
    temperature_celsius DOUBLE PRECISION NOT NULL,
    humidity_percentage DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    weather_source VARCHAR(32) NOT NULL,
    recommendations_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_recommendation_user_time
    ON crop_recommendation_records (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS land_measurement_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    points_json TEXT NOT NULL,
    point_count INTEGER NOT NULL,
    area_square_meters DOUBLE PRECISION NOT NULL,
    area_acres DOUBLE PRECISION NOT NULL,
    location_label VARCHAR(120),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_land_measurement_user_time
    ON land_measurement_records (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS weekly_schedule_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    crop_name VARCHAR(80) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL,
    total_weeks INTEGER NOT NULL,
    land_area_acres DOUBLE PRECISION NOT NULL,
    schedule_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_schedule_user_time
    ON weekly_schedule_records (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS market_price_records (
    id BIGSERIAL PRIMARY KEY,
    crop_name VARCHAR(80) NOT NULL,
    market_name VARCHAR(120) NOT NULL,
    district VARCHAR(80),
    state VARCHAR(80),
    unit VARCHAR(40),
    min_price NUMERIC(10,2) NOT NULL,
    max_price NUMERIC(10,2) NOT NULL,
    modal_price NUMERIC(10,2) NOT NULL,
    source VARCHAR(30) NOT NULL,
    fetched_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_price_crop_time
    ON market_price_records (crop_name, fetched_at DESC);