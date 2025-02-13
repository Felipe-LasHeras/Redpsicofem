import { auth, db, storage } from '../config/firebase';

export const useFirebase = () => {
  // Aquí puedes agregar funciones específicas para interactuar con Firebase
  return {
    auth,
    db,
    storage
  };
};