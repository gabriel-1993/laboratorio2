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




export default router;