// models/usuarioModel.js
import pool from '../database.js';
import sequelize from '../sequalize.js';
//Hash password
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
import Profesional from './profesionalModel.js';


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


  static async modificarUsuario(usuarioValidado, transaction) {
    const queryUsuario = `UPDATE usuario SET nombre = ?, apellido = ?, documento = ?, estado = ?, email = ? WHERE id = ?;`;

    // Desestructurar el objeto usuario para obtener los valores
    const { id, nombre, apellido, documento, estado, email } = usuarioValidado;

    try {
      console.log('Query:', queryUsuario);
      console.log('Replacements:', [nombre, apellido, documento, estado, email, id]);

      const result = await sequelize.query(queryUsuario, {
        replacements: [nombre, apellido, documento, estado, email, id],
        transaction
      });
      console.log('Usuario modificado con éxito');
      return result;
    } catch (error) {
      console.error('Error al modificar el usuario:', error);
      throw error;
    }
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

  //buscar usuario por email
  static async buscarUsuarioPorEmail(email) {
    const query = `SELECT * FROM usuario WHERE email = ?`;
    const [rows] = await pool.query(query, [email]);
    if (rows.length === 0) {
      return null;
    }
    const { id, nombre, apellido, documento, password, estado } = rows[0];
    return new Usuario({ id, nombre, apellido, documento, password, estado, email });
  }

  //  buscar usuario por ID
  static async buscarUsuarioPorId(usuario_id) {
    const query = `SELECT * FROM usuario WHERE id = ?`;
    const [rows] = await pool.query(query, [usuario_id]);
    if (rows.length === 0) {
      return null;
    }
    const { id, nombre, apellido, documento, password, estado, email } = rows[0];
    return new Usuario({ id, nombre, apellido, documento, password, estado, email });
  }

  // buscar todos los usuarios con sus roles(datos profesional para rol profesional)
  static async buscarUsuariosConRolesYProfesionales() {
    const query = `
      SELECT u.id, u.nombre, u.apellido, u.documento, u.estado, u.email, r.id AS rol_id, r.rol_descripcion
      FROM usuario u
      LEFT JOIN usuario_rol ur ON u.id = ur.usuario_id
      LEFT JOIN rol r ON ur.rol_id = r.id
    `;
    const [rows] = await pool.query(query);

    if (rows.length === 0) {
      return null;
    }

    const usuariosMap = new Map();

    for (const row of rows) {
      const { id, nombre, apellido, documento, estado, email, rol_id, rol_descripcion } = row;
      if (!usuariosMap.has(id)) {
        usuariosMap.set(id, {
          id, nombre, apellido, documento, estado, email, roles: [], datosProfesional: null
        });
      }
      if (rol_id) {
        usuariosMap.get(id).roles.push({ rol_id, rol_descripcion });
      }
    }

    for (const usuario of usuariosMap.values()) {
      const profesionalRol = usuario.roles.find(rol => rol.rol_descripcion === 'PROFESIONAL');
      if (profesionalRol) {
        usuario.datosProfesional = await Profesional.obtenerDatosProfesional(usuario.id);
      }
    }

    return Array.from(usuariosMap.values());
  }



  static async buscarRolesUsuario(usuario_id) {
    const query = `SELECT ur.rol_id, r.rol_descripcion
    FROM usuario_rol ur
    JOIN rol r ON ur.rol_id = r.id
    WHERE ur.usuario_id = ?`;
    const [rows] = await pool.query(query, [usuario_id]);
    if (rows.length === 0) {
      return null;
    }
    return rows;
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

  //actualizar la contraseña del usuario
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