-- PostgreSQL schema for AgriEase

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(100),
  email         VARCHAR(100) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL,
  phone         VARCHAR(20),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(20),
  farm_size     VARCHAR(50),
  crop_types    TEXT,
  business_name VARCHAR(200),
  business_type VARCHAR(100),
  rating        NUMERIC(3,2) DEFAULT 0,
  language_preference VARCHAR(8) DEFAULT 'en',
  voice_assist_enabled BOOLEAN DEFAULT FALSE,
  profile_photo TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id   BIGINT REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(30) NOT NULL,
  PRIMARY KEY (user_id, role_name)
);

CREATE TABLE IF NOT EXISTS equipment (
  id            BIGSERIAL PRIMARY KEY,
  supplier_id   BIGINT NOT NULL REFERENCES users(id),
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  daily_rate    NUMERIC(10,2) NOT NULL,
  available     BOOLEAN DEFAULT TRUE,
  image_url     TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id             BIGSERIAL PRIMARY KEY,
  equipment_id   BIGINT NOT NULL REFERENCES equipment(id),
  farmer_id      BIGINT NOT NULL REFERENCES users(id),
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  total_price    NUMERIC(10,2) NOT NULL,
  status         VARCHAR(20) DEFAULT 'PENDING',
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id              BIGSERIAL PRIMARY KEY,
  farmer_id       BIGINT NOT NULL REFERENCES users(id),
  supplier_id     BIGINT NOT NULL REFERENCES users(id),
  display_order_number INT,
  payment_method  VARCHAR(30),
  payment_status  VARCHAR(20) DEFAULT 'PENDING',
  total_amount    NUMERIC(10,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'PENDING',
  full_name       VARCHAR(150),
  phone           VARCHAR(20),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  pincode         VARCHAR(20),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id             BIGSERIAL PRIMARY KEY,
  order_id       BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_product_id BIGINT REFERENCES products(id),
  product_id     BIGINT,
  supplier_id    BIGINT REFERENCES users(id),
  product_type   VARCHAR(30),
  name           VARCHAR(150),
  quantity       INT NOT NULL,
  price          NUMERIC(10,2) NOT NULL,
  image_url      TEXT,
  start_date     VARCHAR(40),
  end_date       VARCHAR(40),
  days           INT,
  daily_rate     NUMERIC(10,2)
);
  status        VARCHAR(20) DEFAULT 'PLACED',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    BIGINT NOT NULL REFERENCES products(id),
  quantity      INT NOT NULL,
  price         NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS plant_disease_reports (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id),
  image_path     TEXT NOT NULL,
  disease        VARCHAR(100) NOT NULL,
  confidence     NUMERIC(5,2) NOT NULL,
  recommendation TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_recommendations (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id),
  location_name   VARCHAR(150),
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  temperature_c   DOUBLE PRECISION,
  humidity_percent DOUBLE PRECISION,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_recommendation_suggestions (
  recommendation_id BIGINT REFERENCES crop_recommendations(id) ON DELETE CASCADE,
  crop_name         VARCHAR(80),
  suitability_score DOUBLE PRECISION,
  advice            TEXT,
  strategy_label    VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS land_surveys (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id),
  field_label    VARCHAR(120),
  method         VARCHAR(80),
  area_sq_meters DOUBLE PRECISION,
  area_acres     DOUBLE PRECISION,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS land_survey_points (
  survey_id BIGINT REFERENCES land_surveys(id) ON DELETE CASCADE,
  latitude  DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS crop_schedules (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id),
  crop_name  VARCHAR(120),
  strategy   VARCHAR(40),
  acres      DOUBLE PRECISION,
  start_week DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_schedule_tasks (
  schedule_id BIGINT REFERENCES crop_schedules(id) ON DELETE CASCADE,
  day_label   VARCHAR(40),
  focus_area  VARCHAR(120),
  guidance    TEXT,
  input_type  VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS market_price_snapshots (
  id               BIGSERIAL PRIMARY KEY,
  crop_name        VARCHAR(120),
  market_name      VARCHAR(120),
  currency         VARCHAR(10) DEFAULT 'INR',
  price_per_quintal DOUBLE PRECISION,
  change_percent   DOUBLE PRECISION,
  data_source      VARCHAR(80),
  price_date       TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW()
);

