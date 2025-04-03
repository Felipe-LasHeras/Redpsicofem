import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders, handleCors } from "../_shared/cors.js";

serve(async (req) => {
  // Manejo de CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Crear cliente Supabase
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } }
  );

  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  const id = path.length > 1 ? path[1] : null;
  
  try {
    // GET - Obtener todos los campos o campos activos
    if (req.method === "GET") {
      if (path.length > 1 && path[1] === "activos") {
        // Obtener solo campos activos
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
      const campoData = await req.json();
      
      const { data, error } = await supabase
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
      const campoData = await req.json();
      
      const { data, error } = await supabase
        .from("configuracion_campos")
        .update(campoData)
        .eq("id", id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // DELETE - Eliminar un campo
    if (req.method === "DELETE" && id) {
      const { data, error } = await supabase
        .from("configuracion_campos")
        .delete()
        .eq("id", id)
        .select();
        
      if (error) throw error;
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
    
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
