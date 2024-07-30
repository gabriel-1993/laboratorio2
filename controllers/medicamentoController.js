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

// RENDERIZAR FORM PRINCIPAL PARA MODIFICAR MEDICAMENTO
const mostrarFormModificarMedicamento = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formModificarMedicamento');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

//EXPRESIONES REGULARES
//VALIDAR NOMBRES : comparten la misma expresion regular
function validarNombre(nombre, tipo) {
  const regex = /^[A-Za-z0-9 ]{6,100}$/;
  let mensaje;

  // Determinar el mensaje de error basado en el tipo
  switch (tipo) {
    case 'generico':
      mensaje = 'Nombre genérico debe contener solo letras, números y espacios, min 6 y max 100 caracteres.';
      break;
    case 'comercial':
      mensaje = 'Nombre comercial debe contener solo letras, números y espacios, min 6 y max 100 caracteres.';
      break;
    default:
      console.error('Tipo de nombre no válido.');
      return false;
  }

  // Verificar si el nombre cumple con la expresión regular
  if (!regex.test(nombre)) {
    msjs.push(mensaje);
    mostrarMsjCliente('Dato incorrecto', msjs);
    return false;
  }

  return true;
}

//EXPRESIONES REGULARES
//VALIDAR CATEGORIA O FAMILIA : comparten la misma expresion regular
function validarFamiliaOcategoria(valor, tipo) {
  const regex = /^[a-zA-Z\s]{6,99}$/;
  let mensaje = [];
  // Determinar el mensaje de error basado en el tipo
  switch (tipo) {
    case 'tipoFamilia':
      mensaje.push('Familia debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.');
      break;
    case 'tipoCategoria':
      mensaje.push('Categoría debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.');
      break;
    default:
      console.error('Tipo de campo no válido.');
      return false;
  }

  // Verificar si el valor cumple con la expresión regular
  if (!regex.test(valor)) {
    mostrarMsjCliente('Dato incorrecto', mensaje);
    return false;
  }

  return true;
}

//MODIFICAR MEDICAMENTO --------------------------------------------------------------------------------------------------------------------------------------------
async function modificarMedicamento(req, res) {
  let { medicamentoEncontrado, estado, nombreGenerico, nombreComercial, familia, categoria } = req.body;

  if (!medicamentoEncontrado || !estado || !nombreGenerico || !familia || !categoria) {
    return res.status(400).json({ message: 'Datos obligatorios: estado, nombre generico, familia, categoria' });
  }


  let modificarMedicamento = false;
  let familiaModificada = false;
  let categoriaModificada = false;
  const transaction = await sequelize.transaction();


  try {

    // Validar y procesar nombre genérico
    if (nombreGenerico.modificar) {
      let genericoValidacion = validarNombre(nombreGenerico.descripcion, 'generico');
      if (genericoValidacion) {
        nombreGenerico = nombreGenerico.descripcion;
        modificarMedicamento = true;
      } else {
        return res.status(400).json({ message: 'Nombre generico no valido' });
      }
    } else {
      nombreGenerico = nombreGenerico.descripcion;
    }

    // Validar y procesar nombre comercial
    if (nombreComercial.modificar) {
      let comercialValidacion = validarNombre(nombreComercial.descripcion, 'comercial');
      if (comercialValidacion) {
        nombreComercial = nombreComercial.descripcion;
        modificarMedicamento = true;
      } else {
        return res.status(400).json({ message: 'Nombre comercial no valido' });
      }
    } else if (nombreComercial.descripcion === 'DATO DESCONOCIDO') {
      nombreComercial = '';
    } else {
      nombreComercial = nombreComercial.descripcion;
    }

    // Procesar familia
    if (familia.crearYasignar) {
      let familiaValidacion = validarFamiliaOcategoria(familia.descripcion, 'tipoFamilia');
      if (familiaValidacion) {
        const idFamilia = await Medicamento.agregarFamilia(familia.descripcion, transaction);
        await Medicamento.modificarFamiliaIdMedicamento(idFamilia, medicamentoEncontrado.id, transaction);
        familiaModificada = true;
      } else {
        return res.status(400).json({ message: 'Familia no valida' });
      }
    } else if (familia.asignarExistente) {
      await Medicamento.modificarFamiliaIdMedicamento(familia.id, medicamentoEncontrado.id, transaction);
      familiaModificada = true;
    }

    // Procesar categoría
    if (categoria.crearYasignar) {
      let categoriaValidacion = validarFamiliaOcategoria(categoria.descripcion, 'tipoCategoria');
      if (categoriaValidacion) {
        const idCategoria = await Medicamento.agregarCategoria(categoria.descripcion, transaction);
        await Medicamento.modificarCategoriaIdMedicamento(idCategoria, medicamentoEncontrado.id, transaction);
        categoriaModificada = true;
      } else {
        return res.status(400).json({ message: 'Categoria no valida' });
      }
    } else if (categoria.asignarExistente) {
      await Medicamento.modificarCategoriaIdMedicamento(categoria.id, medicamentoEncontrado.id, transaction);
      categoriaModificada = true;
    }


    // Validar y procesar estado
    if (estado.modificar) {
      // MODIFICAR TODOS LOS ITEMS DEL MEDICAMENTO CON EL ESTADO DE MEDICAMENTO
      await Medicamento.modificarEstadoMedicamentosItemsId(estado.estado, medicamentoEncontrado.id, transaction);
      //Modificar el estado del medicamento
      modificarMedicamento = true;
    }




    // Procesar medicamento si se realizaron modificaciones
    if (modificarMedicamento || familiaModificada || categoriaModificada) {
      await Medicamento.modificarMedicamento(
        medicamentoEncontrado.id,
        estado.estado,
        nombreGenerico,
        nombreComercial,
        transaction
      );

      // Commit si se realizaron modificaciones
      await transaction.commit();
      return res.status(200).json({ message: 'Medicamento modificado exitosamente' });
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: 'Datos incorrectos, no hay cambios en los datos actuales' });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('Error al modificar medicamento:', error);
    return res.status(500).json({ message: 'Error al modificar medicamento: ' + error.message });
  }
}




