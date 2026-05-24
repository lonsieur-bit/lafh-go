-- Safe repair for Arabic text saved as UTF-8 misread as Latin-1 (Ø£Ø±Ø¨Ø§Ø­…)
-- Does NOT use blind convert_to(LATIN1) on all rows (that fails on valid UTF-8).
-- Run once in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION public.try_fix_mojibake(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL OR btrim(input_text) = '' THEN
    RETURN input_text;
  END IF;

  -- Only attempt byte fix when text looks like classic mojibake
  IF input_text !~ 'Ø' AND input_text !~ 'â€' AND input_text !~ 'Ã' THEN
    RETURN input_text;
  END IF;

  BEGIN
    RETURN convert_from(convert_to(input_text, 'LATIN1'), 'UTF8');
  EXCEPTION
    WHEN OTHERS THEN
      RETURN input_text;
  END;
END;
$$;

-- Wallet transactions
UPDATE wallet_transactions
SET
  title = public.try_fix_mojibake(title),
  subtitle = public.try_fix_mojibake(subtitle)
WHERE title ~ 'Ø|â€|Ã' OR (subtitle IS NOT NULL AND subtitle ~ 'Ø|â€|Ã');

-- Orders status labels
UPDATE orders
SET status_label = public.try_fix_mojibake(status_label)
WHERE status_label IS NOT NULL AND status_label ~ 'Ø|â€|Ã';

-- Timeline step titles
UPDATE order_timeline_steps
SET title = public.try_fix_mojibake(title)
WHERE title ~ 'Ø|â€|Ã';

-- Canonical Arabic for order status when label is still broken or empty
UPDATE orders
SET status_label = CASE status
  WHEN 'completed' THEN 'مكتملة'
  WHEN 'active' THEN 'جاري'
  WHEN 'pending' THEN 'بانتظار كابتن'
  WHEN 'cancelled' THEN 'ملغاة'
  ELSE status_label
END
WHERE status_label IS NULL
   OR btrim(status_label) = ''
   OR status_label ~ 'Ø|â€|Ã';

-- Known wallet titles (explicit mojibake patterns)
UPDATE wallet_transactions
SET title = 'أرباح رحلة'
WHERE title ~ 'Ø£Ø±Ø¨Ø§Ø­';

UPDATE wallet_transactions
SET title = 'شحن المحفظة'
WHERE title ~ 'Ø´Ø­Ù†';

UPDATE wallet_transactions
SET title = 'دفع رحلة'
WHERE title ~ 'Ø¯ÙØ¹';

UPDATE wallet_transactions
SET title = 'بطاقة هدية'
WHERE title ~ 'Ø¨Ø·Ø§Ù‚Ø©|Ù‡Ø¯ÙŠØ©';

-- Optional: drop helper (comment out if you want to keep it)
-- DROP FUNCTION IF EXISTS public.try_fix_mojibake(TEXT);
