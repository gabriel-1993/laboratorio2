import Medicamento from '../models/medicamentoModel.js';
import sequelize from '../sequalize.js';

// RENDERIZAR FORM PRINCIPAL PARA AGREGAR MEDICAMENTO
const mostrarFormAgregarMedicamento = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formCrearMedicamento');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

//BUSCAR MEDICAMENTO CON NOMBRE GENERICO UNICO
const buscarNombreGenerico = async (req, res) => {
  const { nombre_generico } = req.query;
  const regex = /^[A-Z0-9 ]{6,100}$/;

  if (!regex.test(nombre_generico)) {
    return res.status(400).json({ mensaje: 'El nombre genérico debe tener entre 6 y 100 caracteres y solo puede contener letras mayúsculas, números y espacios.' });
  }

  const transaction = await sequelize.transaction();
  try {
    const medicamentoExistente = await Medicamento.validarNombreGenerico(nombre_generico, transaction);

    if (medicamentoExistente) {
      const [categoria, familia] = await Promise.all([
        Medicamento.buscarCategoriaId(medicamentoExistente.categoria_id, transaction),
        Medicamento.buscarFamiliaId(medicamentoExistente.familia_id, transaction)
      ]);

      medicamentoExistente.categoria = categoria;
      medicamentoExistente.familia = familia;

      await transaction.commit(); // Commit the transaction
      return res.status(200).json(medicamentoExistente);
    } else {
      await transaction.commit(); // Commit the transaction
      return res.status(200).json({ mensaje: 'Medicamento no encontrado. Por favor, ingrese todos los datos para agregarlo.' });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('Error al buscar medicamento:', error);
    return res.status(500).json({ mensaje: 'Error al buscar el medicamento', error: error.message });
  }
}

// Buscar concentracion presentacion y forma de un medicamento especifico por su id 
const buscarItemsMedicamento = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { medicamento_id } = req.query;

    const items = await Medicamento.buscarItemsMedicamento(medicamento_id, transaction);
    await transaction.commit();

    return res.json(items);

  } catch (error) {
    await transaction.rollback();
    console.error('Error al buscar los items del medicamento:', error);
    return res.status(500).json({ message: 'Error al buscar los items del medicamento.' });
  }
};

