-- Initial Supabase Schema for PetVerse

-- Enums
CREATE TYPE pet_state AS ENUM ('normal', 'sleepy', 'bored', 'weak', 'sick', 'critical', 'excited');
CREATE TYPE memory_category AS ENUM ('short_term', 'emotional', 'relationship', 'favorite');

-- Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    coins INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Pets
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(50) DEFAULT 'cat',
    
    -- Stats (0 to 100)
    hunger INTEGER DEFAULT 100,
    energy INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 100,
    cleanliness INTEGER DEFAULT 100,
    
    -- Progression
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    bond_level INTEGER DEFAULT 1,
    
    -- State
    current_state pet_state DEFAULT 'normal',
    
    -- Offline calculations reference
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet Memories
CREATE TABLE pet_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    category memory_category DEFAULT 'short_term',
    memory_text TEXT NOT NULL,
    significance INTEGER DEFAULT 1 CHECK (significance BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Interactions Log (For world events, friends helping)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'feed', 'play', 'heal'
    value_changed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Configuration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Sample Policies
-- Pets can be viewed by anyone, but updated by owner or via specific friend actions
CREATE POLICY "Pets are viewable by everyone" ON pets FOR SELECT USING (true);
CREATE POLICY "Pet owners can update their pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);

-- Trigger for updated_at tracking
CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pets_time
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_at();
