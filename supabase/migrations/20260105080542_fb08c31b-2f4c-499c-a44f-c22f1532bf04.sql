-- Add DELETE policy for green_nfts
CREATE POLICY "Users can delete their own NFTs"
  ON green_nfts FOR DELETE
  USING (auth.uid() = user_id);