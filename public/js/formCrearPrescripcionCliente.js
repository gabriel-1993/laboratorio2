import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, ocultarLista, renderizarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'

document.addEventListener('DOMContentLoaded', async () => {

    // VARIABLES CON MAYOR SCOPE
    let medicamentosAgregados = [];
    let prestacionesAgregadas = [];
    let ladosAgregados = [];
    let datosProfesional;
    let paciente;

    //PROFESIONAL
    const [nombreProf, apellidoProf, documentoProf, profesionProf, especialidadProf, matriculaProf, domicilioProf] =
        ['#profNombre', '#profApellido', '#profDocumento', '#profProfesion', '#profEspecialidad', '#profMatricula', '#profDomicilio']
            .map(selector => document.querySelector(selector));


    //PACIENTE
    const [documentoPac, obraSocialPac, planPac, apellidoPac, nombrePac, telefonoPac, generoPac, alergiaPac, nacimientoPac] =
        ['#documento', '#pac_obra_social', '#pac_plan', '#pacApellido', '#pacNombre', '#pacTelefono', '#pacGenero', '#pacAlergia', '#pacFechaNacimiento']
            .map(selector => document.querySelector(selector));
    //al encontrar paciente mostrar demas inputs debajo de documento con los datos
    const divMasCampos = document.querySelector('.divMasCampos');
    const divPrescAnteriores = document.querySelector('.divPrescAnteriores');
    //setear fecha actual
    const inputFecha = document.querySelector('#inputFecha');
    const today = new Date().toISOString().split('T')[0];
    inputFecha.value = today;
    inputFecha.disabled = true;
    //Diagnostico
    const DiagnosticoInput = document.querySelector('#diagnostico');


    // MEDICAMENTO
    const btnAgregarOtro = document.querySelector('.btnAgregarOtro');
    const medicamentoInput = document.querySelector('#medicamentoItem');
    const administracionInput = document.querySelector('#administracion');
    const duracionInput = document.querySelector('#duracion');
    const divMedicamentosAgregados = document.querySelector('.divMedicamentosAgregados');

    //PRESTACION
    const btnAgregarOtra = document.querySelector('.btnAgregarOtra');
    const divPrestacionesAgregadas = document.querySelector('.divPrestacionesAgregadas');

    const selectVigencia = document.querySelector('#vigencia');
    const btnEnviarPrescripcion = document.querySelector('.btnAgregarPrescripcion');


    //Cargar datos del profesional desde sessionStorage y fetch
    async function cargarDatosProfesional() {
        datosProfesional = JSON.parse(sessionStorage.getItem('datosProfesional'));
        if (!datosProfesional) return console.log('No se encontraron datos del profesional en sessionStorage.');

        [profesionProf.value, especialidadProf.value, matriculaProf.value, domicilioProf.value] =
            [datosProfesional.profesion, datosProfesional.especialidad, datosProfesional.matricula, datosProfesional.domicilio];

        try {
            const response = await fetch('/buscarUsuarioId', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: datosProfesional.usuario_id })
            });

            if (!response.ok) throw new Error('Usuario no encontrado');

            const { nombre, apellido, documento } = await response.json();
            datosProfesional.nombre=nombre;
            datosProfesional.apellido=apellido;
            datosProfesional.documento=documento;
            [nombreProf.value, apellidoProf.value, documentoProf.value] = [nombre, apellido, documento];
        } catch (error) {
            console.error('Error al buscar el usuario:', error);
        }
    }

    cargarDatosProfesional();

    //FETCH OBTENER TODOS LOS PACIENTES
    async function fetchObtenerTodosLosPacientes() {
        try {
            const response = await fetch('/obtenerPacientes', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok ? await response.json() : [];
        } catch (error) {
            mostrarMsjCliente('Error conexion', ['Error al obtener los pacientes:', error.message]);
            return [];
        }
    }

    const pacientes = await fetchObtenerTodosLosPacientes();
    configurarInputConLista('#documento', '.pacientes-list', pacientes);

    function validarDocumento(documento) {
        return /^\d{6,20}$/.test(documento);
    }

    //FETCH VALIDAR DOCUMENTO: trae datos de paciente si existe
    async function fetchVerificarDocumento(documento) {
        try {
            const response = await fetch('/buscarDocumento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documento }),
            });
            return response.ok ? await response.json() : false;
        } catch (error) {
            console.error('Error al verificar el paciente:', error.message);
            return false;
        }
    }

    //Paciente encontrado: buscar obra social y plan
    async function buscarObraYPlanPaciente(id) {
        try {
            const response = await fetch('/buscarObraYplanPacienteId', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error('Error en la solicitud');

            const { obra_social, plan } = await response.json();
            return { obra_social, plan };
        } catch (error) {
            console.error('Error en la solicitud:', error.message);
            return null;
        }
    }



    // FETCH PRESCRIPCIONES ANTERIORES
    async function fetchObtenerPrescripcionesAnteriores(paciente_id) {
        try {
            const response = await fetch('/obtenerPrescripcionesAnteriores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paciente_id })
            });

            if (response.ok) {
                return await response.json();
            } else {
                return [];
            }
        } catch (error) {
            mostrarMsjCliente('Error conexión', ['Error al obtener las prescripciones anteriores', error.message]);
            return [];
        }
    }

    //BUSCAR PACIENTE : DOCUMENTO ENCONTRADO MOSTRAR FORM CON LOS DATOS / SINO : MOSTRAR CARTEL CON ENLACE PARA CREAR PACIENTE
    document.querySelector('.btnBuscar').addEventListener('click', async () => {
        let documento = documentoPac.value.trim();
        if (!documento) {
            return mostrarMsjCliente('Documento obligatorio', ['Documento vacío, debe ingresar el número de documento.']);
        }
        if (!validarDocumento(documento)) {
            return mostrarMsjCliente('Documento incorrecto', ['El documento debe tener solo números y una longitud mínima de 6 y máxima de 12.']);
        }

        documento = parseInt(documento, 10);
        paciente = await fetchVerificarDocumento(documento);
        // CARGAR DATOS PACIENTE ENCONTRADO O MOSTRAR CARTEL CON ENLACE PARA CREAR PACIENTE
        if (paciente) {
            const obraYplan = await buscarObraYPlanPaciente(paciente.id);
            divMasCampos.classList.remove('displayNone');
            [apellidoPac.value, nombrePac.value, telefonoPac.value, generoPac.value, alergiaPac.value, nacimientoPac.value] =
                [paciente.apellido, paciente.nombre, paciente.telefono || 'DATO DESCONOCIDO', paciente.sexo, paciente.alergia || 'DATO DESCONOCIDO', paciente.fecha_nacimiento];
            [obraSocialPac.value, planPac.value] = obraYplan ? [obraYplan.obra_social || 'DATO DESCONOCIDO', obraYplan.plan || 'DATO DESCONOCIDO'] : ['DATO DESCONOCIDO', 'DATO DESCONOCIDO'];


            //CARGAR PRESCRIPCIONES ANTERIORES(paciente encontrado)
            console.log(paciente);
            let prescripcionesAnteriores = await fetchObtenerPrescripcionesAnteriores(paciente.id);
            console.log(prescripcionesAnteriores);
            const pPrescripcionesAnt = document.querySelector('.pPrescripcionesAnt');

            if (prescripcionesAnteriores.length === 0) {

                pPrescripcionesAnt.innerHTML = 'No hay prescripciones anteriores registradas para este paciente.';
            } else {
                pPrescripcionesAnt.classList.add('displayNone');
                for (const prescripcion of prescripcionesAnteriores.data) {

                    //prescripcion para el PDF
                    const cardPrescripcion = document.createElement('div');

                    const pdf = document.createElement('i');
                    pdf.classList.add('fa-regular');
                    pdf.classList.add('fa-file-pdf');
                    pdf.classList.add('btnPdf');
                    pdf.style.color = "#fff";
                    pdf.style.cursor = "pointer";
                    pdf.style.fontSize = "17px";

                    console.log("para pdf");

                    console.log(paciente);
                    console.log(datosProfesional);
                    console.log(prescripcion);

                    //prescripcion en data para el btn pdf
                    const dataPrescripcion = btoa(JSON.stringify(prescripcion));
                    const dataProfesional = btoa(JSON.stringify(datosProfesional));
                    const dataPaciente = btoa(JSON.stringify(paciente));
                    pdf.setAttribute('data-prescripcion', dataPrescripcion);
                    pdf.setAttribute('data-profesional', dataProfesional);
                    pdf.setAttribute('data-paciente', dataPaciente);





                    cardPrescripcion.classList.add('displayFlex');
                    cardPrescripcion.classList.add('column');
                    cardPrescripcion.classList.add('cardPrescripcionAnterior');
                    const h4 = document.createElement('h5');
                    h4.classList.add('text-fondoAzul');
                    h4.classList.add('borderRadiusTop5px');
                    h4.textContent = `Fecha de Prescripcion: ${prescripcion.fecha}`;
                    h4.appendChild(pdf);
                    h4.style.display = "flex";
                    h4.style.justifyContent = "space-between";
                    cardPrescripcion.appendChild(h4);

                    const div = document.createElement('div');
                    div.id = 'width100';
                    div.classList.add('displayFlex');
                    div.classList.add('column');
                    const div1 = document.createElement('div');
                    div1.id = 'width100';
                    const label1 = document.createElement('label');
                    label1.textContent = "Vigencia";
                    label1.classList.add('labelCenter130px');
                    const input1 = document.createElement('input');
                    input1.value = prescripcion.vigencia;
                    div1.appendChild(label1);
                    div1.appendChild(input1);
                    div.appendChild(div1);
                    cardPrescripcion.appendChild(div);

                    const div2 = document.createElement('div');
                    div2.id = 'width100';
                    const label2 = document.createElement('label');
                    label2.textContent = "Diagnóstico";
                    label2.classList.add('labelCenter130px');
                    const input2 = document.createElement('input');
                    input2.value = prescripcion.diagnostico;
                    div2.appendChild(label2);
                    div2.appendChild(input2);
                    div.appendChild(div2);
                    cardPrescripcion.appendChild(div);

                    // Contenedor para medicamentos
                    let contenedorMedicamentos = document.createElement('div');
                    contenedorMedicamentos.classList.add('displayFlex');
                    contenedorMedicamentos.classList.add('column');
                    contenedorMedicamentos.innerHTML = '';
                    const h4m = document.createElement('h5');
                    h4m.classList.add('textcenter');
                    h4m.classList.add('text-fondoCeleste')
                    h4m.textContent = "Medicamentos prescriptos";
                    contenedorMedicamentos.appendChild(h4m);

                    if (prescripcion.medicamentos && prescripcion.medicamentos.length > 0) {
                        for (const medicamento of prescripcion.medicamentos) {
                            const cardItem = document.createElement('div');
                            cardItem.style.marginRight = "3px";
                            cardItem.style.marginLe = "3px";
                            cardItem.id = 'width100';
                            cardItem.classList.add('cardItem')


                            const h4 = document.createElement('h5');
                            h4.classList.add('text-fondoAzul');
                            h4.classList.add('borderRadiusTop5px');
                            h4.textContent = `Medicamento Item ID ${medicamento.medicamento_item_id}`;
                            cardItem.appendChild(h4);

                            // Primer renglón con datos del medicamento
                            const divDatos1 = document.createElement('div');
                            divDatos1.id = 'width100';
                            divDatos1.classList.add('divFlexRow');
                            divDatos1.classList.add('datosItem');

                            // Nombre genérico
                            const divMedicamento = document.createElement('div');
                            const labelMedicamento = document.createElement('label');
                            labelMedicamento.classList.add('labelCenter');
                            labelMedicamento.classList.add('labelCenter142px');
                            labelMedicamento.textContent = 'Nombre Genérico';

                            const inputMedicamento = document.createElement('input');
                            inputMedicamento.value = medicamento.nombre_generico;
                            inputMedicamento.classList.add('inputItemMedicamento');

                            divMedicamento.appendChild(labelMedicamento);
                            divMedicamento.appendChild(inputMedicamento);
                            divMedicamento.classList.add('datoItem');

                            divDatos1.appendChild(divMedicamento);

                            // Forma farmacéutica
                            const divForma = document.createElement('div');
                            const labelForma = document.createElement('label');
                            labelForma.classList.add('labelCenter');
                            labelForma.classList.add('labelCenter142px');
                            labelForma.textContent = 'Forma farmacéutica';

                            const inputForma = document.createElement('input');
                            inputForma.value = medicamento.descripcion_item.descripcion_forma;
                            inputForma.classList.add('inputItemMedicamento');

                            divForma.appendChild(labelForma);
                            divForma.appendChild(inputForma);
                            divForma.classList.add('datoItem');

                            divDatos1.appendChild(divForma);

                            // Segundo renglón con datos del medicamento
                            const divDatos2 = document.createElement('div');
                            divDatos2.classList.add('divFlexRow');
                            divDatos2.classList.add('datosItem');
                            divDatos2.id = 'width100';



                            // Presentación
                            const divPresentacion = document.createElement('div');
                            const labelPresentacion = document.createElement('label');
                            labelPresentacion.classList.add('labelCenter');
                            labelPresentacion.classList.add('labelCenter142px');
                            labelPresentacion.textContent = 'Presentación';

                            const inputPresentacion = document.createElement('input');
                            inputPresentacion.value = medicamento.descripcion_item.descripcion_presentacion;
                            inputPresentacion.classList.add('inputItemMedicamento');

                            divPresentacion.appendChild(labelPresentacion);
                            divPresentacion.appendChild(inputPresentacion);
                            divPresentacion.classList.add('datoItem');
                            divDatos2.appendChild(divPresentacion);

                            // Concentración
                            const divConcentracion = document.createElement('div');
                            const labelConcentracion = document.createElement('label');
                            labelConcentracion.classList.add('labelCenter');
                            labelConcentracion.classList.add('labelCenter142px');
                            labelConcentracion.textContent = 'Concentración';

                            const inputConcentracion = document.createElement('input');
                            inputConcentracion.value = medicamento.descripcion_item.descripcion_concentracion;
                            inputConcentracion.classList.add('inputItemMedicamento');

                            divConcentracion.appendChild(labelConcentracion);
                            divConcentracion.appendChild(inputConcentracion);
                            divConcentracion.classList.add('datoItem');
                            divDatos2.appendChild(divConcentracion);


                            // Segundo renglón con datos del medicamento
                            const divDatos3 = document.createElement('div');
                            divDatos3.classList.add('divFlexRow');
                            divDatos3.classList.add('datosItem');
                            divDatos3.id = 'width100';



                            // Duracion
                            const divDuracion = document.createElement('div');
                            const labelDuracion = document.createElement('label');
                            labelDuracion.classList.add('labelCenter');
                            labelDuracion.classList.add('labelCenter142px');
                            labelDuracion.textContent = 'Duracion';

                            const inputDuracion = document.createElement('input');
                            inputDuracion.value = medicamento.duracion;
                            inputDuracion.classList.add('inputItemMedicamento');

                            divDuracion.appendChild(labelDuracion);
                            divDuracion.appendChild(inputDuracion);
                            divDuracion.classList.add('datoItem');
                            divDatos3.appendChild(divDuracion);

                            // Administracion
                            const divAdministracion = document.createElement('div');
                            const labelAdministracion = document.createElement('label');
                            labelAdministracion.classList.add('labelCenter');
                            labelAdministracion.classList.add('labelCenter142px');
                            labelAdministracion.textContent = 'Administracion';

                            const inputAdministracion = document.createElement('input');
                            inputAdministracion.value = medicamento.administracion;
                            inputAdministracion.classList.add('inputItemMedicamento');

                            divAdministracion.appendChild(labelAdministracion);
                            divAdministracion.appendChild(inputAdministracion);
                            divAdministracion.classList.add('datoItem');
                            divDatos3.appendChild(divAdministracion);

                            // Guardar ambos renglones de datos en la card del medicamento item
                            cardItem.appendChild(divDatos1);
                            cardItem.appendChild(divDatos2);
                            cardItem.appendChild(divDatos3);

                            // Guardar card en el contenedor general de medicamentos items
                            contenedorMedicamentos.appendChild(cardItem);
                            // Añadir contenedores de medicamentos y prestaciones a la prescripción
                            cardPrescripcion.appendChild(contenedorMedicamentos);

                        }
                    } else {
                        const p = document.createElement('p');
                        p.classList.add('pPrescripcionesAnt');
                        p.innerHTML = "No hay medicamentos recetados.";
                        cardPrescripcion.appendChild(p);
                    }


                    // Contenedor para prestaciones
                    let contenedorPrestaciones = document.createElement('div');
                    contenedorPrestaciones.classList.add('column');
                    contenedorPrestaciones.id = 'width100';
                    contenedorPrestaciones.style.gap = "8px";
                    const h4p = document.createElement('h5');
                    h4p.textContent = "Prestaciones prescriptas";
                    h4p.classList.add('textcenter');
                    h4p.classList.add('text-fondoCeleste')
                    h4p.id = 'width100';
                    contenedorPrestaciones.appendChild(h4p);

                    if (prescripcion.prestaciones && prescripcion.prestaciones.length > 0) {
                        for (const prestacion of prescripcion.prestaciones) {
                            const prestacionItem = document.createElement('div');
                            prestacionItem.style.marginRight = "3px";
                            prestacionItem.style.marginLe = "3px";
                            prestacionItem.classList.add('cardItem');
                            prestacionItem.id = `prestacion-${prestacion.prestacion_id}`; // ID único para cada prestación
                            prestacionItem.classList.add('prestacionItem', 'column');
                            prestacionItem.id = 'width100';

                            const h4Prestacion = document.createElement('h5');
                            h4Prestacion.classList.add('text-fondoAzul', 'borderRadiusTop5px');
                            h4Prestacion.textContent = `Prestación ID ${prestacion.prestacion_id}: ${prestacion.descripcion_prestacion}`;
                            prestacionItem.appendChild(h4Prestacion);

                            // Primer renglón con datos de la prestación
                            const divDatos1 = document.createElement('div');
                            divDatos1.id = 'width100';
                            divDatos1.classList.add('divFlexRow', 'datosItem');

                            // Lado
                            const divLado = document.createElement('div');
                            const labelLado = document.createElement('label');
                            labelLado.classList.add('labelCenter', 'labelCenter142px');
                            labelLado.textContent = 'Lado';

                            const inputLado = document.createElement('input');
                            inputLado.value = prestacion.descripcion_lado;
                            inputLado.classList.add('inputItemMedicamento');

                            divLado.appendChild(labelLado);
                            divLado.appendChild(inputLado);
                            divLado.classList.add('datoItem');
                            divDatos1.appendChild(divLado);

                            // Indicación
                            const divIndicacion = document.createElement('div');
                            const labelIndicacion = document.createElement('label');
                            labelIndicacion.classList.add('labelCenter', 'labelCenter142px');
                            labelIndicacion.textContent = 'Indicación';

                            const inputIndicacion = document.createElement('input');
                            inputIndicacion.value = prestacion.indicacion;
                            inputIndicacion.classList.add('inputItemMedicamento');

                            divIndicacion.appendChild(labelIndicacion);
                            divIndicacion.appendChild(inputIndicacion);
                            divIndicacion.classList.add('datoItem');
                            divDatos1.appendChild(divIndicacion);

                            // Segundo renglón con datos de la prestación
                            const divDatos2 = document.createElement('div');
                            divDatos2.classList.add('divFlexRow', 'datosItem');
                            divDatos2.id = 'width100';

                            // Justificación
                            const divJustificacion = document.createElement('div');
                            const labelJustificacion = document.createElement('label');
                            labelJustificacion.classList.add('labelCenter', 'labelCenter142px');
                            labelJustificacion.textContent = 'Justificación';

                            const inputJustificacion = document.createElement('input');
                            inputJustificacion.value = prestacion.justificacion;
                            inputJustificacion.classList.add('inputItemMedicamento');

                            divJustificacion.appendChild(labelJustificacion);
                            divJustificacion.appendChild(inputJustificacion);
                            divJustificacion.classList.add('datoItem');
                            divDatos2.appendChild(divJustificacion);

                            // Añadir ambos renglones de datos a la card de la prestación
                            prestacionItem.appendChild(divDatos1);
                            prestacionItem.appendChild(divDatos2);

                            // Añadir la card de prestación al contenedor general de prestaciones
                            contenedorPrestaciones.appendChild(prestacionItem);
                            cardPrescripcion.appendChild(contenedorPrestaciones);

                        }
                    } else {
                        const p = document.createElement('p');
                        p.classList.add('pPrescripcionesAnt');
                        p.innerHTML = "No hay prestaciones recetadas.";
                        cardPrescripcion.appendChild(p);
                    }

                    divPrescAnteriores.appendChild(cardPrescripcion);

                    const btnPdfs = document.querySelectorAll('.btnPdf');

                    btnPdfs.forEach(btnPdf => {
                        btnPdf.addEventListener('click', () => {
                            const prescripcionData = btnPdf.getAttribute('data-prescripcion');
                            const profesionalData = btnPdf.getAttribute('data-profesional');
                            const pacienteData = btnPdf.getAttribute('data-paciente');
                    
                            // Hacer una solicitud GET al servidor para descargar el PDF
                            const url = `/descargarPdf?prescripcion=${encodeURIComponent(prescripcionData)}&profesional=${encodeURIComponent(profesionalData)}&paciente=${encodeURIComponent(pacienteData)}`;
                    
                            // Abrir el PDF en una nueva pestaña o forzar la descarga
                            window.open(url, '_blank');
                        });
                    });

                }
                //LISTO YA SE PUEDEN RENDERIZAR
                console.log(prescripcionesAnteriores);

            }

        } else {
            //MOSTRAR MSJ CON BOTON PARA ABRIR CREAR PACIENTE
            mostrarMsjCliente('Documento no encontrado', ['Primero debe agregar al Paciente nuevo.', 'Por favor, haga click en el siguiente enlace...']);

            // Selecciona el contenedor
            const mostrarMsj = document.querySelector('.mostrarMsj');

            // Crea el nuevo enlace
            const a = document.createElement('a');
            a.href = "http://localhost:3000/agregarPaciente";
            a.target = "_blank";
            a.textContent = 'Agregar Paciente';

            // Estilar el enlace 
            a.style.display = 'block';
            a.style.width = '100%';
            a.style.padding = '7px';
            a.style.marginTop = '15px';
            a.style.marginBottom = '17px';
            a.style.textAlign = 'center';
            a.style.textDecoration = 'none';
            a.style.borderRadius = '5px';
            a.style.letterSpacing = '2px';
            a.style.color = '#fff';
            a.style.border = '1px solid #ccc';
            a.style.backgroundColor = '#48cae4';
            // Estilo de hover
            a.addEventListener('mouseover', function () {
                a.style.backgroundColor = '#007BFF';
            });
            a.addEventListener('mouseout', function () {
                a.style.backgroundColor = '#48cae4';
            });

            // Identificar el ultimo elemento del div(btn cerrar)
            const lastElement = mostrarMsj.lastElementChild;

            // Inserta el nuevo enlace antes del btn cerrar
            if (lastElement) {
                mostrarMsj.insertBefore(a, lastElement);
            }
            return;
        }
    });




    //FETCH PARA MEDICAMENTOS ITEMS
    async function fetchObtenerTodosLosMedicamentosItems() {
        try {
            const response = await fetch('/obtenerMedicamentosItems', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok ? await response.json() : [];
        } catch (error) {
            mostrarMsjCliente('Error conexion', ['Error al obtener los obtenerMedicamentosItems', error.message]);
            return [];
        }
    }

    //CONFIGURAR INPUT PARA MOSTRAR ITEMS MEDICAMENTO
    //traer todos los medicamentos items y mostrarlos en su input con filtrado por caracteres ingresados
    const medicamentosItems = await fetchObtenerTodosLosMedicamentosItems();
    configurarInputConLista('#medicamentoItem', '.medicamentos-list', medicamentosItems);

    // Mostrar medicamentos agregados y agregar boton eliminar con evento
    function renderizarMedicamentosAgregados(medicamentosAgregados) {
        divMedicamentosAgregados.innerHTML = '';
        divMedicamentosAgregados.classList.add('column');
        const h3 = document.createElement('h3');
        h3.classList.add('text-center');
        h3.classList.add('text-fondoAzul');
        h3.classList.add('borderRadiusTop5px');
        h3.textContent = `Medicamentos Agregados`;
        divMedicamentosAgregados.appendChild(h3);
        divMedicamentosAgregados.classList.remove('displayNone');


        medicamentosAgregados.forEach((elemento, index) => {
            const cardMedicamentoItem = document.createElement('div');
            cardMedicamentoItem.classList.add('cardItem', 'border', 'column');
            cardMedicamentoItem.style.gap = "3px";
            cardMedicamentoItem.style.paddingBottom = "3px";

            const h4 = document.createElement('h4');
            h4.classList.add('text-fondoAzul', 'borderRadiusTop5px');
            h4.textContent = `Medicamento Item ID ${elemento.item_id}`;
            cardMedicamentoItem.appendChild(h4);

            const div1 = document.createElement('div');
            const label1 = document.createElement('label');
            label1.textContent = 'Medicacion';
            label1.classList.add('labelCenter130px');
            const input1 = document.createElement('input');
            input1.value = `${elemento.nombre_generico.toUpperCase()} ${elemento.concentracion_descripcion.toUpperCase()} ${elemento.formafarmaceutica_descripcion.toUpperCase()} ${elemento.presentacion_descripcion.toUpperCase()}`;
            div1.appendChild(label1);
            div1.appendChild(input1);
            cardMedicamentoItem.appendChild(div1);

            const div2 = document.createElement('div');
            const label2 = document.createElement('label');
            label2.classList.add('labelCenter130px');
            label2.textContent = 'Administracion';
            const input2 = document.createElement('input');
            input2.value = administracionInput.value.trim().toUpperCase();
            div2.appendChild(label2);
            div2.appendChild(input2);
            cardMedicamentoItem.appendChild(div2);

            const div3 = document.createElement('div');
            const label3 = document.createElement('label');
            label3.classList.add('labelCenter130px');
            label3.textContent = 'Duracion';
            const input3 = document.createElement('input');
            input3.value = duracionInput.value.trim().toUpperCase();
            div3.appendChild(label3);
            div3.appendChild(input3);
            cardMedicamentoItem.appendChild(div3);

            // Botón para eliminar el medicamento
            const iconoEliminar = document.createElement('span');
            iconoEliminar.classList.add('fa', 'fa-trash');

            const btnEliminar = document.createElement('p');
            btnEliminar.textContent = "Eliminar";
            btnEliminar.classList.add("eliminarMedicamentoPrescripcion");
            btnEliminar.setAttribute('data-id', elemento.item_id); // Agregar item_id como data-id
            btnEliminar.appendChild(iconoEliminar);

            btnEliminar.addEventListener('click', () => {
                // Obtener el item_id desde el data-id
                const itemId = parseInt(btnEliminar.getAttribute('data-id'));

                // Encontrar el índice correcto en el array
                const indexToRemove = medicamentosAgregados.findIndex(el => el.item_id === itemId);

                if (indexToRemove > -1) {
                    // Eliminar el medicamento del array
                    medicamentosAgregados.splice(indexToRemove, 1);
                    // Actualizar la visualización
                    divMedicamentosAgregados.removeChild(cardMedicamentoItem);
                    if (!medicamentosAgregados.length || medicamentosAgregados.length == 0) {
                        divMedicamentosAgregados.classList.add('displayNone');
                    }
                }
            });

            cardMedicamentoItem.appendChild(btnEliminar);
            divMedicamentosAgregados.appendChild(cardMedicamentoItem);
        });


        medicamentoInput.value = '';
        administracionInput.value = '';
        duracionInput.value = '';
    }

    //agregar medicamento a prescripcion
    btnAgregarOtro.addEventListener('click', () => {

        // MEDICAMENTO ITEM
        let medicamentoIngresado = medicamentoInput.value.trim().toUpperCase();
        if (medicamentoIngresado === '') {
            mostrarMsjCliente('Medicamento vacio', ['Por favor ingrese una opcion de la lista de Medicamentos.']);
            return;
        }

        // ADMINISTRACION DEL MEDICAMENTO
        let administracion = administracionInput.value.trim().toUpperCase();
        const regexAdministracion = /^[a-zA-Z0-9.,\s]{10,100}$/;
        if (!regexAdministracion.test(administracion)) {
            mostrarMsjCliente('Administración incorrecta', ['Debe contener entre 10 y 100 caracteres y solo puede incluir:', 'letras, números, espacios, comas y puntos.']);
            return;
        }

        // DURACION DEL TRATAMIENTO
        let duracion = duracionInput.value.trim().toUpperCase();
        const regexDuracion = /^[a-zA-Z0-9.,\s]{4,50}$/;
        if (!regexDuracion.test(duracion)) {
            mostrarMsjCliente('Duración incorrecta', ['Debe contener entre 4 y 50 caracteres y solo puede incluir:', 'letras, números, espacios, comas y puntos.']);
            return;
        }

        // Buscar si el medicamento ingresado existe en medicamentosItems capturar id
        let medicamentoExistente = medicamentosItems.find(elemento =>
            `${elemento.nombre_generico.toUpperCase()} ${elemento.concentracion_descripcion.toUpperCase()} ${elemento.formafarmaceutica_descripcion.toUpperCase()} ${elemento.presentacion_descripcion.toUpperCase()}` === medicamentoIngresado
        );

        if (medicamentoExistente) {
            //validar que no este agregado anteriormente no se permite repetir
            let repetido = medicamentosAgregados.find(elemento => elemento.item_id === medicamentoExistente.item_id);
            if (repetido) {
                mostrarMsjCliente('Medicamento duplicado', ['El Medicamento ya se encuentra agregado, no puede repetirse.']);
                return;
            } else {
                medicamentoExistente.duracion = duracion;
                medicamentoExistente.administracion = administracion;
                medicamentosAgregados.push(medicamentoExistente);
                if (medicamentosAgregados.length && medicamentosAgregados.length > 0) {
                    renderizarMedicamentosAgregados(medicamentosAgregados);
                } else {
                    divMedicamentosAgregados.classList.add('displayNone');
                }
            }
        } else {
            mostrarMsjCliente('Dato incorrecto', ['El Medicamento ingresado no existe en la lista de Medicamentos.']);
            return;
        }
    });


    //CONFIGURAR INPUT PARA MOSTRAR PRESTACIONES
    //traer todos las prestaciones y mostrarlos en su input con filtrado por caracteres ingresados

    async function fetchObtenerPrestacionesYlados() {
        try {
            const response = await fetch('/obtenerPrestacionesYlados', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok ? await response.json() : [];
        } catch (error) {
            mostrarMsjCliente('Error conexion', ['Error al obtener todas Las Prestaciones', error.message]);
            return [];
        }
    }

    const prestacionesLados = await fetchObtenerPrestacionesYlados();
    configurarInputConLista('#prestacion', '.prestaciones-list', prestacionesLados.prestaciones);
    configurarInputConLista('#lado', '.lados-list', prestacionesLados.lados);

    // Mostrar medicamentos agregados y agregar boton eliminar con evento
    function renderizarPrestacionesAgregadas(prestacionesAgregados) {

        divPrestacionesAgregadas.innerHTML = '';
        divPrestacionesAgregadas.classList.add('column');

        const h3 = document.createElement('h3');
        h3.classList.add('text-center');
        h3.classList.add('text-fondoAzul');
        h3.classList.add('borderRadiusTop5px');
        h3.textContent = `Prestaciones Agregadas`;
        divPrestacionesAgregadas.appendChild(h3);
        divPrestacionesAgregadas.classList.remove('displayNone');


        prestacionesAgregados.forEach((elemento, index) => {
            const cardPrestacionItem = document.createElement('div');
            cardPrestacionItem.classList.add('cardItem', 'border', 'column');
            cardPrestacionItem.style.gap = "3px";
            cardPrestacionItem.style.paddingBottom = "3px";

            const h4 = document.createElement('h4');
            h4.classList.add('text-fondoAzul', 'borderRadiusTop5px');
            h4.textContent = `Prestacion ID ${elemento.id}`;
            cardPrestacionItem.appendChild(h4);

            const div1 = document.createElement('div');
            const label1 = document.createElement('label');
            label1.textContent = 'Prestacion';
            label1.classList.add('labelCenter130px');
            const input1 = document.createElement('input');
            input1.value = `${elemento.descripcion}`;
            div1.appendChild(label1);
            div1.appendChild(input1);
            cardPrestacionItem.appendChild(div1);

            const div2 = document.createElement('div');
            const label2 = document.createElement('label');
            label2.classList.add('labelCenter130px');
            label2.textContent = 'Indicacion';
            const input2 = document.createElement('input');
            input2.value = elemento.indicacion;
            div2.appendChild(label2);
            div2.appendChild(input2);
            cardPrestacionItem.appendChild(div2);

            const div3 = document.createElement('div');
            const label3 = document.createElement('label');
            label3.classList.add('labelCenter130px');
            label3.textContent = 'Justificacion';
            const input3 = document.createElement('input');
            input3.value = elemento.justificacion;
            div3.appendChild(label3);
            div3.appendChild(input3);
            cardPrestacionItem.appendChild(div3);


            if (elemento.lado) {
                const div4 = document.createElement('div');
                const label4 = document.createElement('label');
                label4.classList.add('labelCenter130px');
                label4.textContent = 'Lado';
                const input4 = document.createElement('input');
                input4.value = elemento.lado.descripcion;
                div4.appendChild(label4);
                div4.appendChild(input4);
                cardPrestacionItem.appendChild(div4);
            }


            // Botón para eliminar el medicamento
            const iconoEliminar = document.createElement('span');
            iconoEliminar.classList.add('fa', 'fa-trash');

            const btnEliminar = document.createElement('p');
            btnEliminar.textContent = "Eliminar";
            btnEliminar.classList.add("eliminarMedicamentoPrescripcion");
            btnEliminar.setAttribute('data-id', elemento.id); // Agregar item_id como data-id
            btnEliminar.appendChild(iconoEliminar);

            btnEliminar.addEventListener('click', () => {
                // Obtener el item_id desde el data-id
                const id = parseInt(btnEliminar.getAttribute('data-id'));

                // Encontrar el índice correcto en el array
                const indexToRemove = prestacionesAgregadas.findIndex(el => el.id === id);

                if (indexToRemove > -1) {
                    // Eliminar el medicamento del array
                    prestacionesAgregadas.splice(indexToRemove, 1);
                    // Actualizar la visualización
                    divPrestacionesAgregadas.removeChild(cardPrestacionItem);
                    if (!prestacionesAgregadas.length || prestacionesAgregadas.length == 0) {
                        divPrestacionesAgregadas.classList.add('displayNone');
                    }
                }
            });

            cardPrestacionItem.appendChild(btnEliminar);
            divPrestacionesAgregadas.appendChild(cardPrestacionItem);
            //VACIAR VARIABLES Y CAMPOS
            document.querySelector('#prestacion').value = '';
            document.querySelector('#lado').value = '';

            document.querySelector('#justificacion').value = '';

            document.querySelector('#indicacion').value = '';

        });


        medicamentoInput.value = '';
        administracionInput.value = '';
        duracionInput.value = '';
    }

    //AGREGAR PRESTACION CON/SIN LADO 
    btnAgregarOtra.addEventListener('click', () => {
        // CAPTURAR PRESTACIÓN
        let prestacionIngresada = document.querySelector('#prestacion').value.trim().toUpperCase();
        if (prestacionIngresada === '') {
            mostrarMsjCliente('Prestacion vacia', ['Debe ingresar una Prestacion.']);
            return;
        }

        // BUSCAR SI LA PRESTACIÓN INGRESADA EXISTE EN prestacionesLados.prestaciones Y CAPTURAR ID
        let prestacionExistente = prestacionesLados.prestaciones.find(elemento =>
            elemento.descripcion.toUpperCase() === prestacionIngresada
        );

        if (prestacionExistente) {
            // VALIDAR QUE NO ESTÉ AGREGADA ANTERIORMENTE, NO SE PERMITE REPETIR
            let repetido = prestacionesAgregadas.find(elemento => elemento.id === prestacionExistente.id);
            if (repetido) {
                mostrarMsjCliente('Prestacion duplicada', ['La Prestacion ya se encuentra agregada, no puede repetirse.']);
                return;
            } else {

                //ANTES DE AGREGAR LA PRESTACION EN CASO QUE SEA != VACIO: VALIDAR LADO QUE SE ASIGNA A LA PRESTACION VALIDADA 
                //CAPTURAR LADO (no es obligatorio)
                let ladoIngresado = document.querySelector('#lado').value.trim().toUpperCase();

                //VALIDAR si es distinto a vacio
                if (ladoIngresado !== '') {

                    // BUSCAR SI EL LADO INGRESADO EXISTE EN prestacionesLados.lados Y CAPTURAR ID
                    let ladoExistente = prestacionesLados.lados.find(elemento =>
                        elemento.descripcion.toUpperCase() === ladoIngresado
                    );

                    if (ladoExistente) {
                        // VALIDAR QUE NO ESTÉ AGREGADO ANTERIORMENTE, NO SE PERMITE REPETIR
                        let repetidoLado = ladosAgregados.find(elemento => elemento.id === ladoExistente.id);
                        if (repetidoLado) {
                            mostrarMsjCliente('Lado duplicado', ['El Lado ya se encuentra agregado, no puede repetirse.']);
                            return;
                        } else {
                            //AGREGARR LADO A PRESTACION!!!!
                            prestacionExistente.lado = ladoExistente;
                        }
                    } else {
                        mostrarMsjCliente('Dato incorrecto', ['El Lado ingresado no existe en la lista de Lados.']);
                        return;
                    }
                }


                // VALIDAR INDICACIÓN
                const regexIndJust = /^[a-zA-Z0-9.,\s]{10,100}$/;

                let indicacionIngresada = document.querySelector('#indicacion').value.trim().toUpperCase();
                if (indicacionIngresada === '') {
                    mostrarMsjCliente('Indicacion vacia', ['Debe ingresar una Indicacion.']);
                    return;
                }

                if (!regexIndJust.test(indicacionIngresada)) {
                    mostrarMsjCliente('Indicacion incorrecta', ['La Indicacion debe contener entre 10 y 100 caracteres y solo puede incluir letras, numeros, espacios, comas y puntos.']);
                    return;
                } else {
                    prestacionExistente.indicacion = indicacionIngresada;
                }


                //VALIDAR JUSTIFICACION
                let justificacionIngresada = document.querySelector('#justificacion').value.trim().toUpperCase();
                if (justificacionIngresada === '') {
                    mostrarMsjCliente('Justificacion vacia', ['Debe ingresar una Justificacion.']);
                    return;
                }

                if (!regexIndJust.test(justificacionIngresada)) {
                    mostrarMsjCliente('Justificacion incorrecta', ['La Justificacion debe contener entre 10 y 100 caracteres y solo puede incluir letras, numeros, espacios, comas y puntos.']);
                    return;
                } else {
                    prestacionExistente.justificacion = justificacionIngresada;
                }

                //PRESTACION CON TODOS LOS DATOS COMPLETOS : AGREGAR AL ARRAY
                prestacionesAgregadas.push(prestacionExistente);

                // prestacion, lado, indicacion y justificacion ok : RENDERIZAR PRESTACION AGREGADA
                if (prestacionesAgregadas.length > 0) {
                    renderizarPrestacionesAgregadas(prestacionesAgregadas);
                } else {
                    divPrestacionesAgregadas.classList.add('displayNone');
                }
            }
        } else {
            mostrarMsjCliente('Dato incorrecto', ['La Prestacion ingresada no existe en la lista de Prestaciones.']);
            return;
        }





    });


    // Configurar la zona horaria y formatear la fecha actual
    function obtenerFechaActualFormatted() {
        const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
        const fechaActual = new Date();
        const fechaActualFormatted = new Intl.DateTimeFormat('es-AR', options).format(fechaActual);
        const [day, month, year] = fechaActualFormatted.split('/');
        return `${year}-${month}-${day}`;
    }

    // Calcular la fecha de vigencia basada en los días seleccionados
    function calcularFechaVigencia(dias) {
        const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
        const fechaActual = new Date();
        fechaActual.setDate(fechaActual.getDate() + dias);
        const fechaVigenciaFormatted = new Intl.DateTimeFormat('es-AR', options).format(fechaActual);
        const [vigDay, vigMonth, vigYear] = fechaVigenciaFormatted.split('/');
        return `${vigYear}-${vigMonth}-${vigDay}`;
    }

    // Validar el diagnóstico ingresado
    function validarDiagnostico(diagnostico) {
        if (diagnostico === '') {
            mostrarMsjCliente('Diagnóstico vacío', ['Debe ingresar el diagnóstico.']);
            return false;
        }

        if (diagnostico.length < 15 || diagnostico.length > 100) {
            mostrarMsjCliente('Diagnóstico inválido', ['El diagnóstico debe tener entre 15 y 100 caracteres.']);
            return false;
        }

        const diagnosticoPattern = /^[a-zA-Z0-9\s,\.]+$/;
        if (!diagnosticoPattern.test(diagnostico)) {
            mostrarMsj('Diagnóstico inválido', ['El diagnóstico solo puede contener letras, números, comas, puntos y espacios.']);
            return false;
        }

        return true;
    }

    // Evento de click para enviar prescripción
    btnEnviarPrescripcion.addEventListener('click', async (event) => {
        event.preventDefault();

        const fechaActualDate = obtenerFechaActualFormatted();
        let fechaVigenciaDate;

        // Verificar la selección de vigencia y calcular la fecha
        if (selectVigencia.value == 30) {
            fechaVigenciaDate = calcularFechaVigencia(30);
        } else if (selectVigencia.value == 60) {
            fechaVigenciaDate = calcularFechaVigencia(60);
        }

        if (!paciente || paciente === false) {
            mostrarMsjCliente('Paciente vacío', ['Debe asignar un Paciente a la prescripción.']);
            return;
        }

        const diagnostico = DiagnosticoInput.value.trim().toUpperCase();

        // Validar el diagnóstico
        if (!validarDiagnostico(diagnostico)) {
            return;
        }

        const agregarMedicamentos = medicamentosAgregados.length > 0;
        const agregarPrestaciones = prestacionesAgregadas.length > 0;

        const data = {
            agregarMedicamentos,
            agregarPrestaciones,
            medicamentosAgregados,
            prestacionesAgregadas,
            paciente_id: paciente.id,
            prof_id_refeps: datosProfesional.id_refeps,
            fechaActualDate,
            fechaVigenciaDate,
            diagnostico
        };

        try {
            const response = await fetch('/agregarPrescripcion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                mostrarMsjCliente('Prescripción enviada', ['La prescripción se ha agregado correctamente.']);
            } else {
                mostrarMsjCliente('Error', ['Ocurrió un error al enviar la prescripción.']);
            }
        } catch (error) {
            console.error('Error al enviar la prescripción:', error);
            mostrarMsjCliente('Error', ['Ocurrió un error al enviar la prescripción.']);
        }
    });


});
