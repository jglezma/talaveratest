CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    features JSONB DEFAULT '[]',
    billing_period VARCHAR(20) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default plans
INSERT INTO plans (name, description, price, features, billing_period, is_active) VALUES
('Basic', 'Basic plan with essential features', 9.99, '["5 projects", "Email support", "Basic analytics"]', 'monthly', true),
('Pro', 'Professional plan with advanced features', 29.99, '["Unlimited projects", "Priority support", "Advanced analytics", "Team collaboration"]', 'monthly', true),
('Enterprise', 'Enterprise plan with premium features', 99.99, '["Everything in Pro", "Custom integrations", "Dedicated support", "SLA guarantee"]', 'monthly', true);