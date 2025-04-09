import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface CampoData {
  nombre_campo: string;
  etiqueta: string;
  tipo: string;
  opciones?: any[] | null;
  requerido?: boolean;
  activo?: boolean;
  orden: number;
  categoria?: string;
}

serve(async (req: Request) => {
  // Mostrar información de la solicitud para depuración
  console.log("Recibiendo solicitud:", req.method, req.url);
  
  // Manejo de CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log("Respondiendo a solicitud OPTIONS de CORS");
    return corsResponse;
  }

  try {
    // Intentar diferentes nombres de variables de entorno
    const apiUrl = Deno.env.get("SUPABASE_URL") || 
                  Deno.env.get("SUPABASE_API_URL") || 
                  Deno.env.get("APP_API_URL");
    
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || 
                          Deno.env.get("APP_SERVICE_ROLE_KEY");

    console.log("Variables de entorno:", {
      apiUrl: apiUrl ? `${apiUrl.substring(0, 20)}...` : "no definida",
      serviceRoleKey: serviceRoleKey ? "definida (oculta)" : "no definida"
    });

    // Validación estricta de variables de entorno
    if (!apiUrl || !serviceRoleKey) {
      console.error("ERROR: Variables de entorno no configuradas correctamente");
      return new Response(JSON.stringify({ 
        error: "Configuración del servidor incompleta", 
        details: "Variables de entorno no configuradas" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
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
    
    // GET - Obtener todos los campos o campos activos
    if (req.method === "GET") {
      try {
        if (path.length > 1 && path[1] === "activos") {
          console.log("Solicitando campos activos");
          
          const { data, error } = await supabaseAdmin
            .from("configuracion_campos")
            .select("*")
            .eq("activo", true)
            .order("orden", { ascending: true });
            
          if (error) {
            console.error("Error al consultar campos activos:", error);
            throw error;
          }
          
          console.log(`Campos activos encontrados: ${data ? data.length : 0}`);
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        } else {
          console.log("Solicitando todos los campos");
          
          const { data, error } = await supabaseAdmin
            .from("configuracion_campos")
            .select("*")
            .order("orden", { ascending: true });
            
          if (error) {
            console.error("Error al consultar todos los campos:", error);
            throw error;
          }
          
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        }
      } catch (error) {
        console.error("Error en endpoint GET:", error);
        return new Response(JSON.stringify({ 
          error: "Error al consultar campos", 
          details: error.message || "Error desconocido"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
    }
    
    // POST - Crear un nuevo campo
    if (req.method === "POST") {
      try {
        const rawBody = await req.text();
        console.log('Datos recibidos para creación de campo (longitud):', rawBody.length);
        
        let campoData: CampoData;
        try {
          campoData = JSON.parse(rawBody);
        } catch (parseError) {
          console.error('Error al parsear JSON:', parseError);
          return new Response(JSON.stringify({ 
            error: "Datos JSON inválidos", 
            details: parseError.message 
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        // Validación básica
        if (!campoData.nombre_campo || !campoData.etiqueta || !campoData.tipo) {
          return new Response(JSON.stringify({ 
            error: "Nombre del campo, etiqueta y tipo son requeridos" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
          });
        }
        
        // Verificar que el nombre del campo sea único
        const { data: nombreCheck, error: nombreError } = await supabaseAdmin
          .from("configuracion_campos")
          .select("id")
          .eq("nombre_campo", campoData.nombre_campo);
          
        if (nombreError) {
          console.error("Error al verificar nombre de campo:", nombreError);
          throw nombreError;
        }
        
        if (nombreCheck && nombreCheck.length > 0) {
          return new Response(JSON.stringify({ 
            error: "Ya existe un campo con el mismo nombre interno" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409 // Conflict
          });
        }
        
        // Preparar las opciones si existen
        let opcionesProcesadas = null;
        if (campoData.opciones && Array.isArray(campoData.opciones)) {
          opcionesProcesadas = campoData.opciones;
        } else if (campoData.opciones && typeof campoData.opciones === 'object') {
          opcionesProcesadas = campoData.opciones;
        }
        
        // Crear objeto con datos a insertar
        const campoAInsertar = {
          nombre_campo: campoData.nombre_campo,
          etiqueta: campoData.etiqueta,
          tipo: campoData.tipo,
          opciones: opcionesProcesadas,
          requerido: campoData.requerido || false,
          activo: campoData.activo !== undefined ? campoData.activo : true,
          orden: campoData.orden || 0,
          categoria: campoData.categoria || 'general'
        };
        
        // Insertar el campo
        const { data, error } = await supabaseAdmin
          .from("configuracion_campos")
          .insert([campoAInsertar])
          .select();
          
        if (error) {
          console.error("Error al insertar campo:", error);
          throw error;
        }
        
        console.log("Campo creado exitosamente");
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        });
      } catch (error) {
        console.error("Error en endpoint POST:", error);
        return new Response(JSON.stringify({ 
          error: "Error al crear campo", 
          details: error.message || "Error desconocido"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
    }
    
    // PUT - Actualizar un campo existente
    if (req.method === "PUT" && id) {
      try {
        console.log(`Actualizando campo con ID: ${id}`);
        const campoData: CampoData = await req.json();
        
        // Si está actualizando el nombre, verificar que sea único
        if (campoData.nombre_campo) {
          const { data: nombreCheck, error: nombreError } = await supabaseAdmin
            .from("configuracion_campos")
            .select("id")
            .eq("nombre_campo", campoData.nombre_campo)
            .neq("id", id);
            
          if (nombreError) {
            console.error("Error al verificar nombre de campo:", nombreError);
            throw nombreError;
          }
          
          if (nombreCheck && nombreCheck.length > 0) {
            return new Response(JSON.stringify({ 
              error: "Ya existe otro campo con el mismo nombre interno" 
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 409 // Conflict
            });
          }
        }
        
        // Preparar los datos a actualizar
        const campoActualizado = {
          nombre_campo: campoData.nombre_campo,
          etiqueta: campoData.etiqueta,
          tipo: campoData.tipo,
          opciones: campoData.opciones,
          requerido: campoData.requerido,
          activo: campoData.activo,
          orden: campoData.orden,
          categoria: campoData.categoria
        };
        
        // Actualizar el campo
        const { data, error } = await supabaseAdmin
          .from("configuracion_campos")
          .update(campoActualizado)
          .eq("id", id)
          .select();
          
        if (error) {
          console.error("Error al actualizar campo:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          return new Response(JSON.stringify({ error: "Campo no encontrado" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404
          });
        }
        
        console.log("Campo actualizado exitosamente");
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } catch (error) {
        console.error("Error en endpoint PUT:", error);
        return new Response(JSON.stringify({ 
          error: "Error al actualizar campo", 
          details: error.message || "Error desconocido"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
    }
    
    // DELETE - Eliminar un campo
    if (req.method === "DELETE" && id) {
      try {
        console.log(`Eliminando campo con ID: ${id}`);
        
        const { data, error } = await supabaseAdmin
          .from("configuracion_campos")
          .delete()
          .eq("id", id)
          .select();
          
        if (error) {
          console.error("Error al eliminar campo:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          return new Response(JSON.stringify({ error: "Campo no encontrado" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404
          });
        }
        
        console.log("Campo eliminado exitosamente");
        return new Response(JSON.stringify({ message: "Campo eliminado exitosamente" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } catch (error) {
        console.error("Error en endpoint DELETE:", error);
        return new Response(JSON.stringify({ 
          error: "Error al eliminar campo", 
          details: error.message || "Error desconocido"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
    }
    
    // Si no coincide con ninguna ruta
    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404
    });
    
  } catch (error: any) {
    console.error("Error general:", error.message);
    return new Response(JSON.stringify({ 
      error: "Error interno del servidor", 
      details: error.message || "Error desconocido"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});