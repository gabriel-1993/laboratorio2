// models/usuarioModel.js
import pool from '../database.js';
//Hash password
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;


class Usuario {
    constructor({ id, nombre, apellido, documento, password, estado, email }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.documento = documento;
        this.password = password;
        this.estado = estado;
        this.email = email;
    }

    static async crear({ nombre, apellido, documento, password, estado, email }) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const query = `INSERT INTO usuario (nombre, apellido, documento, password, estado, email) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(query, [nombre, apellido, documento, hashedPassword, estado, email]);
        return new Usuario({ id: result.insertId, nombre, apellido, documento, password: hashedPassword, estado, email });
    }

    //Verificar si existe user antes de validar pass, si existe traer los datos...
    static async buscarPorDocumento(documento) {
        const query = `SELECT * FROM usuario WHERE documento = ?`;
        const [rows] = await pool.query(query, [documento]);
        if (rows.length === 0) {
            return null;
        }
        const { id, nombre, apellido, password, estado, email } = rows[0];
        return new Usuario({ id, nombre, apellido, documento, password, estado, email });
    }

    //Validar pass
    static async verificarCredenciales(documento, password) {
        const queryUsuario = `SELECT * FROM usuario WHERE documento = ? AND password = ?`;
        const [rowsUsuario] = await pool.query(queryUsuario, [documento, password]);

        if (rowsUsuario.length > 0) {
            let usuarioData = rowsUsuario[0];
            const usuario = new Usuario(usuarioData);
            return { usuario };
        }
        return null;
    }


    //RESTABLECER CONTRASEÑA : verificar email(unico) si existe***********************************************************************************
   
  // Función para insertar un nuevo registro de restablecimiento de contraseña
  static async crearEnlaceRestablecimiento(email, token, expires) {
    const [result] = await pool.query(
      'INSERT INTO password_resets (email, resetPasswordToken, resetPasswordExpires) VALUES (?, ?, ?)',
      [email, token, expires]
    );
    return result;
  }

  // Función para encontrar un usuario por su token de restablecimiento
  static async encontrarPorToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE resetPasswordToken = ?',
      [token]
    );
    return rows[0];
  }

  // Función para eliminar el token de restablecimiento de contraseña después de usarlo
  static async eliminarEnlaceRestablecimiento(email) {
    const [result] = await pool.query(
      'DELETE FROM password_resets WHERE email = ?',
      [email]
    );
    return result;
  }

  // Ejemplo de función existente para buscar usuario por email
  static async buscarUsuarioPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0];
  }

  // Ejemplo de función existente para actualizar la contraseña del usuario
  static async actualizarContrasena(email, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE usuario SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    return result;
  }

    //Fin class Usuario
}



export default Usuario;