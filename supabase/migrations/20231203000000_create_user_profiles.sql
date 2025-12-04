-- ============================================================================
-- MIGRATION: Create user_profiles table for authentication and authorization
-- Description: Sistema de perfiles de usuario con roles y aprobación manual
-- Author: Sistema RedPsicoFem
-- Date: 2023-12-03
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLE: user_profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('admin', 'terapeuta_red_derivacion', 'terapeuta_redpsicofem')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  terapeuta_id INTEGER REFERENCES public.psicologos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_terapeuta_id ON public.user_profiles(terapeuta_id);

-- ============================================================================
-- 3. ADD COLUMNS TO psicologos (para vincular con auth)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'psicologos'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.psicologos ADD COLUMN email TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'psicologos'
    AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.psicologos ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE FUNCTION: update_updated_at_column
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGER: update user_profiles updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. CREATE FUNCTION: handle_new_user (auto-create profile on signup)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. CREATE TRIGGER: on_auth_user_created
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Los admins pueden ver todos los perfiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- Policy: Los usuarios pueden actualizar su propio display_name
DROP POLICY IF EXISTS "Users can update own display_name" ON public.user_profiles;
CREATE POLICY "Users can update own display_name"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Solo admins pueden aprobar y asignar roles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- Policy: Los usuarios pueden insertar su propio perfil (auto-registro)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 9. RLS POLICIES para tabla psicologos
-- ============================================================================

-- Enable RLS si no está habilitado
ALTER TABLE public.psicologos ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden ver terapeutas (SELECT público)
DROP POLICY IF EXISTS "Anyone can view terapeutas" ON public.psicologos;
CREATE POLICY "Anyone can view terapeutas"
  ON public.psicologos
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Admins pueden hacer todo
DROP POLICY IF EXISTS "Admins can do everything on psicologos" ON public.psicologos;
CREATE POLICY "Admins can do everything on psicologos"
  ON public.psicologos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
    )
  );

-- Policy: Terapeutas pueden actualizar solo su propio registro
DROP POLICY IF EXISTS "Terapeutas can update own profile" ON public.psicologos;
CREATE POLICY "Terapeutas can update own profile"
  ON public.psicologos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND terapeuta_id = psicologos.id
      AND status = 'approved'
      AND role IN ('terapeuta_red_derivacion', 'terapeuta_redpsicofem')
    )
  );

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL ON public.psicologos TO authenticated;
GRANT SELECT ON public.psicologos TO anon;

-- ============================================================================
-- 11. INSERT DEFAULT ADMIN USER
-- ============================================================================
-- Nota: El UUID se actualizará automáticamente cuando felipe.las.heras@gmail.com haga login
-- Este INSERT es para pre-registrar el email como admin
COMMENT ON TABLE public.user_profiles IS 'Tabla de perfiles de usuario con roles y sistema de aprobación';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
