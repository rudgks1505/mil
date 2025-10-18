ALTER TABLE ONLY mainvisual
    DROP CONSTRAINT IF EXISTS "Mainvisual_order_key";

ALTER TABLE mainvisual
ALTER COLUMN slide_order SET DEFAULT 0;

ALTER TABLE mainvisual
ALTER COLUMN slide_order SET NOT NULL;
