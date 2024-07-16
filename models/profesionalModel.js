import pool from '../database.js';
import sequelize from '../sequalize.js';

class Profesional {
    constructor({ usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps }) {
        this.usuario_id = usuario_id;
        this.profesion = profesion;
        this.especialidad = especialidad;
        this.matricula = matricula;
        this.domicilio = domicilio;
        this.caducidad = caducidad;
        this.id_refeps = id_refeps;
    }

    static async deshabilitar(usuario_id, transaction) {
        const queryProfesional = `UPDATE profesional SET estado = 0 WHERE usuario_id = ?;`;

        try {
            const result = await sequelize.query(queryProfesional, {
                replacements: [usuario_id],
                transaction
            });
            return result;
        } catch (error) {
            console.error('Error al deshabilitar profesional:', error);
            throw error;
        }
    }

    static async habilitar(usuario_id, transaction) {
        const queryProfesional = `UPDATE profesional SET estado = 1 WHERE usuario_id = ?;`;

        try {
            const result = await sequelize.query(queryProfesional, {
                replacements: [usuario_id],
                transaction
            });
            return result;
        } catch (error) {
            console.error('Error al habilitar profesional:', error);
            throw error;
        }
    }

    // Modificar profesional 
    static async modificar({ usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps }, transaction) {
        const queryProfesional = `UPDATE profesional SET profesion = ?, especialidad = ?, matricula = ?, domicilio = ?, caducidad = ?, id_refeps = ? WHERE usuario_id = ?;`;

        try {
            const result = await sequelize.query(queryProfesional, {
                replacements: [profesion, especialidad, matricula, domicilio, caducidad, id_refeps, usuario_id], // Orden corregido
                transaction
            });
            return result;
        } catch (error) {
            console.error('Error al modificar profesional:', error);
            throw error;
        }
    }


    // Método para obtener los datos profesionales por id de usuario
    static async obtenerDatosProfesional(usuario_id) {
        const query = `SELECT *
                       FROM profesional
                       WHERE usuario_id = ?`;
        const [datosProfesional] = await pool.query(query, [usuario_id]);
        return datosProfesional;
    }

    static async validarMatricula(matricula, { transaction }) {
        try {
          const query = `SELECT * FROM profesional WHERE matricula = ?`;
          const [datosProfesional] = await sequelize.query(query, {
            replacements: [matricula],
            transaction
          });
          return datosProfesional;
        } catch (error) {
          console.error('Error al validar matrícula:', error);
          throw error;
        }
      }
    
      static async validarIdRefeps(id_refeps, { transaction }) {
        try {
          const query = `SELECT * FROM profesional WHERE id_refeps = ?`;
          const [datosProfesional] = await sequelize.query(query, {
            replacements: [id_refeps],
            transaction
          });
          return datosProfesional;
        } catch (error) {
          console.error('Error al validar ID Refeps:', error);
          throw error;
        }
      }
    
      static async crear(usuario_id, profesional, transaction) {
        const query = `INSERT INTO profesional (usuario_id, profesion, especialidad, matricula, domicilio, id_refeps, caducidad) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await sequelize.query(query, {
          replacements: [usuario_id, profesional.profesion, profesional.especialidad, profesional.matricula, profesional.domicilio, profesional.id_refeps, profesional.caducidad],
          transaction
        });
        return result;
      }
}


export default Profesional;