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
  // Manejo de CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // URL y parámetros de la API de Supabase
  const apiUrl = Deno.env.get("APP_API_URL") ?? "";
  const serviceRoleKey = Deno.env.get("APP_SERVICE_ROLE_KEY") ?? "";

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
        // Obtener solo campos activos
        const { data, error } = await supabaseAdmin
          .from("configuracion_campos")
          .select("*")
          .eq("activo", true)
          .order("orden", { ascending: true });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } else {
        // Obtener todos los campos
        const { data, error } = await supabaseAdmin
          .from("configuracion_campos")
          .select("*")
          .order("orden", { ascending: true });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
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
    }
    
    // PUT - Actualizar un campo existente
    if (req.method === "PUT" && id) {
      const campoData: CampoData = await req.json();
      
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
    }
    
    // DELETE - Eliminar un campo
    if (req.method === "DELETE" && id) {
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
    }
    
    // Si no coincide con ninguna ruta
    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404
    });
    
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});