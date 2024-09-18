import PDFDocument from 'pdfkit';


export function buildPDF(dataCallback, endCallback, paciente, datosProfesional, prescripcion) {
    const doc = new PDFDocument();

    // Enviar datos a través del callback
    doc.on('data', dataCallback);

    // Finalizar el envío cuando se complete la generación del PDF
    doc.on('end', endCallback);

    // Añadir contenido al PDF con los datos recibidos
    doc.text(`Fecha de prescripcion: ${prescripcion.fecha}`);
    doc.fontSize(18).text('Receta Médica', { align: 'center',underline: true });

    doc.moveDown();
    doc.fontSize(14).text('Datos Profesional:', { underline: true });
    doc.fontSize(12).text(`Médico: ${datosProfesional.nombre} ${datosProfesional.apellido} - Documento: ${datosProfesional.documento} `);
    doc.fontSize(12).text(`Profesion: ${datosProfesional.profesion} - Especialidad: ${datosProfesional.especialidad}`);
    doc.fontSize(12).text(`Matricula: ${datosProfesional.matricula}`);

    doc.moveDown();
    doc.fontSize(14).text('Datos paciente:', { underline: true });
    doc.fontSize(12).text(`Documento: ${paciente.documento} - Fecha de nacimiento: ${paciente.fecha_nacimiento}`);
    doc.fontSize(12).text(`Paciente: ${paciente.nombre} ${paciente.apellido}`);
    if(paciente.alergia!=""){
        doc.fontSize(12).text(`Alergia: ${paciente.alergia} - Genero: ${paciente.sexo}`);
    }else{
        doc.fontSize(12).text(`Alergia: "Dato desconocido" - Genero: ${paciente.sexo}`);
    }
    doc.fontSize(12).text(`Telefono: ${paciente.telefono}`);

    doc.moveDown();
    doc.fontSize(12).text('Prescripción:', { underline: true });
    doc.fontSize(12).text(`Diagnostico: ${prescripcion.diagnostico}`);
    doc.fontSize(12).text(`Vigencia: ${prescripcion.vigencia}`);

    doc.moveDown();
    doc.fontSize(14).text('Medicamentos prescriptos', { underline: true });
    if (prescripcion.medicamentos.length > 0){
        prescripcion.medicamentos.forEach((medicamento, index) => {
            doc.moveDown();
            doc.fontSize(12).text(`Medicamento: ${medicamento.nombre_generico}`);
            doc.fontSize(12).text(`Forma farmaceutica: ${medicamento.descripcion_item.descripcion_forma}`);
            doc.fontSize(12).text(`Presentacion: ${medicamento.descripcion_item.descripcion_presentacion}`);
            doc.fontSize(12).text(`Concentracion: ${medicamento.descripcion_item.descripcion_concentracion}`);
            doc.fontSize(12).text(`Duracion: ${medicamento.duracion}`);
            doc.fontSize(12).text(`Administracion: ${medicamento.administracion}`);
        });
    }else{
        doc.fontSize(12).text(`No se recetaron medicamentos.`);

    }


    doc.moveDown();
    doc.fontSize(14).text('Estudios prescriptos', { underline: true });
    doc.moveDown();

    if (prescripcion.prestaciones.length > 0) {
        prescripcion.prestaciones.forEach((prestacion, index) => {
            doc.fontSize(12).text(`Estudio: ${prestacion.descripcion_prestacion}`);
            if(prestacion.descripcion_lado != ""){
                doc.fontSize(12).text(`Lado: ${prestacion.descripcion_lado}`);
            }else{
                doc.fontSize(12).text(`No aplica/Desconocido`);
            }
            doc.fontSize(12).text(`Indicacion: ${prestacion.indicacion}`);
            doc.fontSize(12).text(`Justificacion: ${prestacion.justificacion}`);
            if(prestacion.conclucionFinal != "" || prestacion.conclucionFinal != null){
                doc.fontSize(12).text(`Conclucion final: ${prestacion.conclucionFinal}`);
            }else{
                doc.fontSize(12).text(`Dato desconocido`);
            }
        });
    }

    // Finalizar el documento
    doc.end();
}
