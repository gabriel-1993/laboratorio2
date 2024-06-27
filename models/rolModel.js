import pool from '../database.js';

class Rol {
    constructor({ rol_id, rol_descripcion }) {
        this.rol_id = rol_id;
        this.rol_descripcion = rol_descripcion;
    }

    //Consultar el rol o los roles de un usuario
    static async obtenerRolesUsuario(id) {
        const query = ` SELECT r.id, r.rol_descripcion
                    FROM usuario_rol ur
                    JOIN rol r ON ur.rol_id = r.id
                    WHERE ur.usuario_id = ?
                        `;
        const [profesionalDatos] = await pool.query(query, id);
        return profesionalDatos;
    }

    // Rol profesional tiene su propia trabla 
    static async obtenerDatosProfesional(id) {
        const query = `SELECT *
                        FROM profesional
                        WHERE usuario_id = ?;
                        `;
        const [datosProfesional] = await pool.query(query, id);
        return datosProfesional;
    }


    // Método para crear un nuevo rol
    static async crear({ rol_descripcion }) {
        const query = `INSERT INTO rol (rol_descripcion) VALUES (?)`;
        const [result] = await pool.query(query, [rol_descripcion]);
        return new Rol({ id: result.insertId, rol_descripcion });
    }

    // Método para obtener todos los roles
    static async obtenerTodos() {
        const query = `SELECT * FROM rol`;
        const [rows] = await pool.query(query);
        return rows.map(row => new Rol(row));
    }

    // Método para obtener un rol por su ID
    static async obtenerPorId(id) {
        const query = `SELECT * FROM rol WHERE id = ?`;
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return new Rol(rows[0]);
        }
        return null;
    }

    // Método para actualizar un rol por su ID
    static async actualizar({ id, rol_descripcion }) {
        const query = `UPDATE rol SET rol_descripcion = ? WHERE id = ?`;
        await pool.query(query, [rol_descripcion, id]);
        return new Rol({ id, rol_descripcion });
    }

    // Método para eliminar un rol por su ID
    static async eliminar(id) {
        const query = `DELETE FROM rol WHERE id = ?`;
        await pool.query(query, [id]);
        return true;
    }
}

export default Rol;
