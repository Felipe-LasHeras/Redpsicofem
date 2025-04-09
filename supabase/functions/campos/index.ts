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

  // Obtener y verificar variables de entorno
  const apiUrl = Deno.env.get("APP_API_URL") ?? "";
  const serviceRoleKey = Deno.env.get("APP_SERVICE_ROLE_KEY") ?? "";
  
  console.log("Variables de entorno:", {
    apiUrl: apiUrl ? `${apiUrl.substring(0, 20)}...` : "no definida",
    serviceRoleKey: serviceRoleKey ? "definida (oculta)" : "no definida"
  });

  // Verificar si las variables están configuradas
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

  // Cliente administrativo con permisos elevados
  const supabaseAdmin = createClient(apiUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  const id = path.length > 1 ? path[1] : null;
  
  try {
    // GET - Obtener todos los campos o campos activos
    if (req.method === "GET") {
      if (path.length > 1 && path[1] === "activos") {
        console.log("Solicitando campos activos");
        try {
          // Datos mock para pruebas (temporalmente habilitados para verificar CORS)
          const mockData = [
            {
              id: 1,
              nombre_campo: "test_field",
              etiqueta: "Campo de prueba",
              tipo: "text",
              requerido: false,
              activo: true,
              orden: 1,
              categoria: "general"
            }
          ];
          
          // Usar datos mock durante la depuración
          return new Response(JSON.stringify(mockData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
          
          // Cuando funcione el CORS, puedes descomentar el código siguiente para usar los datos reales
          /*
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
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
          */
        } catch (dbError) {
          console.error("Error en consulta de DB:", dbError);
          return new Response(JSON.stringify({ 
            error: "Error al consultar la base de datos", 
            details: dbError.message 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          });
        }
      } else {
        console.log("Solicitando todos los campos");
        // Datos mock para pruebas (temporalmente habilitados para verificar CORS)
        const mockData = [
          {
            id: 1,
            nombre_campo: "test_field",
            etiqueta: "Campo de prueba",
            tipo: "text",
            requerido: false,
            activo: true,
            orden: 1,
            categoria: "general"
          },
          {
            id: 2,
            nombre_campo: "test_field2",
            etiqueta: "Campo de prueba 2",
            tipo: "dropdown",
            requerido: true,
            activo: true,
            orden: 2,
            categoria: "contacto"
          }
        ];
        
        return new Response(JSON.stringify(mockData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        
        // Cuando funcione el CORS, puedes descomentar el código siguiente para usar los datos reales
        /*
        const { data, error } = await supabaseAdmin
          .from("configuracion_campos")
          .select("*")
          .order("orden", { ascending: true });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        */
      }
    }
    
    // POST - Crear un nuevo campo
    if (req.method === "POST") {
      const campoData: CampoData = await req.json();
      
      // Validación básica
      if (!campoData.nombre_campo || !campoData.etiqueta || !campoData.tipo) {
        return new Response(JSON.stringify({ 
          error: "Nombre del campo, etiqueta y tipo son requeridos" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      // Simulación para pruebas
      return new Response(JSON.stringify({
        ...campoData,
        id: 999,
        created_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
      
      // Código real para cuando funcione el CORS
      /*
      // Verificar que el nombre del campo sea único
      const { data: nombreCheck, error: nombreError } = await supabaseAdmin
        .from("configuracion_campos")
        .select("id")
        .eq("nombre_campo", campoData.nombre_campo);
        
      if (nombreError) throw nombreError;
      
      if (nombreCheck && nombreCheck.length > 0) {
        return new Response(JSON.stringify({ 
          error: "Ya existe un campo con el mismo nombre interno" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409 // Conflict
        });
      }
      
      const { data, error } = await supabaseAdmin
        .from("configuracion_campos")
        .insert([campoData])
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
      */
    }
    
    // PUT - Actualizar un campo existente
    if (req.method === "PUT" && id) {
      const campoData: CampoData = await req.json();
      
      // Simulación para pruebas
      return new Response(JSON.stringify({
        ...campoData,
        id: parseInt(id),
        updated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      // Código real para cuando funcione el CORS
      /*
      // Si está actualizando el nombre, verificar que sea único
      if (campoData.nombre_campo) {
        const { data: nombreCheck, error: nombreError } = await supabaseAdmin
          .from("configuracion_campos")
          .select("id")
          .eq("nombre_campo", campoData.nombre_campo)
          .neq("id", id);
          
        if (nombreError) throw nombreError;
        
        if (nombreCheck && nombreCheck.length > 0) {
          return new Response(JSON.stringify({ 
            error: "Ya existe otro campo con el mismo nombre interno" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409 // Conflict
          });
        }
      }
      
      const { data, error } = await supabaseAdmin
        .from("configuracion_campos")
        .update(campoData)
        .eq("id", id)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ error: "Campo no encontrado" }), {
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
    
    // DELETE - Eliminar un campo
    if (req.method === "DELETE" && id) {
      // Simulación para pruebas
      return new Response(JSON.stringify({ 
        message: "Campo eliminado exitosamente",
        id: parseInt(id)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      // Código real para cuando funcione el CORS
      /*
      const { data, error } = await supabaseAdmin
        .from("configuracion_campos")
        .delete()
        .eq("id", id)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ error: "Campo no encontrado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        });
      }
      
      return new Response(JSON.stringify({ message: "Campo eliminado exitosamente" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      */
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
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});