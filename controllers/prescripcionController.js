// import Prescripcion from '../models/pacienteModel.js';
import sequelize from '../sequalize.js';
import Prescripcion from '../models/prescripcionModel.js';
import Medicamento from '../models/medicamentoModel.js';

// RENDERIZAR FORM PRINCIPAL PARA CREAR/AGREGAR PRESCRIPCION
const mostrarFormAgregarPrescripcion = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'PROFESIONAL')) {
    res.render('formCrearPrescripcion');
  } else {
    res.render('accesoDenegado');
    //   res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};



const agregarPrescripcionCompleta = async (req, res) => {
  const {
    agregarMedicamentos,
    agregarPrestaciones,
    medicamentosAgregados,
    prestacionesAgregadas,
    paciente_id,
    prof_id_refeps,
    fechaActualDate,
    fechaVigenciaDate,
    diagnostico
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Crear la prescripción en la base de datos
    const nuevaPrescripcion = await Prescripcion.crear({
      fecha: fechaActualDate,
      vigencia: fechaVigenciaDate,
      diagnostico,
      prof_id_refeps,
      paciente_id,
      estado: 1
    }, transaction);


    // Manejar la lógica para agregar medicamentos 
    if (agregarMedicamentos && Array.isArray(medicamentosAgregados)) {
      for (const m of medicamentosAgregados) {
        await Prescripcion.agregarMedicamentoItemAprescripcion(nuevaPrescripcion.id, m.item_id, m.administracion, m.duracion, transaction);
      }
    }
    //Manejar la logica para agregar prestaciones
    if (agregarPrestaciones && Array.isArray(prestacionesAgregadas)) {
      for (const p of prestacionesAgregadas) {
        await Prescripcion.agregarPrestacionAprescripcion(nuevaPrescripcion.id, p.id, p.lado ? p.lado.id : null, p.indicacion, p.justificacion, transaction);
      }
    }
    await transaction.commit();
    res.status(200).json({ mensaje: 'Prescripción creada exitosamente', nuevaPrescripcion });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al agregar la prescripción completa:', error);
    res.status(500).json({ mensaje: 'Error al agregar la prescripción completa', error });
  }
};

const obtenerPrescripcionesAnteriores = async (req, res) => {
  const { paciente_id } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Llamar a la función del modelo para obtener las prescripciones anteriores
    const prescripciones = await Prescripcion.obtenerPrescripcionesAnteriores(paciente_id, transaction);

    if (prescripciones.length > 0) {
      // Iterar sobre cada prescripción para obtener sus prestaciones
      for (const prescripcion of prescripciones) {
        // Obtener prestaciones para cada prescripción
        const prestaciones = await Prescripcion.obtenerPrestacionesEnPrescripcion(prescripcion.id, transaction);
        // Agregar prestaciones a la prescripción
        prescripcion.prestaciones = prestaciones;
      }



      // Iterar sobre cada prescripción para obtener sus medicamentos
      for (const prescripcion of prescripciones) {
        // Obtener prestaciones para cada prescripción
        const medicamentos = await Prescripcion.obtenerMedicamentosEnPrescripcion(prescripcion.id, transaction);
        // buscar descripcion completa de cada medicamento item por su id, para poder mostrar los datos
        for (const element of medicamentos) {
          const r = await Medicamento.buscarDatosItemMedicamento(element.medicamento_item_id, transaction);
          element.descripcion_item = { ...r[0] };
        }

        //guardar datos del medicamento item en la prescripcion
        prescripcion.medicamentos = medicamentos;
      }

      // Confirmar la transacción si todo salió bien
      await transaction.commit();

      // Enviar la respuesta con los datos obtenidos
      res.status(200).json({
        success: true,
        data: prescripciones
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No se encontraron prescripciones anteriores para este paciente.'
      });
    }
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    console.error('Error al obtener prescripciones anteriores:', error);
    res.status(500).json({
      success: false,
      message: 'Ocurrió un error al obtener las prescripciones anteriores.'
    });
  }
};




export default {
  mostrarFormAgregarPrescripcion,
  agregarPrescripcionCompleta,
  obtenerPrescripcionesAnteriores
};