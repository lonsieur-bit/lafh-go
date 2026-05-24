-- In-app chat per order + allow trip participants to read each other's profile (name/phone)

CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_messages_order_created_idx
  ON public.order_messages (order_id, created_at);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_messages_select ON public.order_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.rider_id = auth.uid() OR o.captain_id = auth.uid())
    )
    OR public.is_staff()
  );

CREATE POLICY order_messages_insert ON public.order_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (o.rider_id = auth.uid() OR o.captain_id = auth.uid())
    )
  );

-- Captains/riders can read the other party's display name and phone for shared orders
CREATE POLICY profiles_select_trip_partner ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE (
        (o.rider_id = auth.uid() AND o.captain_id = profiles.id)
        OR (o.captain_id = auth.uid() AND o.rider_id = profiles.id)
      )
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'order_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
  END IF;
END $$;
