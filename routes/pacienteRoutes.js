// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import pacienteController from '../controllers/pacienteController.js';

//Renderizar la vista/form de agregar Medicamento
router.get("/agregarPaciente", pacienteController.mostrarFormAgregarPaciente);

// Ruta para buscar un paciente por documento
router.post('/buscarDocumento', pacienteController.buscarPacientePorDocumento);

//Buscar todos los pacientes
router.get('/obtenerPacientes', pacienteController.obtenerTodosLosPacientes);

// Ruta para Agregar paciente nuevo
router.post('/agregarPaciente', pacienteController.crearPaciente);


export default router;
