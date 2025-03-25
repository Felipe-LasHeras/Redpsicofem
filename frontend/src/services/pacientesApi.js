// services/pacientesApi.js

const API_URL = process.env.REACT_APP_API_URL;

export const pacientesApi = {
  // Obtener todos los pacientes
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/pacientes`);
      if (!response.ok) {
        throw new Error("Error al obtener pacientes");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener el paciente");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  // Crear nuevo paciente
  create: async (pacienteData) => {
    try {
      const formattedData = {
        ...pacienteData,
        edad: parseInt(pacienteData.edad),
        horarios: Array.isArray(pacienteData.horarios)
          ? pacienteData.horarios.join(", ")
          : pacienteData.horarios,
        psicologo_varon: pacienteData.psicologo_varon === "Si",
        practicante: pacienteData.practicante === "Si",
      };

      const response = await fetch(`${API_URL}/pacientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear paciente");
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  // Actualizar paciente
  update: async (id, pacienteData) => {
    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pacienteData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar paciente");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  // Eliminar paciente
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar paciente");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};
