import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Definir los headers CORS directamente para evitar problemas de importación
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
};

// Función para manejar CORS
function handleCors(req: Request): Response | undefined {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
  return undefined;
}

interface PacienteData {
  email?: string;
  nombre?: string;
  apellido?: string;
  rut?: string;
  edad?: number;
  region?: string;
  comuna?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  nombre_contacto_emergencia?: string;
  telefono_contacto_emergencia?: string;
  motivo_consulta?: string;
  diagnostico?: string;
  sintomas?: string;
  horarios?: string;
  arancel?: string;
  prevision?: string;
  modalidad?: string;
  psicologo_varon?: boolean;
  practicante?: boolean;
  pregunta?: string;
  campos_dinamicos?: Record<string, any>;
}

serve(async (req: Request) => {
  // Imprimir información de depuración al inicio
  console.log('🚀 Nueva solicitud recibida:');
  console.log('Método:', req.method);
  console.log('URL completa:', req.url);

  // Verificar y manejar CORS primero
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log('✅ Respondiendo a solicitud CORS');
    return corsResponse;
  }

  try {
    // Depuración de variables de entorno
    const apiUrl = Deno.env.get("APP_API_URL");
    const serviceRoleKey = Deno.env.get("APP_SERVICE_ROLE_KEY");

    console.log('🔐 Variables de entorno:');
    console.log('API URL:', apiUrl ? apiUrl.substring(0, 30) + '...' : 'NO CONFIGURADA');
    console.log('Service Role Key (preview):', serviceRoleKey ? serviceRoleKey.substring(0, 5) + '...' : 'NO CONFIGURADA');

    // Validar que todas las variables estén presentes
    if (!apiUrl || !serviceRoleKey) {
      throw new Error("Configuración de entorno incompleta");
    }

    // Cliente de Supabase
    const supabaseAdmin = createClient(apiUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean);
    const id = path.length > 1 ? path[1] : null;
  
    // GET - Obtener todos los pacientes o un paciente específico
    if (req.method === "GET") {
      console.log('📥 Solicitando pacientes');
      
      // Datos de prueba para la fase de debugging
      const mockData = [{
        id: 1,
        email: "test@example.com",
        nombre: "Test",
        apellido: "Usuario",
        rut: "12.345.678-9",
        edad: 30,
        region: "Metropolitana",
        comuna: "Santiago",
        ciudad: "Santiago",
        direccion: "Calle Test 123",
        telefono: "+56912345678",
        created_at: new Date().toISOString()
      }];
      
      if (id) {
        console.log(`🔍 Buscando paciente con ID: ${id}`);
        return new Response(JSON.stringify(mockData[0]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        
        /* Código real para cuando el CORS funcione
        const { data, error } = await supabaseAdmin
          .from("perfiles_pacientes")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) {
          console.error('❌ Error al buscar paciente:', error);
          throw error;
        }
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        */
      } else {
        console.log('📋 Listando todos los pacientes');
        return new Response(JSON.stringify(mockData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        
        /* Código real para cuando el CORS funcione
        const { data, error } = await supabaseAdmin
          .from("perfiles_pacientes")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error('❌ Error al listar pacientes:', error);
          throw error;
        }
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        */
      }
    }
    
    // POST - Crear un nuevo paciente
    if (req.method === "POST") {
      // Para solicitudes POST, mostrar el cuerpo de la solicitud
      const rawBody = await req.text();
      console.log('📦 Datos recibidos:', rawBody);
      
      // Parsear manualmente para capturar cualquier error de JSON
      let pacienteData: PacienteData;
      try {
        pacienteData = JSON.parse(rawBody);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        return new Response(JSON.stringify({ 
          error: "Datos JSON inválidos", 
          details: parseError.message 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Validación básica
      if (!pacienteData.nombre || !pacienteData.apellido) {
        console.warn('⚠️ Datos incompletos');
        return new Response(JSON.stringify({ 
          error: "Nombre y apellido son requeridos" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Datos simulados para fase de debugging
      const mockResponse = {
        ...pacienteData,
        id: 999,
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Datos simulados creados exitosamente');
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
      
      /* Código real para cuando el CORS funcione
      // Usamos el cliente administrativo para la inserción
      const { data, error } = await supabaseAdmin
        .from("perfiles_pacientes")
        .insert([pacienteData])
        .select();
        
      if (error) {
        console.error('❌ Error en inserción:', error);
        return new Response(JSON.stringify({ 
          error: "Error al insertar datos", 
          details: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      console.log('✅ Datos insertados exitosamente');
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
      */
    }
    
    // PUT - Actualizar un paciente existente
    if (req.method === "PUT" && id) {
      console.log(`🔄 Actualizando paciente con ID: ${id}`);
      const pacienteData: PacienteData = await req.json();
      
      // Datos simulados para fase de debugging
      const mockResponse = {
        ...pacienteData,
        id: parseInt(id),
        updated_at: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      /* Código real para cuando el CORS funcione
      const { data, error } = await supabaseAdmin
        .from("perfiles_pacientes")
        .update(pacienteData)
        .eq("id", id)
        .select();
        
      if (error) {
        console.error('❌ Error al actualizar:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn(`⚠️ Paciente no encontrado: ${id}`);
        return new Response(JSON.stringify({ error: "Paciente no encontrado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        });
      }
      
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      */
    }
    
    // DELETE - Eliminar un paciente
    if (req.method === "DELETE" && id) {
      console.log(`🗑️ Eliminando paciente con ID: ${id}`);
      
      // Respuesta simulada para fase de debugging
      return new Response(JSON.stringify({ 
        message: "Paciente eliminado exitosamente",
        id: parseInt(id)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      /* Código real para cuando el CORS funcione
      const { data, error } = await supabaseAdmin
        .from("perfiles_pacientes")
        .delete()
        .eq("id", id)
        .select();
        
      if (error) {
        console.error('❌ Error al eliminar:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn(`⚠️ Paciente no encontrado para eliminar: ${id}`);
        return new Response(JSON.stringify({ error: "Paciente no encontrado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        });
      }
      
      return new Response(JSON.stringify({ message: "Paciente eliminado exitosamente" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      */
    }
    
    // Si no coincide con ninguna ruta
    console.warn('❓ Ruta no encontrada');
    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404
    });
    
  } catch (error: any) {
    console.error('🔥 Error crítico:', error);
    return new Response(JSON.stringify({ 
      error: "Error interno del servidor", 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});