// Controlador para obtener formas, presentaciones y concentraciones disponibles
const obtenerMedicamentosFormasPresentacionesConcentraciones = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const [medicamentos, formas, presentaciones, concentraciones] = await Promise.all([
      Medicamento.buscarMedicamentos(transaction),
      Medicamento.buscarFormas(transaction),
      Medicamento.buscarPresentaciones(transaction),
      Medicamento.buscarConcentraciones(transaction)
    ]);

    await transaction.commit();
    return res.status(200).json({
      medicamentos,
      formas,
      presentaciones,
      concentraciones
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al obtener datos disponibles:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

//AGREGAR FORMA FARMACEUTICA NUEVA
async function agregarFormaFarmaceutica(descripcion, transaction) {
  try {
    const nuevaFormaFarmaceuticaId = await Medicamento.agregarFormaFarmaceutica(descripcion, transaction);
    return nuevaFormaFarmaceuticaId;
  } catch (error) {
    console.error('Error al agregar forma farmacéutica:', error);
    throw new Error('Error al agregar forma farmacéutica: ' + error.message);
  }
}

//AGREGAR PRESENTACION NUEVA
async function agregarPresentacion(descripcion, transaction) {
  try {
    const nuevaPresentacionId = await Medicamento.agregarPresentacion(descripcion, transaction);
    return nuevaPresentacionId;
  } catch (error) {
    console.error('Error al agregar presentacion:', error);
    throw new Error('Error al agregar presentacion: ' + error.message);
  }
}

//AGREGAR CONCENTRACION NUEVA
async function agregarConcentracion(descripcion, transaction) {
  try {
    const nuevaConcentracionId = await Medicamento.agregarConcentracion(descripcion, transaction);
    return nuevaConcentracionId;
  } catch (error) {
    console.error('Error al agregar concentracion:', error);
    throw new Error('Error al agregar concentracion: ' + error.message);
  }
}

// ASIGNAR FORMA FARMACEUTICA A MEDICAMENTO
async function asignarFormaMedicamento(medicamentoId, formaId, transaction) {
  try {
    await Medicamento.asignarFormaMedicamento(medicamentoId, formaId, transaction);
  } catch (error) {
    console.error('Error al asignar forma farmacéutica al medicamento:', error);
    throw new Error('Error al asignar forma farmacéutica al medicamento: ' + error.message);
  }
}

// ASIGNAR PRESENTACION A MEDICAMENTO
async function asignarPresentacionMedicamento(medicamentoId, presentacionId, transaction) {
  try {
    await Medicamento.asignarPresentacionMedicamento(medicamentoId, presentacionId, transaction);
  } catch (error) {
    console.error('Error al asignar presentacion al medicamento:', error);
    throw new Error('Error al asignar presentacion al medicamento: ' + error.message);
  }
}

// ASIGNAR CONCENTRACION A MEDICAMENTO
async function asignarConcentracionMedicamento(medicamentoId, concentracionId, transaction) {
  try {
    await Medicamento.asignarConcentracionMedicamento(medicamentoId, concentracionId, transaction);
  } catch (error) {
    console.error('Error al asignar concentracion al medicamento:', error);
    throw new Error('Error al asignar concentracion al medicamento: ' + error.message);
  }
}



// AGREGAR ITEM: primero (asignar o crear/asignar) FORMA PRESENTACION CONTRACION A MEDICAMENTO. POR ULTIMO AGREGAR ITEM DEL MEDICAMENTO 
async function agregarItemMedicamento(req, res) {
  let { medicamentoEncontrado, asignarForma, asignarPresentacion, asignarConcentracion } = req.body;

  const transaction = await sequelize.transaction();

  // Expresión regular
  const regex = /^[A-Za-z][A-Za-z0-9 ]{4,99}$/;
  const regex2 = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;

  try {
    // Validar forma farmacéutica 
    console.log(asignarForma);
    if (typeof asignarForma === 'string') {
      if (!regex.test(asignarForma)) {
        return res.status(400).json({ error: 'Forma farmacéutica debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras, espacios y números.' });
      } else {
        asignarForma = { descripcion: asignarForma };
        asignarForma.id = await Medicamento.agregarFormaFarmaceutica(asignarForma.descripcion, transaction);
        await Medicamento.asignarFormaMedicamento(medicamentoEncontrado.id, asignarForma.id, transaction);
      }
    } else {
      //SI NO es 'string' llega el id de la forma:
      //Validar si forma ya esta asignada al medicamento:
      const result = await Medicamento.consultarMedicamentoFormaFarmaceutica(medicamentoEncontrado.id, asignarForma.id, transaction);
      //Si result es null : no esta asignada la forma al medicamento: asignarla.
      console.log(result);

      if (result == null) {

        await Medicamento.asignarFormaMedicamento(medicamentoEncontrado.id, asignarForma.id, transaction);
      }
    }

    // Validar presentación
    if (typeof asignarPresentacion === 'string') {
      if (!regex2.test(asignarPresentacion)) {
        return res.status(400).json({ error: 'Presentación debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 15 UNIDADES)' });
      } else {
        asignarPresentacion = { descripcion: asignarPresentacion };
        asignarPresentacion.id = await Medicamento.agregarPresentacion(asignarPresentacion.descripcion, transaction);
        await Medicamento.asignarPresentacionMedicamento(medicamentoEncontrado.id, asignarPresentacion.id, transaction);
      }
    } else {
      //SI NO es 'string' llega el id de la presentacion:
      //Validar si presentacion ya esta asignada al medicamento:
      const result = await Medicamento.consultarMedicamentoPresentacion(medicamentoEncontrado.id, asignarPresentacion.id, transaction);
      //Si result es null : no esta asignada la presentacion al medicamento: asignarla.
      if (result == null) {
        await Medicamento.asignarPresentacionMedicamento(medicamentoEncontrado.id, asignarPresentacion.id, transaction);
      }
    }

    // Validar concentración
    if (typeof asignarConcentracion === 'string') {
      if (!regex2.test(asignarConcentracion)) {
        return res.status(400).json({ error: 'Concentración debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 200 MG)' });
      } else {
        asignarConcentracion = { descripcion: asignarConcentracion };
        asignarConcentracion.id = await Medicamento.agregarConcentracion(asignarConcentracion.descripcion, transaction);
        await Medicamento.asignarConcentracionMedicamento(medicamentoEncontrado.id, asignarConcentracion.id, transaction);
      }
    } else {
      //SI NO es 'string' llega el id de la concentracion:
      //Validar si concentracion ya esta asignada al medicamento:
      const result = await Medicamento.consultarMedicamentoConcentracion(medicamentoEncontrado.id, asignarConcentracion.id, transaction);
      //Si result es null : no esta asignada la concentracion al medicamento: asignarla.
      if (result == null) {
        await Medicamento.asignarConcentracionMedicamento(medicamentoEncontrado.id, asignarConcentracion.id, transaction);
      }
    }

    const estado = 1;

    // Agregar ítem de medicamento
    await Medicamento.agregarItemMedicamento({
      medicamentoId: medicamentoEncontrado.id,
      formaFarmaceuticaId: asignarForma.id,
      presentacionId: asignarPresentacion.id,
      concentracionId: asignarConcentracion.id,
      estado,
      transaction
    });

    // Confirmar la transacción
    await transaction.commit();

    return res.status(200).json({
      medicamentoId: medicamentoEncontrado.id,
      formaFarmaceuticaId: asignarForma.id,
      presentacionId: asignarPresentacion.id,
      concentracionId: asignarConcentracion.id,
      estado
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    console.error('Error al agregar ítem de medicamento completo:', error);
    return res.status(500).json({ error: 'Error al agregar ítem de medicamento completo' });
  }
}



export default {
  mostrarFormAgregarMedicamento,
  buscarNombreGenerico,
  buscarItemsMedicamento,
  obtenerMedicamentosFormasPresentacionesConcentraciones,
  agregarFormaFarmaceutica,
  agregarPresentacion,
  agregarConcentracion,
  asignarFormaMedicamento,
  asignarPresentacionMedicamento,
  asignarConcentracionMedicamento,
  agregarItemMedicamento
};