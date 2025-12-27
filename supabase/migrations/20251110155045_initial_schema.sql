-- 1. Створення таблиці TEAMS
CREATE TABLE public.teams (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,  -- <-- Додано slug
    "invite_code" text NOT NULL UNIQUE, 
    "created_at" timestamptz DEFAULT now() NOT NULL,

    -- Валідація слагу: тільки маленькі літери, цифри та дефіс
    CONSTRAINT teams_slug_check CHECK (slug ~* '^[a-z0-9-]+$')
);

-- 2. Створення таблиці PROFILES
CREATE TABLE public.profiles (
    "id" uuid NOT NULL PRIMARY KEY, 
    "name" text,
    "avatar_url" text,
    "team_id" uuid,

    -- Зв'язок з auth.users
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) 
        REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Зв'язок з teams (NULL allowed)
    CONSTRAINT profiles_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES public.teams(id) ON DELETE SET NULL
);

-- 3. Створення таблиці PRODUCTS
CREATE TABLE public.products (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "team_id" uuid NOT NULL,
    "created_by" uuid NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "image_url" text,
    "status" text NOT NULL DEFAULT 'Draft',
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,

    -- Foreign Keys
    CONSTRAINT products_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES public.teams(id) ON DELETE CASCADE,
    CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) 
        REFERENCES auth.users(id),

    -- Валідація статусу (Best Practice)
    CONSTRAINT products_status_check CHECK (status IN ('Draft', 'Active', 'Deleted'))
);

-- 4. Налаштування Full-Text Search (FTS)
-- Додаємо колонку fts, яка автоматично генерується з title та description
ALTER TABLE public.products
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', title || ' ' || coalesce(description, ''))
) STORED;

-- Створюємо індекс для швидкого пошуку
CREATE INDEX products_fts_idx ON public.products USING GIN (fts);

-- 5. Тригер для автоматичного створення профілю (User creation logic)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 6. (BEST PRACTICE) Увімкнення RLS за замовчуванням
-- Це блокує доступ до даних, поки ми не напишемо політики (Policies)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;