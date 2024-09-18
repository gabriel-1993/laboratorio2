import Paciente from '../models/pacienteModel.js';
import sequelize from '../sequalize.js';

// RENDERIZAR FORM PRINCIPAL PARA CREAR/AGREGAR PACIENTE
const mostrarFormAgregarPaciente = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('formCrearPaciente');
  } else {
    res.render('accesoDenegado');
    //   res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

// RENDERIZAR FORM PRINCIPAL PARA MODIFICAR PACIENTE
const mostrarFormModificarPaciente = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('formModificarPaciente');
  } else {
    res.render('accesoDenegado');
    //   res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

const mostrarFormListaPacientes = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('formMostrarListaPacientes');
  } else {
    res.render('accesoDenegado');
    //   res.status(403).json({ mensaje: 'Acceso denegado' });
  }
}

// Buscar paciente por documento/ validar DNI ocupado
async function buscarPacientePorDocumento(req, res) {
  const { documento } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const paciente = await Paciente.buscarDocumento(documento, transaction);

    if (!paciente) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    await transaction.commit();
    return res.status(200).json(paciente); // objeto paciente completo
  } catch (error) {
    await transaction.rollback(); //  rollback en caso de error
    console.error('Error al buscar el paciente:', error);
    return res.status(500).json({ message: 'Error al buscar el paciente' });
  }
}

//Buscar todos los pacientes
async function obtenerTodosLosPacientes(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const pacientes = await Paciente.obtenerTodosLosPacientes(transaction);

    if (!pacientes) {
      await transaction.rollback(); // Haz rollback si no hay pacientes
      return res.status(404).json({ message: 'No se encontraron pacientes' });
    }

    await transaction.commit(); // Confirma la transacción si todo salió bien
    return res.status(200).json(pacientes); // Retorna la lista de pacientes
  } catch (error) {
    await transaction.rollback(); // Haz rollback en caso de error
    console.error('Error al obtener los pacientes:', error);
    return res.status(500).json({ message: 'Error al obtener los pacientes' });
  }
}

