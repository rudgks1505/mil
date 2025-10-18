ALTER TABLE "public"."books"
DROP COLUMN uuid;

ALTER TABLE "public"."books"
add column uuid uuid not null default gen_random_uuid();

ALTER TABLE "public"."books"
ADD CONSTRAINT books_uuid_unique UNIQUE (uuid);

ALTER TABLE "public"."books"
ADD COLUMN "book_review" text Not NULL DEFAULT '';