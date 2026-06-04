-- ============================================================
-- Ali Bakerys — Update ALL product images
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- First verify your business exists:
-- SELECT id, name FROM businesses WHERE name ILIKE '%ali baker%';

-- Update images by product name (case-insensitive)
-- Each image is unique and matched to the product

DO $$
DECLARE
  biz_id uuid;
BEGIN
  SELECT id INTO biz_id FROM businesses WHERE name ILIKE '%ali baker%' LIMIT 1;

  IF biz_id IS NULL THEN
    RAISE NOTICE 'Business not found. Check the name.';
    RETURN;
  END IF;

  -- Cakes
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%birthday%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%chocolate cake%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%strawberry cake%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%vanilla cake%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80'
  WHERE business_id = biz_id AND (name ILIKE '%cheese cake%' OR name ILIKE '%cheesecake%');

  -- Donuts & pastries
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%donut%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%cupcake%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%croissant%';

  -- Bread
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80'
  WHERE business_id = biz_id AND (name ILIKE '%fresh bread%' OR name ILIKE '%bread%') AND name NOT ILIKE '%sandwich%';

  -- Cookies
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%chocolate cook%';

  -- Ice cream & desserts
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%chocolate ice cream%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%vanilla%' AND name NOT ILIKE '%cake%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%custard%';

  -- Milkshakes
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%milkshake%';

  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%oreo%';

  -- Sandwiches
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%sandwich%';

  -- Muffins
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%muffin%';

  -- Waffles
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%waffle%';

  -- Pancakes
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%pancake%';

  -- Brownies
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%brownie%';

  -- Pies / tarts
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&q=80'
  WHERE business_id = biz_id AND (name ILIKE '%pie%' OR name ILIKE '%tart%');

  -- Coffee / drinks
  UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80'
  WHERE business_id = biz_id AND name ILIKE '%coffee%';

  RAISE NOTICE 'Images updated for business: %', biz_id;
END;
$$;

-- Verify results
SELECT name, image_url
FROM products
WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%ali baker%' LIMIT 1)
ORDER BY name;
