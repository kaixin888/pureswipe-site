-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_location TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: migrate existing hardcoded reviews
INSERT INTO reviews (author_name, author_location, rating, content, is_published) VALUES
('Sarah J.', 'Houston, TX', 5, 'Finally, a toilet brush that doesn''t gross me out! The 18-inch handle is a game-changer. I don''t have to get anywhere near the bowl. Love the zero-touch release!', true),
('Mike R.', 'New York, NY', 5, 'Best purchase for my new apartment. The caddy is well-ventilated so it stays dry. The pads really scrub off the tough stains without scratching.', true),
('Linda W.', 'Chicago, IL', 5, 'The ''no-return'' refund policy gave me the confidence to try it. But I''m keeping it! It''s much more hygienic than those traditional brushes.', true),
('Robert D.', 'Miami, FL', 5, 'I have back issues, and the extra-long handle means I don''t have to bend down as much. Very sturdy and professional feel.', true),
('Jessica M.', 'Seattle, WA', 5, 'One box lasts me almost a year with the 48 refills. Great value and it actually cleans better than the soap-dispensing brushes I''ve used before.', true),
('David K.', 'Denver, CO', 5, 'Super easy to use. Click on, clean, click off. No mess, no dripping on the floor. Highly recommend for busy families.', true),
('Karen L.', 'Atlanta, GA', 5, 'The pads have a lot of cleaning agent in them. One pad is enough for a deep clean. My bathroom smells like the ocean now!', true),
('Thomas B.', 'Boston, MA', 5, 'A bit skeptical at first, but the quality of the wand is top-notch. It''s solid, not flimsy like the ones you find at the supermarket.', true),
('Jennifer S.', 'San Francisco, CA', 5, 'Excellent customer service. I had a question about the refills and they replied within minutes. Great product, even better team.', true),
('Steven P.', 'Phoenix, AZ', 5, 'Love that it''s designed for US standards. Fits perfectly under the rim. Makes a chore I hate a lot less disgusting.', true)
ON CONFLICT DO NOTHING;
