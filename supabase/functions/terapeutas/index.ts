import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface TerapeutaData {
  nombre?: string;
  apellido?: string;
  tipo_terapeuta?: boolean;
  tipo_terapeuta_nombre?: string;
  especialidad?: string;
  region?: string;
  comuna?: string;
  lugar_atencion?: string;
  valor_consulta?: number;
  descripcion?: string;
  rut?: string;
  edad_atencion?: string;
  tipo_atencion?: string;
  horarios?: string;
  direccion_atencion?: string;
  atiende_ninos?: boolean;
  atiende_adolescentes?: boolean;
  atiende_adultos?: boolean;
  atiende_hombre_cis?: boolean;
  atiende_presencial?: boolean;
  atiende_online?: boolean;
  arancel_diferencial?: boolean;
  valor_general_atencion?: number;
  cupos_30000_35000?: number;
  cupos_25000_29000?: number;
  cupos_20000_24000?: number;
  cupos_15000_19000?: number;
  horarios_online?: string | Record<string, any>;
  horarios_presencial?: string | Record<string, any>;
}

interface HorariosData {
  horarios_online?: string | Record<string, any>;
  horarios_presencial?: string | Record<string, any>;
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
  
    // GET - Obtener todos los terapeutas, por ID o por tipo
    if (req.method === "GET") {
      try {
        // Verifica si estamos buscando por tipo
        if (path.length > 1 && path[1] === "tipo" && path.length > 2) {
          const tipo = path[2];
          console.log(`🔍 Buscando terapeutas de tipo: ${tipo}`);
          
          const { data, error } = await supabaseAdmin
            .from("psicologos")
            .select("*")
            .eq("tipo_terapeuta_nombre", tipo)
            .order("created_at", { ascending: false });
            
          if (error) throw error;
          
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        }
        
        // Obtener un terapeuta por ID
        if (id && path[1] !== "tipo") {
          console.log(`🔍 Buscando terapeuta con ID: ${id}`);
          
          const { data, error } = await supabaseAdmin
            .from("psicologos")
            .select("*")
            .eq("id", id)
            .single();
            
          if (error) throw error;
          
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        } 
        
        // Obtener todos los terapeutas
        if (!id || path[1] === "todos") {
          console.log('📋 Listando todos los terapeutas');
          
          const { data, error } = await supabaseAdmin
            .from("psicologos")
            .select("*")
            .order("created_at", { ascending: false });
            
          if (error) throw error;
          
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
    
    // POST - Crear un nuevo terapeuta
    if (req.method === "POST") {
      try {
        const rawBody = await req.text();
        console.log('📦 Datos recibidos (longitud):', rawBody.length);
        
        let terapeutaData: TerapeutaData;
        try {
          terapeutaData = JSON.parse(rawBody);
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
        if (!terapeutaData.nombre || !terapeutaData.apellido || !terapeutaData.rut) {
          console.warn('⚠️ Datos incompletos');
          return new Response(JSON.stringify({ 
            error: "Nombre, apellido y RUT son requeridos" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          });
        }
        
        // Verificar si el RUT ya existe
        const { data: rutCheck, error: rutError } = await supabaseAdmin
          .from("psicologos")
          .select("id")
          .eq("rut", terapeutaData.rut);
          
        if (rutError) throw rutError;
        
        if (rutCheck && rutCheck.length > 0) {
          return new Response(JSON.stringify({ error: "Ya existe un terapeuta con el mismo RUT" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409 // Conflict
          });
        }
        
        // Insertar el terapeuta
        const { data, error } = await supabaseAdmin
          .from("psicologos")
          .insert([terapeutaData])
          .select();
          
        if (error) {
          console.error('❌ Error en inserción:', error);
          throw error;
        }
        
        console.log('✅ Terapeuta creado exitosamente');
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        });
      } catch (error) {
        console.error("Error en POST:", error);
        return new Response(JSON.stringify({ 
          error: "Error al crear terapeuta", 
          details: error.message || "Error desconocido" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // PUT - Actualizar un terapeuta existente
    if (req.method === "PUT" && id) {
      try {
        console.log(`🔄 Actualizando terapeuta con ID: ${id}`);
        const terapeutaData: TerapeutaData = await req.json();
        
        // Si está actualizando el RUT, verificar que no exista otro con el mismo
        if (terapeutaData.rut) {
          const { data: rutCheck, error: rutError } = await supabaseAdmin
            .from("psicologos")
            .select("id")
            .eq("rut", terapeutaData.rut)
            .neq("id", id);
            
          if (rutError) throw rutError;
          
          if (rutCheck && rutCheck.length > 0) {
            return new Response(JSON.stringify({ error: "Ya existe otro terapeuta con el mismo RUT" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 409 // Conflict
            });
          }
        }
        
        const { data, error } = await supabaseAdmin
          .from("psicologos")
          .update(terapeutaData)
          .eq("id", id)
          .select();
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return new Response(JSON.stringify({ error: "Terapeuta no encontrado" }), {
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
          error: "Error al actualizar terapeuta", 
          details: error.message || "Error desconocido" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // PATCH - Actualizar solo los horarios de un terapeuta
    if (req.method === "PATCH" && id && path.length > 2 && path[2] === "horarios") {
      try {
        console.log(`🕒 Actualizando horarios del terapeuta con ID: ${id}`);
        const horariosData: HorariosData = await req.json();
        
        // Verificar que el terapeuta existe
        const { data: terapeutaExiste, error: checkError } = await supabaseAdmin
          .from("psicologos")
          .select("id")
          .eq("id", id);
          
        if (checkError) throw checkError;
        
        if (!terapeutaExiste || terapeutaExiste.length === 0) {
          return new Response(JSON.stringify({ error: "Terapeuta no encontrado" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404
          });
        }
        
        const { data, error } = await supabaseAdmin
          .from("psicologos")
          .update(horariosData)
          .eq("id", id)
          .select();
          
        if (error) throw error;
        
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } catch (error) {
        console.error("Error en PATCH:", error);
        return new Response(JSON.stringify({ 
          error: "Error al actualizar horarios", 
          details: error.message || "Error desconocido" 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
    
    // DELETE - Eliminar un terapeuta
    if (req.method === "DELETE" && id) {
      try {
        console.log(`🗑️ Eliminando terapeuta con ID: ${id}`);
        
        const { data, error } = await supabaseAdmin
          .from("psicologos")
          .delete()
          .eq("id", id)
          .select();
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return new Response(JSON.stringify({ error: "Terapeuta no encontrado" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404
          });
        }
        
        return new Response(JSON.stringify({ message: "Terapeuta eliminado exitosamente" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } catch (error) {
        console.error("Error en DELETE:", error);
        return new Response(JSON.stringify({ 
          error: "Error al eliminar terapeuta", 
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