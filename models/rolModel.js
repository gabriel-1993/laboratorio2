import pool from '../database.js';
import sequelize from '../sequalize.js';

class Rol {
    constructor({ id, rol_descripcion }) {
        this.id = id;
        this.rol_descripcion = rol_descripcion;
    }

    // Consultar el rol o los roles de un usuario
    static async obtenerRolesUsuario(id) {
        const query = `SELECT r.id, r.rol_descripcion
                       FROM usuario_rol ur
                       JOIN rol r ON ur.rol_id = r.id
                       WHERE ur.usuario_id = ?`;
        const [profesionalDatos] = await pool.query(query, [id]);
        return profesionalDatos;
    }

    // Asignar Rol a un usuario. Tabla Usuario relación N a N con Rol, esta asignación se guarda en la tabla de relación usuario_rol
    // Método para asignar un rol a un usuario con transacción
    static async asignarRolUsuario(usuario_id, rol_id, transaction) {
        const query = `INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)`;
        if (!usuario_id || !rol_id) {
            throw new Error("usuario_id o rol_id no definidos");
        }
        console.log('usuario_id:', usuario_id);
        console.log('rol_id:', rol_id);
        try {
            await sequelize.query(query, {
                replacements: [usuario_id, rol_id],
                transaction
            });
            return { usuario_id, rol_id };
        } catch (error) {
            console.error('Error en asignarRolUsuario:', error);
            console.log('Detalles del error:', {
                usuario_id,
                rol_id,
                errorMessage: error.message,
                errorStack: error.stack
            });
            throw error;
        }
    }

    static async desasignarRolUsuario(usuario_id, rol_id, transaction) {
        const query = `DELETE FROM usuario_rol WHERE usuario_id = ? AND rol_id = ?`;
        try {
            await sequelize.query(query, {
                replacements: [usuario_id, rol_id],
                transaction
            });
            return { usuario_id, rol_id };
        } catch (error) {
            console.error('Error en desasignarRolUsuario:', error);
            throw error;
        }
    }


    // Método para crear un nuevo rol su id es autoincrement en la base, solo enviar descripción
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
