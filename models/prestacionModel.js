import sequelize from '../sequalize.js'; // Asegúrate de que la ruta sea correcta
import { Transaction } from 'sequelize';

class Prestacion {
  constructor({ id, descripcion, estado, lado_id }) {
    this.id = id;
    this.descripcion = descripcion;
    this.estado = estado;
    this.lado = lado_id;
  }

  // Buscar todas las prestaciones
  static async buscarPrestaciones(transaction = null) {
    try {
      const prestaciones = await sequelize.query(
        `SELECT 
            id,
            descripcion,
            estado
         FROM prestacion`,
        {
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!prestaciones || prestaciones.length === 0) {
        return null; // No se encontraron items
      }

      return prestaciones;
    } catch (error) {
      console.error('Error al buscar todas las prestaciones disponibles:', error);
      throw error;
    }
  }

  // Buscar todos los lados
  static async buscarLados(transaction = null) {
    try {
      const lados = await sequelize.query(
        `SELECT 
            id,
            descripcion
        FROM lado`,
        {
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!lados || lados.length === 0) {
        return null; // No se encontraron items
      }

      return lados;
    } catch (error) {
      console.error('Error al buscar todos los lados:', error);
      throw error;
    }
  }

  //Agregar Prestacion
  static async agregarPrestacion(descripcion, estado, transaction = null) {
    const query = `INSERT INTO prestacion (descripcion, estado) VALUES (?, ?)`;
    await sequelize.query(query, {
      replacements: [descripcion, estado],
      type: sequelize.QueryTypes.INSERT,
      transaction
    });
  }

  //Agregar Lado
  static async agregarLado(descripcion, transaction = null) {
    const query = `INSERT INTO lado (descripcion) VALUES ( ?)`;
    await sequelize.query(query, {
      replacements: [descripcion],
      type: sequelize.QueryTypes.INSERT,
      transaction
    });
  }





















}


export default Prestacion;