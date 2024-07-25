// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import medicamentoController from '../controllers/medicamentoController.js';


//Renderizar la vista/form de agregar Medicamento
router.get("/agregarMedicamento", medicamentoController.mostrarFormAgregarMedicamento);

router.get("/medicamentosFormasPresentacionesConcentraciones", medicamentoController.obtenerMedicamentosFormasPresentacionesConcentraciones)

// Consultar si el nombre existe, traer datos principales del medicamento
router.get('/buscarNombreGenerico', medicamentoController.buscarNombreGenerico);

//medicamento.id: Consultar formas farmaceuticas ,presentaciones y concentraciones de medicamento especifico
router.get('/buscarItemsMedicamento', medicamentoController.buscarItemsMedicamento)

//Medicamento(nombre_generico) encontrado al agregar medicamento: se agregan nuevos items del medicamento existente
router.post('/agregarItemMedicamento', medicamentoController.agregarItemMedicamento);



export default router;