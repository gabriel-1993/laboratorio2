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
  const regex = /^[A-Za-z0-9 ]{6,100}$/;

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
      return res.status(200).json({ mensaje: 'Medicamento no encontrado.Por favor, ingrese todos los datos para agregarlo.' });
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

// Controlador para obtener todos los medicamentos, familias, categorias, formas, presentaciones y concentraciones disponibles
const obtenerMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const [medicamentos, familias, categorias, formas, presentaciones, concentraciones] = await Promise.all([
      Medicamento.buscarMedicamentos(transaction),
      Medicamento.buscarFamilias(transaction),
      Medicamento.buscarCategorias(transaction),
      Medicamento.buscarFormas(transaction),
      Medicamento.buscarPresentaciones(transaction),
      Medicamento.buscarConcentraciones(transaction),

    ]);

    await transaction.commit();
    return res.status(200).json({
      medicamentos,
      familias,
      categorias,
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

async function agregarMedicamentoNuevoEitem(req, res) {

  let { nombreGenerico, nombreComercial, asignarFamilia, asignarCategoria, asignarForma, asignarPresentacion, asignarConcentracion } = req.body;
  let transaction;

  try {
    // Inicia una transacción
    transaction = await sequelize.transaction();

    //MEDICAMENTO NECESITA EL ID DE FAMILIA Y CATEGORIA : PRIMERO ASEGURAMOS QUE ESTEN ESTOS IDS
    const familiaYcategoria = /^[a-zA-Z\s]{6,99}$/;

    // AGREGAR FAMILIA SI ES UN STRING, LLEGO SOLO LA DESCRIPCION SIN ID
    if (typeof asignarFamilia === 'string') {
      if (!familiaYcategoria.test(asignarFamilia)) {
        return res.status(400).json({ error: 'Familia debe comenzar con letras, min 6 max 99 caracteres.Puede ingresar letras y espacios.' });
      } else {
        asignarFamilia = { descripcion: asignarFamilia };
        asignarFamilia.id = await Medicamento.agregarFamilia(asignarFamilia.descripcion, transaction);
      }
    }

    //AGREGAR CATEGORIA SI ES UN STRING, LLEGO SOLO LA DESCRIPCION SIN ID
    if (typeof asignarCategoria === 'string') {
      if (!familiaYcategoria.test(asignarCategoria)) {
        return res.status(400).json({ error: 'Categoria debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.' });
      } else {
        asignarCategoria = { descripcion: asignarCategoria };
        asignarCategoria.id = await Medicamento.agregarCategoria(asignarCategoria.descripcion, transaction);
      }
    }

    // VALIDAR NOMBRE GENERICO(OBLIGATORIO) Y NOMBRE COMERCIAL(opcional)
    const nombreGenericoRegex = /^[A-Za-z0-9 ]{6,100}$/;
    if (!nombreGenericoRegex.test(nombreGenerico)) {
      return res.status(400).json({ error:'Nombre genérico debe contener solo letras, números y espacios, min 6 y max 100 caracteres.' });
    }


    const nombreComercialRegex = /^[a-zA-Z\s]{6,99}$/;
    if (nombreComercial !== '') {
        nombreComercial = nombreComercial.trim().toUpperCase();
        if (!nombreComercialRegex.test(nombreComercial)) {
          return res.status(400).json({ error:'Nombre comercial debe contener solo letras y espacios, min 6 y max 99 caracteres.' });
        }
    }




    // Crea el nuevo medicamento
    const nuevoMedicamento = await Medicamento.crear(
      {
        nombre_generico: nombreGenerico,
        nombre_comercial: nombreComercial,
        familia_id: asignarFamilia.id,
        categoria_id: asignarCategoria.id
      },
      transaction
    );

    // Validar forma farmacéutica 
    const regexForma = /^[A-Za-z][A-Za-z0-9 ]{4,99}$/;
    if (typeof asignarForma === 'string') {
      if (!regexForma.test(asignarForma)) {
        return res.status(400).json({ error: 'Forma farmacéutica debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras, espacios y números.' });
      } else {
        asignarForma = { descripcion: asignarForma };
        asignarForma.id = await Medicamento.agregarFormaFarmaceutica(asignarForma.descripcion, transaction);
        await Medicamento.asignarFormaMedicamento(nuevoMedicamento.id, asignarForma.id, transaction);
      }
    } else {
      //SI no es un string llega el id de la forma , asignarla.
      await Medicamento.asignarFormaMedicamento(nuevoMedicamento.id, asignarForma.id, transaction);
    }



    // Validar presentación
    const regexPresenConcen = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;
    if (typeof asignarPresentacion === 'string') {
      if (!regexPresenConcen.test(asignarPresentacion)) {
        return res.status(400).json({ error: 'Presentación debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 15 UNIDADES)' });
      } else {
        asignarPresentacion = { descripcion: asignarPresentacion };
        asignarPresentacion.id = await Medicamento.agregarPresentacion(asignarPresentacion.descripcion, transaction);
        await Medicamento.asignarPresentacionMedicamento(nuevoMedicamento.id, asignarPresentacion.id, transaction);
      }
    } else {
      //SI NO es 'string' llega el id de la presentacion:
      await Medicamento.asignarPresentacionMedicamento(nuevoMedicamento.id, asignarPresentacion.id, transaction);

    }

    // Validar concentración
    if (typeof asignarConcentracion === 'string') {
      if (!regexPresenConcen.test(asignarConcentracion)) {
        return res.status(400).json({ error: 'Concentración debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 200 MG)' });
      } else {
        asignarConcentracion = { descripcion: asignarConcentracion };
        asignarConcentracion.id = await Medicamento.agregarConcentracion(asignarConcentracion.descripcion, transaction);
        await Medicamento.asignarConcentracionMedicamento(nuevoMedicamento.id, asignarConcentracion.id, transaction);
      }
    } else {
      //SI NO es 'string' llega el id de la concentracion:
      await Medicamento.asignarConcentracionMedicamento(nuevoMedicamento.id, asignarConcentracion.id, transaction);
    }





    const estado = 1;

    // Agregar ítem de medicamento
    await Medicamento.agregarItemMedicamento({
      medicamentoId: nuevoMedicamento.id,
      formaFarmaceuticaId: asignarForma.id,
      presentacionId: asignarPresentacion.id,
      concentracionId: asignarConcentracion.id,
      estado,
      transaction
    });

    // Confirmar la transacción
    await transaction.commit();

    return res.status(200).json({
      medicamentoId: nuevoMedicamento.id,
      formaFarmaceuticaId: asignarForma.id,
      presentacionId: asignarPresentacion.id,
      concentracionId: asignarConcentracion.id,
      estado
    });









  } catch (error) {
    // Si ocurre algún error, realiza el rollback de la transacción
    if (transaction) await transaction.rollback();

    // Maneja el error y responde al cliente
    console.error('Error al agregar nuevo medicamento y asignaciones:', error);
    res.status(500).json({ error: 'Error al agregar nuevo medicamento y asignaciones' });
  }
}


export default {
  mostrarFormAgregarMedicamento,
  buscarNombreGenerico,
  buscarItemsMedicamento,
  obtenerMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones,
  agregarFormaFarmaceutica,
  agregarPresentacion,
  agregarConcentracion,
  asignarFormaMedicamento,
  asignarPresentacionMedicamento,
  asignarConcentracionMedicamento,
  agregarItemMedicamento,
  agregarMedicamentoNuevoEitem
};