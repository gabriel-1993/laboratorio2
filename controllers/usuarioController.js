// controllers/taskController.js
import Usuario from '../models/usuarioModel.js';
import Rol from '../models/rolModel.js';
import Profesional from '../models/profesionalModel.js';
//hash en contraseña
import bcrypt from 'bcrypt';
//Restablecer contraseña
import crypto from 'crypto';
import nodemailer from 'nodemailer';
//transacciones para funciones que impacten en mas de una tabla
import sequelize from '../sequalize.js';
import { log } from 'console';


const mostrarFormLogin = (req, res) => {
  res.render('login');
};

const mostrarIndexAdmin = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('indexAdmin');
  } else {
    res.render('accesoDenegado');
    //    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

const mostrarIndexProf = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('indexProf');
  } else {
    res.render('accesoDenegado');
    //res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

const mostrarSelectRol = (req, res) => {
  if (req.session.user && req.session.user.roles.length > 1) {
    res.render('selectRol', { roles: req.session.user.roles });
  } else {
    res.render('accesoDenegado');
    //res.status(403).json({ mensaje: 'Acceso denegado' });
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



// CRUD USUARIO *****************************************************************************************************************

const mostrarFormCrearUsuario = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formCrearUsuario');
  } else {
    res.render('accesoDenegado');
    //    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};


// validaciones en servidor OK
// Verifica que documento e email no esten registrados en la base, si no existen crea el usuario y trae su ID
//Con el ID asigna rol o roles, verifica si en roles tiene asignado profesional: agrega los datos en la tabla profesional.
//De esta manera evito usuarios mal cargados en la base, ya que deben tener minimo 1 rol y si es profesional , los datos de profesional son todos obligatorios.

const crearUsuarioCompleto = async (req, res) => {
  const { usuario, roles, profesional } = req.body;

  // Validaciones en el servidor:
  const nombreApellidoRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{4,54}$/;
  const documentoRegex = /^\d{6,12}$/;
  const passwordRegex = /^\d{4,10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validaciones de Profesional
  const profesionRegex = /^[a-zA-ZñÑ\s,.´¨]{6,99}$/;
  const especialidadRegex = /^[a-zA-ZñÑ\s,.´¨]{6,99}$/;
  const matriculaRegex = /^M\d{3,6}$/;
  const domicilioRegex = /^[a-zA-ZñÑ\s0-9´¨().,]{20,149}$/;

  let msjs = [];

  if (!nombreApellidoRegex.test(usuario.nombre)) {
    msjs.push('Nombre debe tener entre 4 y 54 caracteres. Puede contener letras, espacios y caracteres especiales como ´ y ¨.');
  }

  if (!nombreApellidoRegex.test(usuario.apellido)) {
    msjs.push('Apellido debe tener entre 4 y 54 caracteres. Puede contener letras, espacios y caracteres especiales como ´ y ¨.');
  }

  if (!documentoRegex.test(usuario.documento)) {
    msjs.push('El documento debe tener entre 6 y 12 números y no puede estar vacío.');
  }

  if (!emailRegex.test(usuario.email)) {
    msjs.push('El email debe ser un correo electrónico válido y no puede estar vacío.');
  }

  if (!passwordRegex.test(usuario.password)) {
    msjs.push('La contraseña debe tener entre 4 y 10 números y no puede estar vacía.');
  }

  if (!roles || !roles.length) {
    msjs.push('Rol obligatorio, debe tener mínimo un rol o varios.');
  }

  if (msjs.length > 0) {
    return res.status(400).json({ error: 'validacion_fallida', message: msjs });
  }


  const transaction = await sequelize.transaction();


  // Verificar si el rol 'PROFESIONAL' está presente y validar matricula y id_refeps
  const profesionalRole = roles.find(role => role.rol_descripcion === 'PROFESIONAL');
  if (profesionalRole) {
    const matriculaExistente = await Profesional.validarMatricula(profesional.matricula, { transaction });
    if (matriculaExistente.length > 0) {
      return res.status(400).json({ error: 'matricula_duplicada', message: 'La matrícula ingresada ya está registrada.' });
    }

    const idRefepsExistente = await Profesional.validarIdRefeps(profesional.id_refeps, { transaction });
    if (idRefepsExistente.length > 0) {
      return res.status(400).json({ error: 'id_refeps_duplicado', message: 'El ID REFEPS ingresado ya está registrado.' });
    }

    // Validaciones de Profesional
    if (!profesionRegex.test(profesional.profesion)) {
      msjs.push('Profesion incorrecta. Debe contener min 6, max 99 caracteres. (Simbolos permitidos: , . ´ ¨ ñ).');
    }

    if (!especialidadRegex.test(profesional.especialidad)) {
      msjs.push('Especialidad incorrecta. Debe contener min 6, max 99 caracteres. (Simbolos permitidos: , . ´ ¨ ñ).');
    }

    if (!matriculaRegex.test(profesional.matricula)) {
      msjs.push('Matricula incorrecta. Debe contener min 4, max 10 caracteres. (Ejemplo: M123, M3423).');
    }

    if (!domicilioRegex.test(profesional.domicilio)) {
      msjs.push('Domicilio incorrecto. Debe contener min 20, max 149 caracteres. (Simbolos permitidos: ´ ¨ () . , ñ ).');
    }

    if (!profesional.id_refeps || isNaN(profesional.id_refeps) || profesional.id_refeps.length < 4 || profesional.id_refeps.length > 11) {
      msjs.push('ID-REFEPS incorrecto. Solo permite números, debe contener min 4, max 11 números.');
    }

    if (!profesional.caducidad) {
      msjs.push('Caducidad incorrecta. Debe ingresar una fecha.');
    } else {
      let currentDate = new Date();
      let selectedDate = new Date(profesional.caducidad);

      if (selectedDate <= currentDate) {
        msjs.push("Caducidad incorrecta, debe ser una fecha futura.");
      }
    }

    if (msjs.length > 0) {
      return res.status(400).json({ error: 'validacion_fallida', message: msjs });
    }
  }


  try {
    // Validar que no exista el documento en usuario
    const usuarioExistentePorDocumento = await Usuario.buscarPorDocumento(usuario.documento);
    if (usuarioExistentePorDocumento) {
      await transaction.rollback();
      return res.status(400).json({ error: 'documento_duplicado', message: 'El documento ingresado ya está registrado.' });
    }

    // Validar que no exista el email en usuario
    const usuarioExistentePorEmail = await Usuario.buscarUsuarioPorEmail(usuario.email);
    if (usuarioExistentePorEmail) {
      await transaction.rollback();
      return res.status(400).json({ error: 'email_duplicado', message: 'El correo electrónico ingresado ya está registrado.' });
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.crear(usuario, { transaction });
    console.log(nuevoUsuario);
    // Asignar los roles
    for (const role of roles) {
      try {
        const rol_id = parseInt(role.id, 10);
        await Rol.asignarRolUsuario(nuevoUsuario.id, rol_id, transaction);
        // await Rol.asignarRolUsuario(nuevoUsuario.id, parseInt(role.id, 10), { transaction });
      } catch (error) {
        console.log('Error al asignar rol:', {
          nuevoUsuarioId: nuevoUsuario.id,
          roleId: parseInt(role.id, 10),
          errorMessage: error.message,
          errorStack: error.stack
        });
        await transaction.rollback();
        return res.status(500).json({ error: 'Error al asignar rol', details: error.message });
      }
    }

    // Asignar el profesional si está el rol 'PROFESIONAL'
    if (profesionalRole) {
      await Profesional.crear(nuevoUsuario.id, profesional, transaction);
    }

    await transaction.commit();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    await transaction.rollback();
    console.log('Error al crear usuario completo:', {
      usuario,
      roles,
      profesional,
      errorMessage: error.message,
      errorStack: error.stack
    });
    res.status(500).json({ error: 'Error al crear el usuario y asignar rol/profesional', details: error.message });
  }

};


// MODIFICAR USUARIO
const mostrarFormModificarUsuario = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formModificarUsuario');
  } else {
    res.render('accesoDenegado');
    //    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

// validaciones (expresiones regulares) de usuario en el servidor
const validarUsuarioYRol = (usuario, rolesAsignados) => {
  let mensajes = [];

  const nombreApellidoRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{4,54}$/;
  const documentoRegex = /^\d{6,12}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nombreApellidoRegex.test(usuario.nombre)) {
    mensajes.push('Nombre debe tener entre 4 y 54 caracteres. Puede contener letras, espacios y caracteres especiales como ´ y ¨.');
  }

  if (!nombreApellidoRegex.test(usuario.apellido)) {
    mensajes.push('Apellido debe tener entre 4 y 54 caracteres. Puede contener letras, espacios y caracteres especiales como ´ y ¨.');
  }

  if (!documentoRegex.test(usuario.documento)) {
    mensajes.push('El documento debe tener entre 6 y 12 números y no puede estar vacío.');
  }

  if (!emailRegex.test(usuario.email)) {
    mensajes.push('El email debe ser un correo electrónico válido y no puede estar vacío.');
  }

  if (!rolesAsignados.length) {
    mensajes.push('Rol obligatorio, debe tener mínimo un rol o varios.');
  }

  return mensajes;
};

//validaciones (expresiones regulares y mas) de profesional en el servidor

const validarProfesional = (profesionalValidado) => {
  let mensajes = [];

  const profesionRegex = /^[a-zA-ZñÑ\s,.´¨]{6,99}$/;
  const especialidadRegex = profesionRegex;
  const matriculaRegex = /^M\d{3,6}$/;
  const domicilioRegex = /^[a-zA-ZñÑ\s0-9´¨().,]{20,149}$/;

  console.log("Validando profesional:", profesionalValidado); // Debug

  if (!profesionRegex.test(profesionalValidado.profesion)) {
    mensajes.push('Profesión incorrecta. Debe contener entre 6 y 99 caracteres. (Símbolos permitidos: , . ´ ¨ ñ)');
  }

  if (!especialidadRegex.test(profesionalValidado.especialidad)) {
    mensajes.push('Especialidad incorrecta. Debe contener entre 6 y 99 caracteres. (Símbolos permitidos: , . ´ ¨ ñ)');
  }

  if (!matriculaRegex.test(profesionalValidado.matricula)) {
    mensajes.push(`Matrícula incorrecta (${profesionalValidado.matricula}). Debe contener entre 4 y 10 caracteres. (Ejemplo: M123, M3423)`); // Debug
  }

  if (!domicilioRegex.test(profesionalValidado.domicilio)) {
    mensajes.push('Domicilio incorrecto. Debe contener entre 20 y 149 caracteres. (Símbolos permitidos: ´ ¨ () . , ñ)');
  }

  if (isNaN(profesionalValidado.id_refeps) || profesionalValidado.id_refeps.length < 4 || profesionalValidado.id_refeps.length > 11) {
    mensajes.push('ID-REFEPS incorrecto. Solo permite números, debe contener entre 4 y 11 números.');
  }

  if (!profesionalValidado.caducidad) {
    mensajes.push('Caducidad incorrecta. Debe ingresar una fecha.');
  } else {
    const currentDate = new Date();
    const selectedDate = new Date(profesionalValidado.caducidad);

    if (selectedDate <= currentDate) {
      mensajes.push("Caducidad incorrecta, debe ser una fecha futura.");
    }

    if (profesionalValidado.datosProfesional && profesionalValidado.datosProfesional.caducidad) {
      const caducidadTime = new Date(profesionalValidado.datosProfesional.caducidad);
      selectedDate.setHours(caducidadTime.getHours());
      selectedDate.setMinutes(caducidadTime.getMinutes());
      selectedDate.setSeconds(caducidadTime.getSeconds());
      selectedDate.setDate(selectedDate.getDate() + 1);

      profesionalValidado.caducidad = selectedDate.toISOString();
    }
  }

  return mensajes;
};

// modificar usuario completo (roles y profesional) 
const modificarUsuarioCompleto = async (req, res) => {

  const {
    usuarioValidado,
    rolesOriginales,
    rolesAsignados,
    modificarRoles,
    profesionalValidado,
    validarUsuarioDocumento,
    validarUsuarioEmail,
    validarProfesionalMatricula,
    validarProfesionalIdRefeps
  } = req.body;

  // validaciones en el servidor usuario y roles 
  const mensajesDeValidacion = validarUsuarioYRol(usuarioValidado, rolesAsignados);
  if (mensajesDeValidacion.length > 0) {
    return res.status(400).json({ error: true, message: mensajesDeValidacion });
  }

  // Validar datos del profesional si es necesario
  let mensajesDeValidacionProfesional = [];
  if (profesionalValidado && profesionalValidado.modificar || profesionalValidado.crear) {
    mensajesDeValidacionProfesional = validarProfesional(profesionalValidado);
    if (mensajesDeValidacionProfesional.length > 0) {
      return res.status(400).json({ error: true, message: mensajesDeValidacionProfesional });
    }
  }


  const transaction = await sequelize.transaction();

  try {
    // Validar si hay que modificar usuario
    if (usuarioValidado.modificar) {
      if (validarUsuarioDocumento) {
        const usuarioEncontrado = await Usuario.buscarPorDocumento(usuarioValidado.documento);
        if (usuarioEncontrado && usuarioEncontrado.id !== usuarioValidado.id) {
          throw new Error('El documento ingresado ya está registrado.');
        }
      }

      if (validarUsuarioEmail) {
        const emailNuevo = await Usuario.buscarUsuarioPorEmail(usuarioValidado.email);
        if (emailNuevo && emailNuevo.id !== usuarioValidado.id) {
          throw new Error('El correo electrónico ya está registrado.');
        }
      }
      //Si desactivan al usuario y ademas tiene rol profesional ,desactivar tambien tabla profesional estado=0
      if (usuarioValidado.estado === 0 && profesionalValidado !== null) {
        await Profesional.deshabilitar(usuarioValidado.id, transaction);
      }

      //Si activan al usuario y ademas tiene rol profesional ,desactivar tambien tabla profesional estado=0
      if (usuarioValidado.estado === 1 && profesionalValidado !== null) {
        await Profesional.habilitar(usuarioValidado.id, transaction);
      }

      await Usuario.modificarUsuario(usuarioValidado, transaction);
    }

    // validar si hay que agregar(y crear profesional para rol profesional) o eliminar roles
    if (modificarRoles) {
      const rolesOriginalesIds = rolesOriginales.map(rol => rol.rol_id);
      const rolesAsignadosIds = rolesAsignados.map(rol => rol.rol_id);

      const rolesAEliminar = rolesOriginalesIds.filter(rol_id => !rolesAsignadosIds.includes(rol_id));
      const rolesAAgregar = rolesAsignadosIds.filter(rol_id => !rolesOriginalesIds.includes(rol_id));

      if (rolesAEliminar.length && rolesAEliminar.length > 0) {
        for (const rol_id of rolesAEliminar) {
          //Si es 2 es PROFESIONAL, ademas de aliminar el rol, modificar el estado en tabla profesional a 0 .
          if (rol_id === 2) {
            await Profesional.deshabilitar(usuarioValidado.id, transaction);
          }
          await Rol.desasignarRolUsuario(usuarioValidado.id, rol_id, transaction);
        }
      }

      if (rolesAAgregar.length && rolesAAgregar.length > 0) {
        for (const rol_id of rolesAAgregar) {
          // Cuando el usuario ya tuvo rol profesional se habilita en la tabla profesional ya cargado anteriormente
          if (rol_id === '2' && profesionalValidado.modificar) {
            await Profesional.habilitar(usuarioValidado.id, transaction);
          }

          //Si es la primera vez que se asigna rol profesional se crea una fila en la tabla profesional
          if (rol_id === '2' && profesionalValidado.crear) {
            const usuario_id = usuarioValidado.id;
            const profesion = profesionalValidado.profesion;
            const especialidad = profesionalValidado.especialidad;
            const matricula = profesionalValidado.matricula;
            const domicilio = profesionalValidado.domicilio;
            const caducidad = profesionalValidado.caducidad;
            const id_refeps = profesionalValidado.id_refeps;
            // replacements: [usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps],

            await Profesional.crear({ usuario_id, profesion, especialidad, matricula, domicilio, caducidad, id_refeps }, transaction);
            //Si agregan rol profesional a un usuario con estado 0 , ambos tendran el mismo estado
            if (usuarioValidado.estado === 0) {
              await Profesional.deshabilitar(usuarioValidado.id, transaction);
            }
          }
          await Rol.asignarRolUsuario(usuarioValidado.id, rol_id, transaction);
        }
      }
    }

    if (profesionalValidado.modificar) {
      console.log("307");
      console.log(profesionalValidado.modificar);
      if (validarProfesionalMatricula) {
        console.log("matricula...");
        // validar matricula que no este ocupada
        console.log('313');
        console.log(profesionalValidado.matricula);
        const usuarioEncontrado = await Profesional.validarMatricula(profesionalValidado.matricula, { transaction });
        console.log(usuarioEncontrado);
        if (usuarioEncontrado.length && usuarioEncontrado[0].matricula === profesionalValidado.matricula) {
          throw new Error('La matricula ingresada ya está registrada.');
        }
      }

      if (validarProfesionalIdRefeps) {
        //validar id refeps antes de modificarlo que no este ocupado
        console.log("324");
        console.log(profesionalValidado.id_refeps);
        const usuarioEncontrado = await Profesional.validarIdRefeps(profesionalValidado.id_refeps, { transaction });
        console.log("325");
        console.log(usuarioEncontrado);
        if (usuarioEncontrado.length && usuarioEncontrado[0].id_refeps === profesionalValidado.id_refeps) {
          throw new Error('El ID REFEPS ingresado ya está registrado.');
        }
      }

      await Profesional.modificar({
        usuario_id: usuarioValidado.id,
        profesion: profesionalValidado.profesion,
        especialidad: profesionalValidado.especialidad,
        matricula: profesionalValidado.matricula,
        domicilio: profesionalValidado.domicilio,
        caducidad: profesionalValidado.caducidad,
        id_refeps: profesionalValidado.id_refeps
      }, transaction);
    }

    await transaction.commit();
    res.status(200).json({ message: 'El Usuario fue modificado con éxito.' });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: true, message: error.message });
  }
}


const buscarUsuarioDocumento = async (req, res) => {
  const { documento } = req.params;
  try {
    const usuario = await Usuario.buscarPorDocumento(documento);
    if (!usuario) {
      return res.status(404).json({ message: 'El documento ingresado no se encuentra registrado.' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el usuario' });
  }
};

const buscarRolesUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const roles = await Usuario.buscarRolesUsuario(usuario_id);
    if (!roles) {
      return res.status(404).json({ message: 'No se encontraron roles asignados.' });
    }
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar roles asignados.' })
  }
}


//BUSCAR/VISUALIZAR USUARIOS
const mostrarFormBuscarUsuarios = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formBuscarUsuarios');
  } else {
    res.render('accesoDenegado');
    //res.status(403).json({ mensaje: 'Acceso denegado' });
  }
}


const buscarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.buscarUsuariosConRolesYProfesionales();

    if (!usuarios) {
      return res.status(404).json({ message: 'No se encontraron usuarios.' });
    }

    res.json(usuarios);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ message: 'Error al buscar usuarios.' });
  }
};