// Crear un paciente
async function crearPaciente(req, res) {
  const transaction = await sequelize.transaction(); // Iniciar la transacción

  try {
    const { nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia } = req.body;

    // Validar los datos
    if (!nombre || !apellido || !documento || !fecha_nacimiento || !sexo || !telefono) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // Validar el documento
    if (!/^\d{6,20}$/.test(documento)) {
      return res.status(400).json({ mensaje: 'Documento incorrecto. Debe contener entre 6 y 20 dígitos numéricos.' });
    }

    // Validar nombre
    const nombreRegex = /^[a-zA-Z\s]{4,25}$/;
    if (!nombreRegex.test(nombre)) {
      return res.status(400).json({ mensaje: 'Nombre incorrecto. Debe tener entre 4 y 25 caracteres y solo puede incluir letras y espacios.' });
    }

    // Validar apellido
    const apellidoRegex = /^[a-zA-Z\s]{4,25}$/;
    if (!apellidoRegex.test(apellido)) {
      return res.status(400).json({ mensaje: 'Apellido incorrecto. Debe tener entre 4 y 25 caracteres y solo puede incluir letras y espacios.' });
    }

    // Validar teléfono
    if (!/^\+?[1-9]\d{1,14}$/.test(telefono)) {
      return res.status(400).json({ mensaje: 'Número de teléfono incorrecto. Debe comenzar con un código de país y contener solo dígitos.' });
    }

    // Validar fecha de nacimiento
    const fechaNacimiento = new Date(fecha_nacimiento);
    if (isNaN(fechaNacimiento.getTime()) || fechaNacimiento > new Date() || new Date().getFullYear() - fechaNacimiento.getFullYear() > 120) {
      return res.status(400).json({ mensaje: 'Fecha de nacimiento incorrecta. Debe ser una fecha válida, no futura y la edad no debe superar los 120 años.' });
    }

    // Validar género
    const sexosValidos = ['MASCULINO', 'FEMENINO', 'OTRO'];
    if (!sexosValidos.includes(sexo)) {
      return res.status(400).json({ mensaje: 'Género incorrecto. Debe ser uno de los valores válidos: MASCULINO, FEMENINO, OTRO.' });
    }

    // Validar alergia
    if (alergia && !/^[a-zA-Z\s]{7,149}$/.test(alergia)) {
      return res.status(400).json({ mensaje: 'Alergia incorrecta. Debe tener entre 7 y 149 caracteres y solo puede incluir letras y espacios.' });
    }

    // Crear el paciente utilizando el modelo
    const nuevoPaciente = await Paciente.crear({ nombre, apellido, documento, fecha_nacimiento, sexo, telefono, alergia }, transaction);

    // Confirmar la transacción
    await transaction.commit();

    // Enviar respuesta al cliente
    res.status(201).json({ mensaje: `Paciente ${nuevoPaciente.nombre} ${nuevoPaciente.apellido} creado con éxito.`, paciente: nuevoPaciente });
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    console.error('Error al crear paciente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

//Modificar datos paciente
async function modificarPaciente(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { id,
      nombre,
      apellido,
      documento,
      fecha_nacimiento,
      sexo,
      telefono,
      alergia,
      estado } = req.body;

    // Validaciones con expresiones regulares
    if (!validarDocumento(documento)) {
      return res.status(400).json({ message: 'Documento no válido.' });
    }

    if (!validarNombreApellido(nombre)) {
      return res.status(400).json({ message: 'Nombre no válido. Debe contener entre 4 y 25 caracteres, y solo puede incluir letras y espacios.' });
    }

    if (!validarNombreApellido(apellido)) {
      return res.status(400).json({ message: 'Apellido no válido. Debe contener entre 4 y 25 caracteres, y solo puede incluir letras y espacios.' });
    }

    if (!validarTelefono(telefono)) {
      return res.status(400).json({ message: 'Teléfono incorrecto. El número debe comenzar con un código de país y contener solo dígitos.' });
    }

    if (!validarAlergia(alergia)) {
      return res.status(400).json({ message: 'Alergia incorrecta. Debe tener entre 10 y 149 caracteres y solo puede contener letras sin tildes y espacios.' });
    }

    if (!validarFechaNacimiento(fecha_nacimiento)) {
      return res.status(400).json({ message: 'Fecha de nacimiento incorrecta. Verifique que no sea una fecha futura o que no tenga más de 120 años.' });
    }

    if (!validarGenero(sexo)) {
      return res.status(400).json({ message: 'Género incorrecto. Debe seleccionar un género válido.' });
    }

    // Modificar los datos del paciente en la base de datos
    await Paciente.modificarPaciente(id,
      nombre,
      apellido,
      documento,
      fecha_nacimiento,
      sexo,
      telefono,
      alergia,
      estado, transaction);

    await transaction.commit();
    res.status(200).json({ message: 'Modificación exitosa' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al modificar paciente:', error);
    res.status(500).json({ message: 'Error al modificar paciente', error: error.message });
  }
}

// FUNCIONES DE VALIDACIÓN
function validarNombreApellido(elem) {
  if (!elem || elem.trim() === '') {
    return false;
  }
  const regex = /^[a-zA-Z\s]{4,25}$/;
  return regex.test(elem);
}

function validarDocumento(documento) {
  const regex = /^\d{6,20}$/;
  return regex.test(documento);
}

function validarGenero(genero) {
  return genero !== "-1";
}

function validarTelefono(telefono) {
  const regex = /^\+?[1-9]\d{1,14}$/;
  return regex.test(telefono);
}

function validarFechaNacimiento(fechaInput) {
  if (!fechaInput) return false;
  const fechaNacimiento = new Date(fechaInput);
  const fechaValida = fechaNacimiento instanceof Date && !isNaN(fechaNacimiento.getTime());
  if (!fechaValida) return false;

  const fechaActual = new Date();
  const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
  const mesNacimiento = fechaNacimiento.getMonth();
  const mesActual = fechaActual.getMonth();
  const diaNacimiento = fechaNacimiento.getDate();
  const diaActual = fechaActual.getDate();

  if (mesNacimiento > mesActual || (mesNacimiento === mesActual && diaNacimiento > diaActual)) {
    edad--;
  }
  if (edad > 120 || fechaNacimiento > fechaActual) return false;
  return true;
}

function validarAlergia(alergia) {
  const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
  if (alergia !== "") {
    if (alergia.length < 7 || alergia.length > 149) return false;
    return regex.test(alergia);
  }
  return true;
}

//BUSCAR OBRA Y PLAN DEL PACIENTE
async function buscarObraYplanPacienteId(req, res) {
  const transaction = await sequelize.transaction();
  try {
      const { id } = req.body;
console.log(typeof id);

      if (!id) {
          return res.status(400).json({ message: 'ID PACIENTE VACÍO' });
      }

      // Llamada al modelo para obtener la obra social y plan
      const resultado = await Paciente.buscarObraYPlanPorPacienteId(id, transaction);

      if (!resultado.obra_social && !resultado.plan) {
          return res.status(404).json({ message: 'No se encontraron obras sociales ni planes para este paciente' });
      }

      await transaction.commit();
      res.status(200).json({ 
          message: 'Obra social y plan encontrados', 
          obra_social: resultado.obra_social, 
          plan: resultado.plan 
      });
  } catch (error) {
      await transaction.rollback();
      console.error('Error al buscar obra social y plan de paciente:', error);
      res.status(500).json({ message: 'Error al buscar obra social y plan de paciente', error: error.message });
  }
}


export default {
  mostrarFormAgregarPaciente,
  buscarPacientePorDocumento,
  obtenerTodosLosPacientes,
  crearPaciente,
  mostrarFormModificarPaciente,
  modificarPaciente,
  mostrarFormListaPacientes,
  buscarObraYplanPacienteId
};