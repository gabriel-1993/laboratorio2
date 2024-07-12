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

    static async crear({ usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps }, transaction) {
        const query = `INSERT INTO profesional (usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        // Imprimir los valores para verificar
        // console.log('Query:', query);
        // console.log('Replacements:', [usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps]);

        await sequelize.query(query, {
            replacements: [usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps],
            transaction
        });
        return { usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps };
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

    // Validar si la matricula esta ocupado( es dato unico en la base de datos)
    static async validarMatricula(matricula) {
        const query = `SELECT *
                       FROM profesional
                       WHERE matricula = ?`;
        const [datosProfesional] = await pool.query(query, [matricula]);
        return datosProfesional;
    }

    // Validar si la id_refeps esta ocupado( es dato unico en la base de datos)
    static async validarIdRefeps(id_refeps) {
        const query = `SELECT *
                       FROM profesional
                       WHERE id_refeps = ?`;
        const [datosProfesional] = await pool.query(query, [id_refeps]);
        return datosProfesional;
    }

}


export default Profesional;