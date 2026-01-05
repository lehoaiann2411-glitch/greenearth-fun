-- Drop all RLS policies on green_nfts
DROP POLICY IF EXISTS "NFTs are viewable by everyone" ON green_nfts;
DROP POLICY IF EXISTS "Users can create their own NFTs" ON green_nfts;
DROP POLICY IF EXISTS "Users can update their own NFTs" ON green_nfts;
DROP POLICY IF EXISTS "Users can delete their own NFTs" ON green_nfts;

-- Drop the green_nfts table
DROP TABLE IF EXISTS green_nfts CASCADE;