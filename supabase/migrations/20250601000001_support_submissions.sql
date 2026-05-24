-- Support / complaints / suggestions from mobile contact form

CREATE TYPE support_submission_status AS ENUM ('new', 'read', 'resolved');

CREATE TABLE public.support_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status support_submission_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX support_submissions_created_idx ON public.support_submissions (created_at DESC);
CREATE INDEX support_submissions_status_idx ON public.support_submissions (status);
CREATE INDEX support_submissions_category_idx ON public.support_submissions (category);

ALTER TABLE public.support_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_submissions_staff_select ON public.support_submissions
  FOR SELECT USING (public.is_staff());

CREATE POLICY support_submissions_staff_update ON public.support_submissions
  FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE OR REPLACE FUNCTION public.submit_support_message(
  p_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'general',
  p_subject TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS support_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row support_submissions;
  v_name TEXT := trim(coalesce(p_name, ''));
  v_message TEXT := trim(coalesce(p_message, ''));
BEGIN
  IF length(v_name) < 2 THEN
    RAISE EXCEPTION 'name_required';
  END IF;
  IF length(v_message) < 10 THEN
    RAISE EXCEPTION 'message_too_short';
  END IF;

  INSERT INTO support_submissions (profile_id, name, phone, category, subject, message)
  VALUES (
    auth.uid(),
    v_name,
    nullif(trim(coalesce(p_phone, '')), ''),
    coalesce(nullif(trim(p_category), ''), 'general'),
    nullif(trim(coalesce(p_subject, '')), ''),
    v_message
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_support_message(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
