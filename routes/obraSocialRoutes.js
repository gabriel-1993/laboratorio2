// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import obraSocialController from '../controllers/obraSocialController.js';




//Renderizar la vista/form de agregarObraSocial
router.get("/agregarObraSocial", obraSocialController.mostrarFormAgregarObraSocial);

//Obtener todas las prestaciones y todos los lados para mostrar en las listas
router.get("/obtenerObrasSocialesYplanes", obraSocialController.obtenerObrasSocialesYplanes);

// //AGREGAR OBRA SOCIAL Y PLAN/ES AGREGAR/ASIGNAR
router.post('/agregarObraSocialConPlan', obraSocialController.agregarObraSocialConPlan);

//MODIFICAR OBRA SOCIAL - PLAN/ES
router.get("/modificarObraSocial", obraSocialController.mostrarFormModificarObraSocial);

//Obtener todos los planes asignados a obrasocial por id
router.post("/obtenerPlanesAsignados", obraSocialController.obtenerPlanesAsignados);

//Modificar obra social y plan/es
router.post('/modificarObraSocialPlanes', obraSocialController.modificarObraYplan);

//Buscar lista de obras sociales
router.get("/buscarObrasSociales", obraSocialController.mostrarFormBuscarObrasSociales);




// //Renderizar la vista/form para mostrar lista de prestaciones / lados
// router.get("/buscarPrestaciones", prestacionController.formMostrarListaPrestacionesLados);

export default router;











