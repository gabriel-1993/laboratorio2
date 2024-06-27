// controllers/taskController.js
import Usuario from '../models/usuarioModel.js';
import Rol from '../models/rolModel.js';
//hash en contraseña
import bcrypt from 'bcrypt';
//Restablecer contraseña
import crypto from 'crypto';
import nodemailer from 'nodemailer';


const mostrarFormLogin = (req, res) => {
  res.render('login');
};

const mostrarIndexAdmin = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('indexAdmin');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

const mostrarIndexProf = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('indexProf');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

const mostrarSelectRol = (req, res) => {
  if (req.session.user && req.session.user.roles.length > 1) {
    res.render('selectRol', { roles: req.session.user.roles });
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

const cerrarSesion = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
    res.clearCookie('session_cookie_name');
    res.redirect('/');
  });
};



// Función para manejar la creación de un nuevo usuario
// async function crearUsuario(req, res) {
//   const { nombre, apellido, documento, password, estado } = req.body;

//   try {
//     const nuevoUsuario = await Usuario.crear({ nombre, apellido, documento, password, estado });
//     res.status(201).json(nuevoUsuario);
//   } catch (error) {
//     console.error('Error al crear usuario:', error);
//     res.status(500).json({ mensaje: 'Error al crear usuario' });
//   }
// }


const crearUsuario = async (req, res) => {

  const { nombre, apellido, documento, password, estado, email } = req.body;
  try {
    const nuevoUsuario = await Usuario.crear({
      nombre,
      apellido,
      documento,
      password,
      estado,
      email
    });
    console.log('Usuario creado:', nuevoUsuario);
  } catch (error) {
    console.error('Error creando el usuario:', error);
  }
}


//Se utiliza dentro de LOGIN: Funcion para comparar fecha actual con Profesional.fechaCaducidad
function validarCaducidad(fechaIngresada) {
  const fechaCaducidad = new Date(fechaIngresada);
  const fechaActual = new Date();

  if (fechaActual > fechaCaducidad) {
    // Caducado
    return true;
  } else {
    // No caducado
    return false;
  }
}

//Se utiliza dentro de LOGIN: Enviar los datos de tabla profesional: cuando NO este caducado.
function validarEnvioDatosProfesional(fechaCaducidad) {
  //validar caduciad
  if (validarCaducidad(fechaCaducidad)) {
    return false;
  } else {
    return true;
  }
}


// LOGIN verifica usuario, si existe trae el pass
//Si el pass es correcto trae el o los roles del usuario

const login = async (req, res) => {

  const { documento, password } = req.body;

  const regexDocumento = /^[0-9]{6,12}$/;
  const regexPassword = /^[0-9]{4,10}$/;

  try {
    // Validación de user y pass antes de hacer la consulta a la base
    if (!documento || !password) {
      return res.status(400).json({ mensaje: 'Por favor, ingrese documento y password.' });
    };

    if (!regexDocumento.test(documento)) {
      return res.status(400).json({ mensaje: 'El documento debe tener solo números y una longitud mínima de 6 y máxima de 12.' });
    }

    if (!regexPassword.test(password)) {
      return res.status(400).json({ mensaje: 'El password debe tener solo números y una longitud mínima de 4 y máxima de 10.' });
    }


    // Buscar usuario en la base, si existe captura su pass
    const usuario = await Usuario.buscarPorDocumento(documento);

    console.log(usuario);

    if (usuario === null) {
      return res.status(401).json({ mensaje: 'El documento de usuario ingresado es incorrecto. Por favor, inténtelo de nuevo.' });
    }

    // si existe el user compara la pass ingresada
    const isMatch = await bcrypt.compare(password, usuario.password);
    console.log("222 : " + password);
    console.log("223 : " + usuario.password);
    if (!isMatch) {
      console.log("no match");
      return res.status(401).json({ mensaje: 'La contraseña ingresada es incorrecta. Por favor, inténtelo de nuevo.' });
    }

    //Si la contraseña es correcta busca los roles asignados al usuario
    const roles = await Rol.obtenerRolesUsuario(usuario.id);
    if (!roles || roles.length === 0) {
      return res.status(403).json({ mensaje: 'Usuario sin roles asignados' });
    }

    let datosProfesional;
    // Si existe rol === 'PROFESIONAL', traer los datos de la tabla profesional:
    if (roles.some(rol => rol.rol_descripcion === 'PROFESIONAL')) {
      // DATOS COMO PROFESIONAL 
      datosProfesional = await Rol.obtenerDatosProfesional(usuario.id);
    }

    // Determinar el rol principal para decidir qué renderizar
    let roleToRender = '';
    let multipleRoles = false;
    let enviarDatosProfesional;

    if (roles.length === 1) {
      roles.forEach((rol) => {
        if (rol.rol_descripcion === 'ADMINISTRADOR') {
          roleToRender = 'ADMINISTRADOR';

        } else if (rol.rol_descripcion === 'PROFESIONAL') {
          //PROFESIONAL TIENE CADUCIAD: verificar validarEnvioDatosProfesional retorna true/false
          enviarDatosProfesional = validarEnvioDatosProfesional(datosProfesional[0].caducidad);
          roleToRender = enviarDatosProfesional ? 'PROFESIONAL' : 'PROFESIONALCADUCADO';
        }
      });
    }


    if (roles.length > 1) {
      roleToRender = 'SELECCION_ROL';
      multipleRoles = true;
      const profesional = roles.find(role => role.rol_descripcion === 'PROFESIONAL');
      if (profesional) {
        enviarDatosProfesional = validarEnvioDatosProfesional(datosProfesional[0].caducidad);
        roleToRender = 'SELECCION_ROL';
      }
    }

    // Session 
    req.session.user = {
      id: usuario.id,
      documento: usuario.documento,
      roles,
      datosProfesional: enviarDatosProfesional ? datosProfesional : { profesional: 'caducado' }
    };


    // Enviar la respuesta al cliente con roleToRender(redireccion). roles>1 envia todos sino []. datosProfesional : datosProfesional a menos que este caducado(este dato le impedira iniciar sesion)
    res.json({ role: roleToRender, roles: multipleRoles ? roles : [], datosProfesional: enviarDatosProfesional ? datosProfesional : { profesional: 'caducado' } });

  } catch (error) {
    console.error('Error al verificar credenciales:', error);
    return res.status(500).json({ mensaje: 'Error al verificar credenciales' });
  }
}




