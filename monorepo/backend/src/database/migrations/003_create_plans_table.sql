CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    billing_period VARCHAR(20) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);

-- Eliminar trigger si existe y crearlo nuevamente
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar planes de ejemplo solo si no existen
INSERT INTO plans (name, description, price, features, billing_period) 
SELECT 'Basic', 'Plan básico para comenzar', 9.99, '["1 proyecto", "Soporte básico", "1GB almacenamiento"]', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Basic');

INSERT INTO plans (name, description, price, features, billing_period) 
SELECT 'Pro', 'Plan profesional con más características', 19.99, '["5 proyectos", "Soporte prioritario", "10GB almacenamiento", "Analytics básicos"]', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pro');

INSERT INTO plans (name, description, price, features, billing_period) 
SELECT 'Enterprise', 'Plan empresarial completo', 49.99, '["Proyectos ilimitados", "Soporte 24/7", "100GB almacenamiento", "Analytics avanzados", "API access"]', 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Enterprise');