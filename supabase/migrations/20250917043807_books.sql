ALTER TABLE "public"."books"
ADD COLUMN "symbol" text Not NULL;

DROP TABLE IF EXISTS "public"."books_additional_information";