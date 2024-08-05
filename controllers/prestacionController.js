import { Transaction } from 'sequelize';
import Prestacion from '../models/prestacionModel.js';
import sequelize from '../sequalize.js';


// RENDERIZAR FORM PRINCIPAL PARA AGREGAR PRESTACION
const mostrarFormAgregarPrestacion = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formCrearPrestacion');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};


// RENDERIZAR FORM PRINCIPAL PARA MODIFICAR PRESTACION
const mostrarFormModificarPrestacion = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formModificarPrestacion');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};

//RENDERIZAR LISTA DE PRESTACIONES / LADOS
const formMostrarListaPrestacionesLados = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formMostrarListaPrestacionesLados');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
}

//Obtener/Consultar todas las prestaciones y todos los lados en la base
const obtenerPrestacionesYlados = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const [prestaciones, lados] = await Promise.all([
      Prestacion.buscarPrestaciones(transaction),
      Prestacion.buscarLados(transaction)
    ]);

    await transaction.commit();
    return res.status(200).json({
      prestaciones,
      lados
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al obtener todas las prestaciones y lados:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}


//Agregar Prestacion y Agregar Lados(si es necesario)

async function agregarPrestacionLados(req, res) {
  const { prestacionIngresada, ladosAsignados } = req.body;
  const prestacionRegex = /^[A-Za-z\s]+$/;
  const ladoRegex = /^[A-Za-z,\s]{5,100}$/;

  // Validación de prestacionIngresada
  if (!prestacionIngresada || !prestacionRegex.test(prestacionIngresada.descripcion)) {
    return res.status(400).json({ message: 'Descripción de la prestación inválida o vacía' });
  }

  // Validación de ladosAsignados
  if (ladosAsignados.length) {
    for (let lado of ladosAsignados) {
      if (!ladoRegex.test(lado.descripcion)) {
        return res.status(400).json({ message: `Descripción del lado inválida: ${lado.descripcion}` });
      }
    }
  }

  // Parsear el estado a entero
  const estadoParseado = parseInt(prestacionIngresada.estado, 10);

  // Inicia una transacción
  const transaction = await sequelize.transaction();
  try {
    // Agregar la prestación
    await Prestacion.agregarPrestacion(prestacionIngresada.descripcion, estadoParseado, transaction);

    // Agregar los lados asociados si existen
    if (ladosAsignados.length) {
      for (let lado of ladosAsignados) {
        if (lado.agregar) {
          await Prestacion.agregarLado(lado.descripcion, transaction);
        }
      }
    }

    // Confirma la transacción
    await transaction.commit();
    res.status(201).json({ message: 'Prestación y lados agregados exitosamente' });
  } catch (error) {
    // Si hay un error, se realiza rollback
    await transaction.rollback();
    res.status(500).json({ message: 'Error al agregar prestación', error: error.message });
  }
}



//MODIFICAR PRESTACION LADOS-------------------------------------------------------------------------------------
async function modificarPrestacionLados(req, res) {

  let { prestacionIngresada, ladosAsignados } = req.body;

  const prestacionRegex = /^[A-Za-z\s]+$/;
  const ladoRegex = /^[A-Za-z,\s]{5,100}$/;


  // Validación de prestacionIngresada
  if (!prestacionIngresada || !prestacionRegex.test(prestacionIngresada.descripcion)) {
    return res.status(400).json({ message: 'Descripción de la prestación inválida o vacía.' });
  }

  // Validación de ladosAsignados
  if (ladosAsignados.length) {
    for (let lado of ladosAsignados) {
      if (!ladoRegex.test(lado.descripcion)) {
        return res.status(400).json({ message: `Descripción del lado inválida: ${lado.descripcion}.` });
      }
    }
  }

  //SI CUMPLE LAS VALIDACIONES CONTINUA CON EL MODEL
  const transaction = await sequelize.transaction();

  try {
    if (prestacionIngresada.modificarEstado || prestacionIngresada.modificarDescripcion) {

      // Convertir el string a un entero
      let idInt = parseInt(prestacionIngresada.id, 10);
      let estadoInt = parseInt(prestacionIngresada.estado, 10);

      await Prestacion.modificarPrestacion(prestacionIngresada.descripcion, estadoInt, idInt, transaction);

    }

    // Agregar los lados asociados si existen
    if (ladosAsignados.length) {
      for (let lado of ladosAsignados) {
        if (lado.agregar) {
          await Prestacion.agregarLado(lado.descripcion, transaction);
        }
      }
    }
    // Commit si se realizaron modificaciones
    await transaction.commit();
    return res.status(200).json({ message: 'Medicamento modificado exitosamente' });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al modificar medicamento:', error);
    return res.status(500).json({ message: 'Error al modificar medicamento: ' + error.message });
  }
}

export default {
  mostrarFormAgregarPrestacion,
  obtenerPrestacionesYlados,
  agregarPrestacionLados,
  mostrarFormModificarPrestacion,
  modificarPrestacionLados,
  formMostrarListaPrestacionesLados
};