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
  // Manejo de CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Crear cliente Supabase
  const supabase = createClient(
    Deno.env.get("APP_API_URL") ?? "",
    Deno.env.get("APP_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } }
  );

  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  const id = path.length > 1 ? path[1] : null;
  
  try {
    // GET - Obtener todos los terapeutas, por ID o por tipo
    if (req.method === "GET") {
      // Verifica si estamos buscando por tipo
      if (path.length > 1 && path[1] === "tipo" && path.length > 2) {
        const tipo = path[2];
        
        const { data, error } = await supabase
          .from("psicologos")
          .select("*")
          .eq("tipo_terapeuta_nombre", tipo)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
      
      // Obtener un terapeuta por ID
      if (id && path[1] !== "tipo") {
        const { data, error } = await supabase
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
        const { data, error } = await supabase
          .from("psicologos")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
    }
    
    // POST - Crear un nuevo terapeuta
    if (req.method === "POST") {
      const terapeutaData: TerapeutaData = await req.json();
      
      // Validación básica
      if (!terapeutaData.nombre || !terapeutaData.apellido || !terapeutaData.rut) {
        return new Response(JSON.stringify({ error: "Nombre, apellido y RUT son requeridos" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        });
      }
      
      // Verificar si el RUT ya existe
      const { data: rutCheck, error: rutError } = await supabase
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
      
      const { data, error } = await supabase
        .from("psicologos")
        .insert([terapeutaData])
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
    }
    
    // PUT - Actualizar un terapeuta existente
    if (req.method === "PUT" && id) {
      const terapeutaData: TerapeutaData = await req.json();
      
      // Si está actualizando el RUT, verificar que no exista otro con el mismo
      if (terapeutaData.rut) {
        const { data: rutCheck, error: rutError } = await supabase
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
      
      const { data, error } = await supabase
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
    }
    
    // PATCH - Actualizar solo los horarios de un terapeuta
    if (req.method === "PATCH" && id && path.length > 2 && path[2] === "horarios") {
      const horariosData: HorariosData = await req.json();
      
      // Verificar que el terapeuta existe
      const { data: terapeutaExiste, error: checkError } = await supabase
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
      
      const { data, error } = await supabase
        .from("psicologos")
        .update(horariosData)
        .eq("id", id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // DELETE - Eliminar un terapeuta
    if (req.method === "DELETE" && id) {
      const { data, error } = await supabase
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