// LOGIN verifica usuario, si existe trae el pass
//Si el pass es correcto trae el o los roles del usuario para iniciar sesion

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


    if (usuario === null) {
      return res.status(401).json({ mensaje: 'El documento de usuario ingresado es incorrecto. Por favor, inténtelo de nuevo.' });
    }


    // si existe el user compara la pass ingresada
    const isMatch = await bcrypt.compare(password, usuario.password);

    if (!isMatch) {
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
      datosProfesional = await Profesional.obtenerDatosProfesional(usuario.id);
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


    if (usuario.estado === 0) {
      return res.status(401).json({ mensaje: 'El usuario ingresado esta deshabilitado. Por favor, comuniquese con un administrador.' });
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

//RESTABLECER CONTRASEÑA *********************************************************************************************************************************************
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

export default {
  mostrarFormLogin,
  mostrarFormRestablecerPass,
  renderRestablecerPassword,
  enviarEnlaceRecuperacion,
  actualizarPassword,
  login,
  mostrarIndexAdmin,
  mostrarIndexProf,
  mostrarSelectRol,
  cerrarSesion,
  mostrarFormCrearUsuario,
  crearUsuarioCompleto,
  mostrarFormModificarUsuario,
  buscarUsuarioDocumento,
  buscarRolesUsuario,
  modificarUsuarioCompleto,
  mostrarFormBuscarUsuarios,
  buscarUsuarios
};
