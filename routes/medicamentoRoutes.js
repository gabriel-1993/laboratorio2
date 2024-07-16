// routes/taskRoutes.js
import express from 'express';
const router = express.Router();
import medicamentoController from '../controllers/medicamentoController.js';



router.get("/agregarMedicamento", medicamentoController.mostrarFormAgregarMedicamento);




export default router;