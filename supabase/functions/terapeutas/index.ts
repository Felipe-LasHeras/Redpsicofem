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

  // Manejo de CORS
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
    
    // Datos mock para pruebas
    const mockTerapeutas = [
      {
        id: 1,
        nombre: "Ana", 
        apellido: "Psicóloga",
        tipo_terapeuta: true,
        tipo_terapeuta_nombre: "Redpsicofem",
        especialidad: "Terapia Cognitivo-Conductual",
        region: "Metropolitana",
        comuna: "Santiago",
        lugar_atencion: "Centro Médico ABC",
        valor_consulta: 30000,
        rut: "11.111.111-1",
        edad_atencion: "Adultos",
        tipo_atencion: "Online",
        atiende_adultos: true,
        atiende_online: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        nombre: "Carlos", 
        apellido: "Terapeuta",
        tipo_terapeuta: false,
        tipo_terapeuta_nombre: "Red derivacion",
        especialidad: "Psicología Clínica",
        region: "Valparaíso",
        comuna: "Viña del Mar",
        lugar_atencion: "Consulta privada",
        valor_consulta: 25000,
        rut: "22.222.222-2",
        edad_atencion: "Adolescentes, Adultos",
        tipo_atencion: "Presencial",
        atiende_adolescentes: true,
        atiende_adultos: true,
        atiende_presencial: true,
        created_at: new Date().toISOString()
      }
    ];
  
    // GET - Obtener todos los terapeutas, por ID o por tipo
    if (req.method === "GET") {
      // Verifica si estamos buscando por tipo
      if (path.length > 1 && path[1] === "tipo" && path.length > 2) {
        const tipo = path[2];
        console.log(`🔍 Buscando terapeutas de tipo: ${tipo}`);
        
        // Filtramos los datos mock
        const filteredMock = mockTerapeutas.filter(t => 
          t.tipo_terapeuta_nombre?.toLowerCase() === tipo.toLowerCase()
        );
        
        return new Response(JSON.stringify(filteredMock), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        
       /* Código real para cuando el CORS funcione
        const { data, error } = await supabaseAdmin
          .from("psicologos")
          .select("*")
          .eq("tipo_terapeuta_nombre", tipo)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        */
      }
      
      // Obtener un terapeuta por ID
      if (id && path[1] !== "tipo") {
        console.log(`🔍 Buscando terapeuta con ID: ${id}`);
        // Para pruebas, retornamos el primer terapeuta mock
        const mockTerapeuta = mockTerapeutas.find(t => t.id === parseInt(id)) || mockTerapeutas[0];
        
        return new Response(JSON.stringify(mockTerapeuta), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        
        /* Código real para cuando el CORS funcione
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
        */
      } 
      
      // Obtener todos los terapeutas
      if (!id || path[1] === "todos") {
        console.log('📋 Listando todos los terapeutas');
        
        return new Response(JSON.stringify(mockTerapeutas), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        
        /* Código real para cuando el CORS funcione
        const { data, error } = await supabaseAdmin
          .from("psicologos")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
        */
      }
    }
    
    // POST - Crear un nuevo terapeuta
    if (req.method === "POST") {
      const rawBody = await req.text();
      console.log('📦 Datos recibidos:', rawBody);
      
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
      
      // Simulación para pruebas
      const mockResponse = {
        ...terapeutaData,
        id: 999,
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Terapeuta creado (simulación)');
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
      
      /* Código real para cuando el CORS funcione
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
      
      const { data, error } = await supabaseAdmin
        .from("psicologos")
        .insert([terapeutaData])
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      });
      */
    }
    
    // PUT - Actualizar un terapeuta existente
    if (req.method === "PUT" && id) {
      console.log(`🔄 Actualizando terapeuta con ID: ${id}`);
      const terapeutaData: TerapeutaData = await req.json();
      
      // Simulación para pruebas
      const mockResponse = {
        ...terapeutaData,
        id: parseInt(id),
        updated_at: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      /* Código real para cuando el CORS funcione
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
      */
    }
    
    // PATCH - Actualizar solo los horarios de un terapeuta
    if (req.method === "PATCH" && id && path.length > 2 && path[2] === "horarios") {
      console.log(`🕒 Actualizando horarios del terapeuta con ID: ${id}`);
      const horariosData: HorariosData = await req.json();
      
      // Simulación para pruebas
      const mockResponse = {
        id: parseInt(id),
        horarios_online: horariosData.horarios_online,
        horarios_presencial: horariosData.horarios_presencial,
        updated_at: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      /* Código real para cuando el CORS funcione
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
      */
    }
    
    // DELETE - Eliminar un terapeuta
    if (req.method === "DELETE" && id) {
      console.log(`🗑️ Eliminando terapeuta con ID: ${id}`);
      
      // Simulación para pruebas
      return new Response(JSON.stringify({ 
        message: "Terapeuta eliminado exitosamente",
        id: parseInt(id)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
      
      /* Código real para cuando el CORS funcione
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