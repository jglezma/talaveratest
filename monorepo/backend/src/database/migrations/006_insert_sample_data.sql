-- Insertar usuario de prueba
INSERT INTO users (email, name, password_hash) 
VALUES ('test@example.com', 'Usuario de Prueba', '$2a$10$test.hash.example') 
ON CONFLICT (email) DO NOTHING;

-- Insertar proyecto de prueba
INSERT INTO projects (user_id, title, description, status) 
SELECT u.id, 'Proyecto de Prueba', 'Este es un proyecto de ejemplo', 'active'
FROM users u 
WHERE u.email = 'test@example.com'
AND NOT EXISTS (SELECT 1 FROM projects WHERE user_id = u.id AND title = 'Proyecto de Prueba');

-- Insertar suscripción de prueba
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end) 
SELECT u.id, 1, 'trialing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month'
FROM users u 
WHERE u.email = 'test@example.com'
AND NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = u.id);

-- Insertar factura de prueba
INSERT INTO invoices (user_id, subscription_id, amount, status, billing_period_start, billing_period_end, payment_date) 
SELECT u.id, s.id, 9.99, 'paid', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '25 days'
FROM users u
JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'test@example.com'
AND NOT EXISTS (SELECT 1 FROM invoices WHERE user_id = u.id);