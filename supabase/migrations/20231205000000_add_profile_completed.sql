-- ============================================================================
-- MIGRATION: Add profile_completed field to user_profiles
-- Description: Campo para rastrear si el usuario completó su registro inicial
-- Author: Sistema RedPsicoFem
-- Date: 2023-12-05
-- ============================================================================

-- Agregar columna profile_completed a user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_completed
ON public.user_profiles(profile_completed);

-- Actualizar usuarios admin existentes para que tengan profile_completed = true
UPDATE public.user_profiles
SET profile_completed = TRUE
WHERE role = 'admin' AND status = 'approved';

-- Comentario para documentación
COMMENT ON COLUMN public.user_profiles.profile_completed IS
'Indica si el usuario completó el formulario de registro inicial después del login con Google';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
