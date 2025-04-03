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
    // GET - Obtener todos los pacientes o un paciente específico
    if (req.method === "GET") {
      if (id) {
        // Obtener un paciente por ID
        const { data, error } = await supabase
          .from("perfiles_pacientes")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      } else {
        // Obtener todos los pacientes
        const { data, error } = await supabase
          .from("perfiles_pacientes")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
    }
    
    // POST - Crear un nuevo paciente
    if (req.method === "POST") {
      const pacienteData: PacienteData = await req.json();
      
      const { data, error } = await supabase
        .from("perfiles_pacientes")
        .insert([pacienteData])
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
    }
    
    // PUT - Actualizar un paciente existente
    if (req.method === "PUT" && id) {
      const pacienteData: PacienteData = await req.json();
      
      const { data, error } = await supabase
        .from("perfiles_pacientes")
        .update(pacienteData)
        .eq("id", id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // DELETE - Eliminar un paciente
    if (req.method === "DELETE" && id) {
      const { data, error } = await supabase
        .from("perfiles_pacientes")
        .delete()
        .eq("id", id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify({ message: "Paciente eliminado exitosamente" }), {
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