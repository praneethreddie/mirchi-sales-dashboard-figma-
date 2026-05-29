-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_tier CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise'))
);

-- Create oauth_sessions table
CREATE TABLE IF NOT EXISTS oauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  raw_user_meta JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id)
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  token_hash VARCHAR(255) UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_attempts CHECK (attempts >= 0)
);

-- Create users metadata table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'staff',
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'staff', 'viewer'))
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  address TEXT,
  balance NUMERIC(12, 2) DEFAULT 0,
  gstin VARCHAR(50),
  bank_account JSONB,
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  address TEXT,
  balance NUMERIC(12, 2) DEFAULT 0,
  total_purchased NUMERIC(12, 2) DEFAULT 0,
  gstin VARCHAR(50),
  bank_account JSONB,
  credit_limit NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_number VARCHAR(50) NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  variety VARCHAR(100) NOT NULL,
  grade VARCHAR(50),
  total_bags INT NOT NULL,
  total_weight_kg NUMERIC(10, 2) NOT NULL,
  purchase_price_per_kg NUMERIC(10, 2) NOT NULL,
  total_value NUMERIC(12, 2) NOT NULL,
  storage_location VARCHAR(100),
  remaining_kg NUMERIC(10, 2) NOT NULL,
  remaining_bags INT NOT NULL,
  received_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, batch_number)
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  batch_id UUID NOT NULL REFERENCES batches(id),
  variety VARCHAR(100),
  grade VARCHAR(50),
  quantity_kg NUMERIC(10, 2) NOT NULL,
  quantity_bags INT NOT NULL,
  sale_price_per_kg NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'pending',
  sale_date DATE NOT NULL,
  delivery_date DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, invoice_number),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded'))
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_reference VARCHAR(100),
  payment_type VARCHAR(50) NOT NULL,
  party_id UUID,
  party_type VARCHAR(50),
  amount NUMERIC(12, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  bank_reference VARCHAR(100),
  cheque_number VARCHAR(50),
  cheque_date DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_payment_type CHECK (payment_type IN ('received', 'paid'))
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  description TEXT,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_action CHECK (action IN ('create', 'read', 'update', 'delete', 'login', 'logout'))
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  email_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  token VARCHAR(500) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_oauth_sessions_user_id ON oauth_sessions(user_id);
CREATE INDEX idx_oauth_sessions_provider ON oauth_sessions(provider);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_suppliers_organization_id ON suppliers(organization_id);
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_batches_organization_id ON batches(organization_id);
CREATE INDEX idx_batches_supplier_id ON batches(supplier_id);
CREATE INDEX idx_sales_organization_id ON sales(organization_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_email_logs_organization_id ON email_logs(organization_id);
CREATE INDEX idx_organization_invitations_organization_id ON organization_invitations(organization_id);

-- Create RLS Policies for organizations
CREATE POLICY org_select_own ON organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY org_insert_own ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY org_update_own ON organizations
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create RLS Policies for user_profiles
CREATE POLICY user_profiles_select ON user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY user_profiles_update ON user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create RLS Policies for suppliers
CREATE POLICY suppliers_select ON suppliers
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY suppliers_insert ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY suppliers_update ON suppliers
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Create RLS Policies for customers
CREATE POLICY customers_select ON customers
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY customers_insert ON customers
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY customers_update ON customers
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Create RLS Policies for batches
CREATE POLICY batches_select ON batches
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY batches_insert ON batches
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY batches_update ON batches
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Create RLS Policies for sales
CREATE POLICY sales_select ON sales
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY sales_insert ON sales
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY sales_update ON sales
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

-- Create RLS Policies for payments
CREATE POLICY payments_select ON payments
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY payments_insert ON payments
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()) AND created_by = auth.uid());

-- Create RLS Policies for activity_logs
CREATE POLICY activity_logs_select ON activity_logs
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY activity_logs_insert ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM user_profiles WHERE id = auth.uid()) AND user_id = auth.uid());
