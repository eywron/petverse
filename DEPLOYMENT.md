# PetVerse: Deployment Guide (Vercel + Supabase + Gemini)

This guide walks you through deploying the PetVerse Multiplayer AI MMO.

## Step 1: Set Up Supabase (Database & Backend)
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once created, go to **Settings > API** and copy your `Project URL` and `anon public key`.
3. Go to the **SQL Editor** in the Supabase Dashboard.
4. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql` and run it to create your base tables.
5. Copy the contents of `supabase/migrations/20240101000001_economy_social_schema.sql` and run it to create the economy tables.

## Step 2: Set Up Google Gemini (AI Engine)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key.
3. Copy the API Key.

## Step 3: Configure Environment Variables
In your local project root, create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Step 4: Deploy to Vercel
1. Push your code to GitHub (see the git commands you just ran).
2. Log into [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import the `petverse` repository from your GitHub.
4. Open the **Environment Variables** section before clicking deploy.
5. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
6. Click **Deploy**.

## Step 5: Supabase Realtime Verification
1. Go back to your Supabase Dashboard.
2. Go to **Database > Replication**.
3. Under `Source`, click `0 tables` and enable replication for the `pets` and `pet_interactions` tables so that the frontend can listen to live multiplayer changes.

You are now live! Players can start adopting pets, and Gemini will power their dialogue.