//MODIFICAR MEDICAMENTO ITEM (INDIVIDUAL)-------------------------------------------------------------------------------------------------------------------------
// /EXPRESIONES PARA FORMA PRESENTACION Y CONCENTRACION
function validarForma(formaIngresada) {
  const regex = /^[A-Za-z][A-Za-z0-9 ]{4,99}$/;
  let msjs = [];

  if (!regex.test(formaIngresada)) {
    msjs.push('Forma farmaceutica debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras, espacios y números.');
  }

  if (msjs.length > 0) {
    mostrarMsjCliente('Datos incorrectos', msjs);
    return false;
  }
  return true;
}

function validarPresentacion(presentacionIngresada) {
  const regex2 = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;
  let msjs = [];

  if (!regex2.test(presentacionIngresada)) {
    msjs.push('Presentacion debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 15 UNIDADES)');
  }

  if (msjs.length > 0) {
    mostrarMsjCliente('Datos incorrectos', msjs);
    return false;
  }
  return true;
}

function validarConcentracion(concentracionIngresada) {
  const regex2 = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;
  let msjs = [];

  if (!regex2.test(concentracionIngresada)) {
    msjs.push('Concentracion debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 200 MG)');
  }

  if (msjs.length > 0) {
    mostrarMsjCliente('Datos incorrectos', msjs);
    return false;
  }
  return true;
}


