ALTER TABLE "public"."books"
ADD COLUMN "img_path" text Not NULL DEFAULT '';

ALTER TABLE "public"."chapters"
ADD COLUMN "img_path" text Not NULL DEFAULT '';