// Función para cambiar el estado de un usuario
async function cambiarEstadoUsuario(req, res) {
  const { documento } = req.params;
  const { nuevo_estado } = req.body;

  try {
    const actualizado = await Usuario.cambiarEstado(documento, nuevo_estado);
    if (actualizado) {
      res.status(200).json({ mensaje: 'Estado del usuario actualizado correctamente' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ mensaje: 'Error al cambiar estado del usuario' });
  }
}

//RESTABLECER CONTRASEÑA 
const mostrarFormRestablecerPass = (req, res) => {
  res.render('formRestablecerPass');
};

const renderRestablecerPassword = (req, res) => {
  const token = req.params.token;
  res.render('modificarPass', { token });
};

// Enviar enlace de recuperación de contraseña
const enviarEnlaceRecuperacion = async (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ mensaje: 'Ingrese la dirección de correo electrónico.' });
  }

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    return res.status(400).json({ mensaje: 'Revise la dirección de correo electrónico.' });
  }

  try {
    const user = await Usuario.buscarUsuarioPorEmail(email);
    if (!user) {
      return res.status(400).json({ mensaje: 'Correo incorrecto, el correo ingresado no se encuentra registrado.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await Usuario.crearEnlaceRestablecimiento(email, token, expires);

    const resetURL = `http://${req.headers.host}/restablecer-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      to: user.email,
      from: 'passwordreset@demo.com',
      subject: 'Restablecimiento de contraseña - Usuario SISA',
      text: `Recibió este email porque solicitó restablecer la contraseña para su cuenta en SISA.\n\n
                Haga clic en el siguiente enlace, o péguelo en su navegador para completar el proceso:\n\n
                ${resetURL}\n\n
                Si no solicitó esto, ignore este correo electrónico y su contraseña no cambiará.\n`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ mensaje: 'Enlace enviado con éxito, revise su correo electrónico.' });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Función para actualizar la contraseña
const actualizarPassword = async (req, res) => {
  const { token } = req.body;
  const { password, confirmPassword } = req.body;



  if (password === '' || confirmPassword === '') {
    return res.status(400).json({ message: 'Datos obligatorios: Debes ingresar una nueva contraseña y confirmar la nueva contraseña.' });
  }

  const regexPassword = /^[0-9]{4,10}$/;
  if (!regexPassword.test(password) || !regexPassword.test(confirmPassword)) {
    return res.status(400).json({ message: 'Password incorrecto: La contraseña debe tener solo números y una longitud mínima de 4 y máxima de 10.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Error: Las contraseñas no coinciden.' });
  }


  if (password !== confirmPassword) {
    return res.status(400).send('Las contraseñas no coinciden');
  }

  try {
    const resetEntry = await Usuario.encontrarPorToken(token);
    if (!resetEntry || resetEntry.resetPasswordExpires < Date.now()) {
      return res.status(400).send('El token de restablecimiento es inválido o ha expirado');
    }

    const user = await Usuario.buscarUsuarioPorEmail(resetEntry.email);
    if (!user) {
      return res.status(400).send('Usuario no encontrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Usuario.actualizarContrasena(user.email, hashedPassword);
    await Usuario.eliminarEnlaceRestablecimiento(user.email); // Eliminar el token y la expiración

    // Enviar respuesta de éxito
    return res.status(200).json({ message: 'Contraseña modificada con éxito' });
  } catch (error) {
    res.status(500).send('Error en el servidor');
  }
};

export default { mostrarFormLogin, mostrarFormRestablecerPass, renderRestablecerPassword, enviarEnlaceRecuperacion, actualizarPassword, login, mostrarIndexAdmin, mostrarIndexProf, mostrarSelectRol, cerrarSesion, crearUsuario };