async function modificarMedicamentoItem(req, res) {
  let { medicamento_id, item_id, formaIngresada, presentacionIngresada, concentracionIngresada, estadoIngresado } = req.body;

  if (!medicamento_id || !item_id || !formaIngresada || !presentacionIngresada || !concentracionIngresada || !estadoIngresado) {
    return res.status(400).json({ message: 'Datos obligatorios: medicamentoID, ItemID, forma farmaceutica, presentacion, concentracion, estado' });
  }

  const transaction = await sequelize.transaction();

  try {
    // FORMA FARMACEUTICA----------------------------------------------------------------------------------------------------------------------

    if (formaIngresada.asignarExistente) {
      // VALIDAR SI FORMA ID ESTA ASIGNADA AL MEDICAMENTO 
      const existe = await Medicamento.validarFormaIdEnMedicamento(medicamento_id, formaIngresada.id, transaction);
      if (!existe) {
        //SI FORMA ID NO ESTA ASIGNADA AL MEDICAMENTO : ASIGNARLA
        await Medicamento.asignarFormaMedicamento(medicamento_id, formaIngresada.id, transaction);
      }
      //ASIGNAR A MEDICAMENTO ITEM(INDIVIDUAL) EL ID FORMA
      await Medicamento.medicamentoItemModificarIdForma(formaIngresada.id, item_id, transaction);

    } else if (formaIngresada.crearYasignar) {
      const formaValidacion = validarForma(formaIngresada.descripcion);
      if (formaValidacion) {
        // CREAR UNA NUEVA FORMA CON DESCRIPCION, CAPTURAR SU ID Y MODIFICAR ID DE FORMA EN ITEM MEDICAMENO
        const idForma = await Medicamento.agregarFormaFarmaceutica(formaIngresada.descripcion, transaction);
        // ASIGNAR FORMA AL MEDICAMENTO GENERICO
        await Medicamento.asignarFormaMedicamento(medicamento_id, idForma, transaction);
        //ASIGNAR ID FORMA A MEDICAMENTO ITEM
        await Medicamento.medicamentoItemModificarIdForma(idForma, item_id, transaction);
      } else {
        return res.status(400).json({ message: 'Forma farmaceutica ingresada no valido' });
      }
    }

    // PRESENTACION-------------------------------------------------------------------------------------------------------------------------------
    // ASIGNAR EXISTENTE
    if (presentacionIngresada.asignarExistente) {
      // VALIDAR SI PRESENTACION ID ESTA ASIGNADA AL MEDICAMENTO 
      const existe = await Medicamento.validarPresentacionIdEnMedicamento(medicamento_id, presentacionIngresada.id, transaction);
      if (!existe) {
        //SI PRESENTACION ID NO ESTA ASIGNADA AL MEDICAMENTO : ASIGNARLA
        await Medicamento.asignarPresentacionMedicamento(medicamento_id, presentacionIngresada.id, transaction);
      }
      //ASIGNAR A MEDICAMENTO ITEM(INDIVIDUAL) EL ID PRESENTACION
      await Medicamento.medicamentoItemModificarIdPresentacion(presentacionIngresada.id, item_id, transaction);

    } else if (presentacionIngresada.crearYasignar) {
      //CREAR NUEVA Y ASIGNARLA A ITEM Y A MEDICAMENTO
      const presentacionValidacion = validarPresentacion(presentacionIngresada.descripcion);

      if (presentacionValidacion) {
        // CREAR UNA PRESENTACION CON DESCRIPCION, CAPTURAR SU ID Y MODIFICAR ID DE PRESENTACION EN ITEM MEDICAMENO
        const idPresentacion = await Medicamento.agregarPresentacion(presentacionIngresada.descripcion, transaction);
        //ASIGNAR PRESENTACION AL MEDICAMENTO
        await Medicamento.asignarPresentacionMedicamento(medicamento_id, idPresentacion, transaction);
        //ASIGNAR PRESENTACION AL MEDICAMENTO ITEM(INDIVIDUAL)
        await Medicamento.medicamentoItemModificarIdPresentacion(idPresentacion, item_id, transaction);
      } else {
        return res.status(400).json({ message: 'Presentacion ingresada no valido' });
      }
    }

    // CONCENTRACION---------------------------------------------------------------------------------------------------------------------------------
    if (concentracionIngresada.asignarExistente) {

      //VALIDAR SI CONCENTRACION ID ESTA ASIGNADA AL MEDICAMENTO
      const existe = await Medicamento.validarConcentracionIdEnMedicamento(medicamento_id, concentracionIngresada.id, transaction);
      if (!existe) {
        //SI CONCENTRACION ID NO ESTA ASIGNADA AL MEDICAMENTO: ASIGNARLA
        await Medicamento.asignarConcentracionMedicamento(medicamento_id, concentracionIngresada.id, transaction);
      }
      //ASIGNAR EL ID CONCENTRACION AL ITEM MEDICAMENTO
      await Medicamento.medicamentoItemModificarIdConcentracion(concentracionIngresada.id, item_id, transaction);

    } else if (concentracionIngresada.crearYasignar) {
      //CREAR NUEVA Y ASIGNARLA A ITEM Y A MEDICAMENTO: validar descripcion
      const concentracionValidacion = validarConcentracion(concentracionIngresada.descripcion);
      if (concentracionValidacion) {
        // CREAR UNA CONCENTRACION CON DESCRIPCION, CAPTURAR SU ID Y MODIFICAR ID DE CONCENTRACION EN ITEM MEDICAMENO
        const idConcentracion = await Medicamento.agregarConcentracion(concentracionIngresada.descripcion, transaction);
        //ASIGNAR CONCENTRACION AL MEDICAMENTO
        await Medicamento.asignarConcentracionMedicamento(medicamento_id, idConcentracion, transaction);
        //ASIGNAR ID CONCENTRACION AL MEDICAMENTO ITEM
        await Medicamento.medicamentoItemModificarIdConcentracion(idConcentracion, item_id, transaction);
      } else {
        return res.status(400).json({ message: 'Concentracion ingresada no valido' });
      }
    }

    // ESTADO
    if (estadoIngresado.modificar) {
      await Medicamento.modificarEstadoItemMedicamento(estadoIngresado.valor, item_id, transaction);
    }

    await transaction.commit();
    return res.status(200).json({ message: 'Medicamento modificado exitosamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al modificar medicamento item:', error);
    return res.status(500).json({ message: 'Error al modificar medicamento item: ' + error.message });
  }
}





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

// MEDICAMENTO NUEVO SE AGREGA JUNTO CON EL PRIMER ITEM
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
      return res.status(400).json({ error: 'Nombre genérico debe contener solo letras, números y espacios, min 6 y max 100 caracteres.' });
    }


    const nombreComercialRegex = /^[a-zA-Z\s]{6,99}$/;
    if (nombreComercial !== '') {
      nombreComercial = nombreComercial.trim().toUpperCase();
      if (!nombreComercialRegex.test(nombreComercial)) {
        return res.status(400).json({ error: 'Nombre comercial debe contener solo letras y espacios, min 6 y max 99 caracteres.' });
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
  agregarMedicamentoNuevoEitem,
  mostrarFormModificarMedicamento,
  modificarMedicamento,
  modificarMedicamentoItem
};