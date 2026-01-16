insert into public.shops (id, name, lat, lng, contact) values
  ('00000000-0000-0000-0000-0000000000a1', 'Ganesh Kirana', 19.878, 79.967, '07172-111111'),
  ('00000000-0000-0000-0000-0000000000a2', 'Fresh Veggies', 19.876, 79.971, '07172-222222')
on conflict do nothing;

insert into public.products (shop_id, name, price) values
  ('00000000-0000-0000-0000-0000000000a1', 'Rice 1kg', 60),
  ('00000000-0000-0000-0000-0000000000a1', 'Wheat Flour 1kg', 55),
  ('00000000-0000-0000-0000-0000000000a1', 'Sugar 1kg', 50),
  ('00000000-0000-0000-0000-0000000000a1', 'Tea 250g', 90),
  ('00000000-0000-0000-0000-0000000000a1', 'Oil 1L', 140),
  ('00000000-0000-0000-0000-0000000000a2', 'Tomato 1kg', 30),
  ('00000000-0000-0000-0000-0000000000a2', 'Potato 1kg', 25),
  ('00000000-0000-0000-0000-0000000000a2', 'Onion 1kg', 28),
  ('00000000-0000-0000-0000-0000000000a2', 'Spinach bunch', 20),
  ('00000000-0000-0000-0000-0000000000a2', 'Cabbage 1pc', 35)
on conflict do nothing;

insert into public.delivery_boys (id, name, contact) values
  ('00000000-0000-0000-0000-0000000000d1', 'Ravi', '9000000001'),
  ('00000000-0000-0000-0000-0000000000d2', 'Sanjay', '9000000002')
on conflict do nothing;

-- Demo orders (3 buyers)
insert into public.orders (shop_id, buyer_name, buyer_contact, buyer_lat, buyer_lng, products, total_price, status, payment_type, payment_status, otp, shop_lat, shop_lng)
values
  ('00000000-0000-0000-0000-0000000000a1', 'Meera', '9000010001', 19.880, 79.970, '[{"product_id":"x","name":"Rice 1kg","price":60,"quantity":1}]', 60, 'pending', 'COD', 'unpaid', '1234', 19.878, 79.967),
  ('00000000-0000-0000-0000-0000000000a2', 'Anil',  '9000010002', 19.874, 79.973, '[{"product_id":"y","name":"Tomato 1kg","price":30,"quantity":2}]', 60, 'accepted', 'ONLINE', 'paid',  '5678', 19.876, 79.971),
  ('00000000-0000-0000-0000-0000000000a2', 'Kiran', '9000010003', 19.875, 79.975, '[{"product_id":"z","name":"Onion 1kg","price":28,"quantity":1}]', 28, 'ready', 'COD', 'unpaid', '9012', 19.876, 79.971);
