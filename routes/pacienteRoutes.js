// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import pacienteController from '../controllers/pacienteController.js';

//AGREGAR PACIENTE
//Renderizar la vista/form de agregar Medicamento
router.get("/agregarPaciente", pacienteController.mostrarFormAgregarPaciente);

// Ruta para buscar un paciente por documento
router.post('/buscarDocumento', pacienteController.buscarPacientePorDocumento);

//Buscar todos los pacientes
router.get('/obtenerPacientes', pacienteController.obtenerTodosLosPacientes);

// Ruta para Agregar paciente nuevo
router.post('/agregarPaciente', pacienteController.crearPaciente);


// RENFERIZAR FORM MODIFICAR PACIENTE
router.get("/modificarPaciente", pacienteController.mostrarFormModificarPaciente);

//MODIFICAR PACIENTE 
router.post("/modificarPaciente", pacienteController.modificarPaciente)

router.get('/buscarPacientes', pacienteController.mostrarFormListaPacientes);
// reutilizar :
// router.get('/obtenerPacientes', pacienteController.obtenerTodosLosPacientes);


export default router;
