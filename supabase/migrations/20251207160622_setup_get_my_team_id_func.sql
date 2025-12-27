-- Створюємо функцію, яка дістає team_id безпечно (минаючи RLS)
CREATE OR REPLACE FUNCTION get_my_team_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER -- Це головна частина: функція має права адміністратора
SET search_path = public -- Для безпеки
STABLE
AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid();
$$;