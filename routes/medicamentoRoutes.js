// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import medicamentoController from '../controllers/medicamentoController.js';

//Renderizar la vista/form de agregar Medicamento
router.get("/agregarMedicamento", medicamentoController.mostrarFormAgregarMedicamento);

//OBTENER todos los medicamentos, formas , categorias, formas, presentaciones y concentraciones de la base
router.get("/medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones", medicamentoController.obtenerMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones)

// Consultar si el nombre existe, traer datos principales del medicamento
router.get('/buscarNombreGenerico', medicamentoController.buscarNombreGenerico);

//medicamento.id: Consultar formas farmaceuticas ,presentaciones y concentraciones de medicamento especifico
router.get('/buscarItemsMedicamento', medicamentoController.buscarItemsMedicamento)

//Medicamento(nombre_generico) encontrado. Agregar medicamento: se agregan nuevos items al medicamento existente
router.post('/agregarItemMedicamento', medicamentoController.agregarItemMedicamento);

//Medicamento NUEVO (nombre_generico no encontrado) se agrega el medicamento y luego se agrega el primer item del medicamento creado
router.post('/agregarMedicamentoNuevoEitem', medicamentoController.agregarMedicamentoNuevoEitem);

//MODIFICAR MEDICAMENTO
router.get("/modificarMedicamento", medicamentoController.mostrarFormModificarMedicamento);

//MODIFICAR DATOS DEL MEDICAMENTO ( NO ITEM )
router.post("/modificarMedicamento", medicamentoController.modificarMedicamento);

//MODIFICAR DATOS DE MEDICAMENTO ITEM
router.post("/modificarMedicamentoItem", medicamentoController.modificarMedicamentoItem);

export default router;