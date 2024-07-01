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
        console.log('Query:', query);
        console.log('Replacements:', [usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps]);

        await sequelize.query(query, {
            replacements: [usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps],
            transaction
        });
        return { usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps };
    }

    // Método para obtener los datos profesionales por id de usuario
    static async obtenerDatosProfesional(id) {
        const query = `SELECT *
                       FROM profesional
                       WHERE usuario_id = ?`;
        const [datosProfesional] = await pool.query(query, [id]);
        return datosProfesional;
    }}

export default Profesional;