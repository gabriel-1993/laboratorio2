import Paciente from '../models/pacienteModel.js';
import sequelize from '../sequalize.js';





// RENDERIZAR FORM PRINCIPAL PARA MODIFICAR OBRA SOCIAL/ PLAN/ES
const mostrarFormAgregarPaciente = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('formCrearPaciente');
  } else {
    res.render('accesoDenegado');
    //   res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

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

export default {
  mostrarFormAgregarPaciente,
  buscarPacientePorDocumento,
  obtenerTodosLosPacientes,
  crearPaciente
};