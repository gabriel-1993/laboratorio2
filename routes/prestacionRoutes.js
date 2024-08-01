// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import prestacionController from '../controllers/prestacionController.js';




//Renderizar la vista/form de agregar prestacion
router.get("/agregarPrestacion", prestacionController.mostrarFormAgregarPrestacion);

//Obtener todas las prestaciones y todos los lados para mostrar en las listas
router.get("/obtenerPrestacionesYlados", prestacionController.obtenerPrestacionesYlados);

//AGREGAR PRESTACION Y LADO/LADOS cuando sea necesario
router.post('/agregarPrestacionLados', prestacionController.agregarPrestacionLados);


//MODIFICAR PRESTACION LADOS
//Renderizar la vista/form modificar prestacion
router.get("/modificarPrestacion", prestacionController.mostrarFormModificarPrestacion);

//AGREGAR PRESTACION Y LADO/LADOS cuando sea necesario
router.post('/modificarPrestacionLados', prestacionController.modificarPrestacionLados);

//Renderizar la vista/form para mostrar lista de prestaciones / lados
router.get("/buscarPrestaciones", prestacionController.formMostrarListaPrestacionesLados);

export default router;