-- =====================================================
-- RLS ПОЛІТИКИ ДЛЯ TEAMS
-- =====================================================

-- Користувачі можуть читати команди, до яких вони належать
-- Використовуємо get_my_team_id() щоб уникнути рекурсії
CREATE POLICY "Users can view their own team"
ON public.teams
FOR SELECT
USING (
  teams.id = get_my_team_id()
);

-- Користувачі можуть читати команди за invite_code (для приєднання)
CREATE POLICY "Users can view teams by invite code"
ON public.teams
FOR SELECT
USING (true);

-- Користувачі можуть створювати нові команди
CREATE POLICY "Authenticated users can create teams"
ON public.teams
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Користувачі можуть оновлювати свою команду
-- Використовуємо get_my_team_id() щоб уникнути рекурсії
CREATE POLICY "Users can update their own team"
ON public.teams
FOR UPDATE
USING (
  teams.id = get_my_team_id()
);

-- =====================================================
-- RLS ПОЛІТИКИ ДЛЯ PROFILES
-- =====================================================

-- Користувачі можуть читати свій власний профіль
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Користувачі можуть читати профілі інших членів своєї команди
-- Використовуємо get_my_team_id() щоб уникнути рекурсії
CREATE POLICY "Users can view team members profiles"
ON public.profiles
FOR SELECT
USING (
  get_my_team_id() IS NOT NULL
  AND profiles.team_id = get_my_team_id()
);

-- Користувачі можуть оновлювати свій власний профіль
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- RLS ПОЛІТИКИ ДЛЯ PRODUCTS
-- =====================================================

-- Користувачі можуть читати продукти своєї команди
-- Використовуємо get_my_team_id() щоб уникнути рекурсії
CREATE POLICY "Users can view team products"
ON public.products
FOR SELECT
USING (
  products.team_id = get_my_team_id()
);

-- Користувачі можуть створювати продукти для своєї команди
CREATE POLICY "Users can create products for their team"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND products.team_id = get_my_team_id()
);

-- Користувачі можуть оновлювати продукти своєї команди (крім Active)
-- Вимога: "You can't edit active product"
CREATE POLICY "Users can update team products"
ON public.products
FOR UPDATE
USING (
  products.status != 'Active'
  AND products.team_id = get_my_team_id()
)
WITH CHECK (
  products.status != 'Active'
  AND products.team_id = get_my_team_id()
);

-- Користувачі НЕ можуть фізично видаляти продукти
-- Вимога: "If people delete a product it is not deleted, its status is changed to Deleted"
-- DELETE має бути заборонений - видалення відбувається через UPDATE статусу на 'Deleted'
-- Залишаємо DELETE тільки для cron task (через service_role)
CREATE POLICY "Prevent manual delete of products"
ON public.products
FOR DELETE
USING (false);

-- =====================================================
-- RLS ПОЛІТИКИ ДЛЯ STORAGE (AVATARS BUCKET)
-- =====================================================

-- Політики для storage.objects (avatars bucket)
-- Користувачі можуть завантажувати свої аватари
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

-- Користувачі можуть переглядати аватари членів своєї команди
CREATE POLICY "Users can view team avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'avatars'
  AND (
    -- Власний аватар
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    OR
    -- Аватари членів команди
    EXISTS (
      SELECT 1 FROM public.profiles AS my_profile
      INNER JOIN public.profiles AS team_member
        ON my_profile.team_id = team_member.team_id
      WHERE my_profile.id = auth.uid()
        AND team_member.id::text = (storage.foldername(storage.objects.name))[1]
        AND my_profile.team_id IS NOT NULL
    )
  )
);

-- Користувачі можуть оновлювати свій власний аватар
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

-- Користувачі можуть видаляти свій власний аватар
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);
