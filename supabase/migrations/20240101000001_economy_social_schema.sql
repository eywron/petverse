-- Part 2: Economy, Marketplace, Skills, Events, and Inventory Schema

-- ENUMS
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic');
CREATE TYPE item_type AS ENUM ('food', 'toy', 'accessory', 'costume', 'evolution_material', 'boost', 'collectible');

-- Items Catalog
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type item_type NOT NULL,
    rarity item_rarity DEFAULT 'common',
    base_value INTEGER DEFAULT 10,
    stats_boost JSONB DEFAULT '{}'::jsonb, -- e.g. {"hunger": 20, "happiness": 10}
    is_tradable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Global Marketplace (Auction/Trading)
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_coins INTEGER NOT NULL CHECK (price_coins > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '7 days')
);

-- Pet Skills (Agility, Intelligence, Luck, etc.)
CREATE TABLE pet_skills (
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    skill_name VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    PRIMARY KEY (pet_id, skill_name)
);

-- Global Events
CREATE TABLE world_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'double_xp', 'meteor_shower'
    modifiers JSONB DEFAULT '{}'::jsonb, -- e.g. {"xp_multiplier": 2}
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT false
);

-- Daily/Weekly Quests
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    quest_type VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'achievement'
    objective_type VARCHAR(50) NOT NULL, -- 'feed_pet', 'play_minigame'
    target_count INTEGER NOT NULL,
    reward_coins INTEGER DEFAULT 0,
    reward_item_id UUID REFERENCES items(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player Quest Progress
CREATE TABLE user_quests (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, quest_id)
);

-- RLS Policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;
-- Items and Events are readable by all
CREATE POLICY "Public items access" ON items FOR SELECT USING (true);
CREATE POLICY "Public events access" ON world_events FOR SELECT USING (true);

-- Inventory RLS
CREATE POLICY "Users can view own inventory" ON inventory FOR SELECT USING (auth.uid() = user_id);
-- (Further backend logic needed for safe inventory modifications)

-- Marketplace RLS
CREATE POLICY "Public marketplace listings" ON marketplace_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
