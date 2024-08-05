import ObraSocial from '../models/obraSocialModel.js';
import sequelize from '../sequalize.js';


// RENDERIZAR FORM PRINCIPAL PARA AGREGAR OBRA SOCIAL
const mostrarFormAgregarObraSocial = (req, res) => {
  if (req.session.user && req.session.user.roles.some(role => role.rol_descripcion === 'ADMINISTRADOR')) {
    res.render('formCrearObraSocial');
  } else {
    res.status(403).json({ mensaje: 'Acceso denegado' });
  }
};



//Obtener/Consultar todas las  ObrasSocialesYplanes en la base
const obtenerObrasSocialesYplanes = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const [allObrasSociales, allPlanes] = await Promise.all([
      ObraSocial.buscarObrasSociales(transaction),
      ObraSocial.buscarPlanes(transaction)
    ]);

    await transaction.commit();
    return res.status(200).json({
      allObrasSociales,
      allPlanes
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al obtener todas las obras sociales y planes:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}


//AGREGAR OBRA SOCIAL Y AGREGAR/ASIGNAR PLAN/ES

// EXPRESIONES REGULARES
function validarTelefono(telefono) {
  const regex = /^\+?[1-9]\d{1,14}$/;
  if (!regex.test(telefono)) {
    return { valido: false, mensaje: 'El número de teléfono debe comenzar con un código de país y contener solo dígitos. Ejemplo: +542664123456' };
  }
  return { valido: true };
}

function validarDireccion(direccion) {
  const regex = /^[A-Za-z\s,.'0-9]+$/;
  if (!regex.test(direccion)) {
    return { valido: false, mensaje: 'Dirección puede contener letras (sin tildes), números, espacios, comas, puntos y apóstrofes. Ejemplo: Argentina, San Luis Capital. San Martin 456.' };
  }
  return { valido: true };
}

function validarDescripcion(obraSocialIngresada) {
  if (obraSocialIngresada.length < 4 || obraSocialIngresada.length > 100) {
    return { valido: false, mensaje: 'La descripción debe tener entre 4 y 100 caracteres.' };
  }
  const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
  if (!regex.test(obraSocialIngresada)) {
    return { valido: false, mensaje: 'La descripción solo puede contener letras y espacios.' };
  }
  return { valido: true };
}

function validarPlan(planIngresado) {
  if (planIngresado.length < 4 || planIngresado.length > 30) {
    return { valido: false, mensaje: 'El Plan debe tener entre 4 y 30 caracteres.' };
  }
  const regex = /^[A-Za-z ]{4,30}$/;
  if (!regex.test(planIngresado)) {
    return { valido: false, mensaje: 'El Plan solo puede contener letras y espacios.' };
  }
  return { valido: true };
}


//AGREGAR OBRA SOCIAL Y AGREGAR/ASIGNAR PLAN/ES

async function agregarObraSocialConPlan(req, res) {
  const { obraSocialIngresada, telefonoIngresado, direccionIngresada, estadoIngresado, planesAsignados } = req.body;

  // Validaciones
  let validacion1 = validarDescripcion(obraSocialIngresada);
  if (!validacion1.valido) {
      return res.status(400).json({ message: validacion1.mensaje });
  }

  let validacion2 = validarTelefono(telefonoIngresado);
  if (!validacion2.valido) {
      return res.status(400).json({ message: validacion2.mensaje });
  }

  let validacion3 = validarDireccion(direccionIngresada);
  if (!validacion3.valido) {
      return res.status(400).json({ message: validacion3.mensaje });
  }

  if (estadoIngresado !== 1 && estadoIngresado !== 0) {
      return res.status(400).json({ message: 'ESTADO ES OBLIGATORIO' });
  }

  if (!planesAsignados.length) {
      return res.status(400).json({ message: 'MINIMO DEBE ASIGNAR UN PLAN A OBRA SOCIAL' });
  }

  const transaction = await sequelize.transaction(); // Iniciar transacción

  try {
      // AGREGAR OBRA SOCIAL Y RECUPERAR ID PARA ASIGNAR PLAN/ES
      let idObraSocial = await ObraSocial.agregarObraSocial(
          obraSocialIngresada,
          telefonoIngresado,
          direccionIngresada,
          estadoIngresado,
          transaction 
      );

      // Recorrer planes y agregar/asignar
      for (const element of planesAsignados) {
          if (element.agregar) {
              // Agregar nuevo plan y recuperar su id
              const idPlan = await ObraSocial.agregarPlan(element.nombre, transaction );
              // Asignar nuevo plan a obra social
              await ObraSocial.asignarPlan(idObraSocial, idPlan, transaction);
          } else if (element.asignar) {
              await ObraSocial.asignarPlan(idObraSocial, element.id, transaction);
          }
      }

      await transaction.commit(); // Commit de la transacción si todo sale bien
      return res.status(200).json({ message: 'Obra social y planes agregados exitosamente.' });

  } catch (error) {
      await transaction.rollback(); // Rollback en caso de error
      console.error('Error al agregar obra social con planes:', error);
      return res.status(500).json({ message: 'Error al agregar obra social con planes.' });
  }
}



export default {
  mostrarFormAgregarObraSocial,
  obtenerObrasSocialesYplanes,
  agregarObraSocialConPlan
};