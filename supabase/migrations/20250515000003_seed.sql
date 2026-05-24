-- Demo seed data (profiles without auth — for local dev display only)
-- Link real auth.users to these IDs or sign up fresh; orders use demo rider UUID.

INSERT INTO service_config (service_type, base_fare_sar, label_ar) VALUES
  ('regular', 25, 'رحلة عادية'),
  ('premium', 45, 'رحلة مميزة'),
  ('family', 55, 'رحلة عائلية'),
  ('bike', 18, 'دراجة نارية'),
  ('cargo', 60, 'نقل بضائع'),
  ('tow', 80, 'سطحة')
ON CONFLICT (service_type) DO NOTHING;

-- Demo profiles (require matching auth.users for login; seed for admin UI browsing)
-- In production, create admin via Supabase dashboard and set role in profiles.

INSERT INTO orders (id, display_id, from_location, to_location, trip_date, trip_time, price_sar, status, status_label, rating, service_type, service_label, discount_sar, total_sar)
VALUES
  ('lf-2847', '#LF-2847', 'حي الياسمين', 'مطار الملك خالد', '2024-03-15', '14:30', 45, 'completed', 'مكتمل', 4.8, 'regular', 'توصيل ركاب', 5, 45),
  ('lf-2831', '#LF-2831', 'جامعة الملك سعود', 'العليا مول', '2024-03-14', '10:15', 22, 'completed', 'مكتمل', 5, 'regular', 'توصيل ركاب', NULL, 22),
  ('lf-2820', '#LF-2820', 'حي النخيل', 'حي الملقا', '2024-03-13', '18:00', 18, 'cancelled', 'ملغي', 0, 'regular', 'توصيل ركاب', NULL, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_timeline_steps (order_id, sort_order, title, step_time, done) VALUES
  ('lf-2847', 1, 'تم تأكيد الطلب', '14:22', true),
  ('lf-2847', 2, 'السائق في الطريق', '14:25', true),
  ('lf-2847', 3, 'بدء الرحلة', '14:30', true),
  ('lf-2847', 4, 'تم الوصول', '14:52', true),
  ('lf-2831', 1, 'تم تأكيد الطلب', '10:05', true),
  ('lf-2831', 2, 'تم الوصول', '10:15', true),
  ('lf-2820', 1, 'تم تأكيد الطلب', '17:50', true),
  ('lf-2820', 2, 'السائق في الطريق', '17:55', true),
  ('lf-2820', 3, 'تم الإلغاء', '18:00', true)
ON CONFLICT DO NOTHING;

INSERT INTO order_receipt_lines (order_id, sort_order, label, amount) VALUES
  ('lf-2847', 1, 'أجرة الرحلة', '38 ر.س'),
  ('lf-2847', 2, 'رسوم الخدمة', '4 ر.س'),
  ('lf-2847', 3, 'ضريبة القيمة المضافة', '3 ر.س'),
  ('lf-2831', 1, 'أجرة الرحلة', '20 ر.س'),
  ('lf-2831', 2, 'رسوم الخدمة', '2 ر.س'),
  ('lf-2820', 1, 'رسوم الإلغاء', '0 ر.س')
ON CONFLICT DO NOTHING;

INSERT INTO recharge_cards (code, amount_sar, status) VALUES
  ('RHC-4821-7390', 50, 'new'),
  ('RHC-9102-3847', 100, 'new'),
  ('RHC-5520-1183', 50, 'used')
ON CONFLICT (code) DO NOTHING;

INSERT INTO cargo_requests (from_location, to_location, description, status) VALUES
  ('حي الياسمين', 'الرياض — المستودعات', '3 صناديق — أثاث خفيف', 'pending'),
  ('طريق الملك فهد', 'جدة — الميناء', 'شحنة تجارية صغيرة', 'assigned')
ON CONFLICT DO NOTHING;
