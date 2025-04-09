import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

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
    // Intentar diferentes nombres de variables de entorno
    const apiUrl = Deno.env.get("SUPABASE_URL") || 
                  Deno.env.get("SUPABASE_API_URL") || 
                  Deno.env.get("APP_API_URL");
    
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || 
                           Deno.env.get("APP_SERVICE_ROLE_KEY");

    console.log('🔐 Variables de entorno:');
    console.log('API URL:', apiUrl ? `${apiUrl.substring(0, 20)}...` : 'NO CONFIGURADA');
    console.log('Service Role Key:', serviceRoleKey ? 'configurada (oculta)' : 'NO CONFIGURADA');

    // Validación estricta de variables de entorno
    if (!apiUrl) {
      console.error("Error crítico: URL de API no configurada");
      return new Response(JSON.stringify({ 
        error: "Error de configuración", 
        details: "URL de API no configurada" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!serviceRoleKey) {
      console.error("Error crítico: Clave de servicio no configurada");
      return new Response(JSON.stringify({ 
        error: "Error de configuración", 
        details: "Clave de servicio no configurada" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
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
      try {
        console.log('📥 Solicitando pacientes');
        
        if (id) {
          console.log(`🔍 Buscando paciente con ID: ${id}`);
          
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
        } else {
          console.log('📋 Listando todos los pacientes');
          
          const { data, error } = await supabaseAdmin
            .from("perfiles_pacientes")
            .select("*")
            .order("created_at", { ascending: false });
            
          if (error) {
            console.error('❌ Error al listar pacientes:', error);
            throw error;
          }
          
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        }
      } catch (error) {
        console.error("Error en GET:", error);
        return new Response(JSON.stringify({ 
          error: "Error al consultar datos", 
          details: error.message || "Error desconocido" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // POST - Crear un nuevo paciente
    if (req.method === "POST") {
      try {
        // Para solicitudes POST, capturar el cuerpo y manejarlo con cuidado
        const rawBody = await req.text();
        console.log('📦 Datos recibidos (longitud):', rawBody.length);
        
        // Parsear manualmente para capturar errores JSON
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
        
        // Insertar el paciente
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
      } catch (error) {
        console.error("Error en POST:", error);
        return new Response(JSON.stringify({ 
          error: "Error al crear paciente", 
          details: error.message || "Error desconocido" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // PUT - Actualizar un paciente existente
    if (req.method === "PUT" && id) {
      try {
        console.log(`🔄 Actualizando paciente con ID: ${id}`);
        const pacienteData: PacienteData = await req.json();
        
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
      } catch (error) {
        console.error("Error en PUT:", error);
        return new Response(JSON.stringify({ 
          error: "Error al actualizar paciente", 
          details: error.message || "Error desconocido" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // DELETE - Eliminar un paciente
    if (req.method === "DELETE" && id) {
      try {
        console.log(`🗑️ Eliminando paciente con ID: ${id}`);
        
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
      } catch (error) {
        console.error("Error en DELETE:", error);
        return new Response(JSON.stringify({ 
          error: "Error al eliminar paciente", 
          details: error.message || "Error desconocido" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
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
      message: error.message || "Error desconocido"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});