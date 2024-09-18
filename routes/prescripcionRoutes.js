import express from 'express';
const router = express.Router();
import prescripcionController from '../controllers/prescripcionController.js';
import pacienteController from '../controllers/pacienteController.js';
import medicamentoController from '../controllers/medicamentoController.js';
import prestacionController from '../controllers/prestacionController.js';


// import { buildPDF } from '../public/js/pdfKit.js';

import { buildPDF } from '../public/js/pdfKit.js';
import { PassThrough } from 'stream'; // Para manejar el stream de PDF

//AGREGAR PACIENTE
//Renderizar la vista/form de agregar PRESCRIPCION
router.get("/agregarPrescripcion", prescripcionController.mostrarFormAgregarPrescripcion);


router.post('/buscarDocumento', pacienteController.buscarPacientePorDocumento);

router.post('/buscarObraYplanPacienteId', pacienteController.buscarObraYplanPacienteId);

router.get('/obtenerMedicamentosItems', medicamentoController.buscarTodosItemsMedicamentosDisponibles);

router.get("/obtenerPrestacionesYlados", prestacionController.obtenerPrestacionesYlados);

router.post('/agregarPrescripcion', prescripcionController.agregarPrescripcionCompleta);

router.post("/obtenerPrescripcionesAnteriores", prescripcionController.obtenerPrescripcionesAnteriores);

router.post("/modificarPrescripcion", prescripcionController.mostrarFormModificarPrescripcion);


router.get("/descargarPdf", (req, res) => {
    const prescripcion = JSON.parse(atob(req.query.prescripcion));
    const paciente = JSON.parse(atob(req.query.paciente));
    const datosProfesional = JSON.parse(atob(req.query.profesional));

    // Crear un stream para manejar los datos del PDF
    const stream = new PassThrough();

    // Configurar las cabeceras de respuesta para descargar el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=prescripcion.pdf');

    // Pasar los datos del stream a la respuesta
    stream.pipe(res);

    // Generar el PDF con los datos recibidos
    buildPDF(
        (data) => stream.write(data),
        () => stream.end(),
        paciente,
        datosProfesional,
        prescripcion
    );
});


export default router;
