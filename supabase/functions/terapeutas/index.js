import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders, handleCors } from '../_shared/cors.js';

serve(async (req) => {
  // Manejo de CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Crear cliente Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);
  const id = path.length > 1 ? path[1] : null;
  
  try {
    // GET - Obtener todos los terapeutas, por ID o por tipo
    if (req.method === 'GET') {
      // Verifica si estamos buscando por tipo
      if (path.length > 1 && path[1] === 'tipo' && path.length > 2) {
        const tipo = path[2];
        
        const { data, error } = await supabase
          .from('psicologos')
          .select('*')
          .eq('tipo_terapeuta_nombre', tipo)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
      
      // Obtener un terapeuta por ID
      if (id && path[1] !== 'tipo') {
        const { data, error } = await supabase
          .from('psicologos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } 
      
      // Obtener todos los terapeutas
      if (!id || path[1] === 'todos') {
        const { data, error } = await supabase
          .from('psicologos')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }
    
    // POST - Crear un nuevo terapeuta
    if (req.method === 'POST') {
      const terapeutaData = await req.json();
      
      const { data, error } = await supabase
        .from('psicologos')
        .insert([terapeutaData])
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      });
    }
    
    // PUT - Actualizar un terapeuta existente
    if (req.method === 'PUT' && id) {
      const terapeutaData = await req.json();
      
      const { data, error } = await supabase
        .from('psicologos')
        .update(terapeutaData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // PATCH - Actualizar solo los horarios de un terapeuta
    if (req.method === 'PATCH' && id && path.length > 2 && path[2] === 'horarios') {
      const horariosData = await req.json();
      
      const { data, error } = await supabase
        .from('psicologos')
        .update(horariosData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // DELETE - Eliminar un terapeuta
    if (req.method === 'DELETE' && id) {
      const { data, error } = await supabase
        .from('psicologos')
        .delete()
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return new Response(JSON.stringify({ message: 'Terapeuta eliminado exitosamente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // Si no coincide con ninguna ruta
    return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});