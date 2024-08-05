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

// //MODIFICAR PRESTACION LADOS
// //Renderizar la vista/form modificar prestacion
// router.get("/modificarPrestacion", prestacionController.mostrarFormModificarPrestacion);

// //AGREGAR PRESTACION Y LADO/LADOS cuando sea necesario
// router.post('/modificarPrestacionLados', prestacionController.modificarPrestacionLados);

// //Renderizar la vista/form para mostrar lista de prestaciones / lados
// router.get("/buscarPrestaciones", prestacionController.formMostrarListaPrestacionesLados);

export default router;











