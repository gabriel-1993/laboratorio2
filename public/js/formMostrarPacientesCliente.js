import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, ocultarLista, renderizarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'

//---------------------------------------------------------------------------------------------------------------------------
function validarDocumento(documento) {
    // Expresión regular para validar que solo contenga números y tenga entre 6 y 20 dígitos
    const regex = /^\d{6,20}$/;

    // Verificar si el documento cumple con la expresión regular
    return regex.test(documento);
}

// FETCH OBTENER TODOS LOS PACIENTES
async function fetchObtenerTodosLosPacientes() {
    try {
        const response = await fetch('/obtenerPacientes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return []; // No se encontraron pacientes, retorna un array vacío
        }

        const pacientes = await response.json(); // Recibe la lista de pacientes
        // console.log('Pacientes encontrados:', pacientes); // Log para ver los pacientes recibidos
        return pacientes; // Retorna la lista de pacientes
    } catch (error) {
        mostrarMsjCliente('Error conexion', ['Error al obtener los pacientes:', error.message]);
        // console.error('Error al obtener los pacientes:', error.message);
        return []; // Retorna un array vacío en caso de error
    }
}

// FETCH VALIDAR DOCUMENTO
async function fetchVerificarDocumento(documento) {
    try {
        const response = await fetch('/buscarDocumento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ documento }),
        });

        // console.log('Response status:', response.status); 

        if (!response.ok) {
            return false; // No se encontró paciente, retorna false
        }

        const paciente = await response.json();
        // console.log('Paciente encontrado:', paciente); 
        return paciente;
    } catch (error) {
        console.error('Error al verificar el paciente:', error.message);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const documentoInput = document.querySelector('#documento');
    const nombreInput = document.querySelector('#nombre');
    const apellidoInput = document.querySelector('#apellido');
    const telefonoInput = document.querySelector('#telefono');
    const alergiaInput = document.querySelector('#alergia');
    const fechaNacimientoDate = document.querySelector('#fechaNacimiento');
    const generoSelect = document.querySelector('#genero');
    const estadoSelect = document.querySelector('#estado');
    const divMasCampos = document.querySelector('.divMasCampos');
    const btnBuscar = document.querySelector('.btnBuscar');
    const divContenedorPacientes = document.querySelector('.divContenedorPacientes');

    const pacientes = await fetchObtenerTodosLosPacientes();

    configurarInputConLista('#documento', '.pacientes-list', pacientes);
    let pacienteEncontrado;

    async function mostrarPacientes(pacientes) {

        pacientes.forEach(element => {
            const cardPaciente = document.createElement('div');
            cardPaciente.classList.add('cardItem');

            const h4 = document.createElement('h4');
            h4.classList.add('text-fondoAzul');
            h4.classList.add('borderRadiusTop5px');
            h4.innerHTML = `Paciente ID # ${element.id}`;
            cardPaciente.appendChild(h4);

            const renglon = document.createElement('div');
            renglon.classList.add('divFlexRow');
            renglon.classList.add('datosItem');

            //DOCUMENTO
            const div = document.createElement('div');
            div.classList.add('datoItem');
            const label = document.createElement('label');
            label.textContent = `Documento`;
            label.classList.add('labelCenter');
            label.classList.add('labelCenter142px');
            const input = document.createElement('input');
            input.value = `${element.documento}`;
            div.appendChild(label);
            div.appendChild(input);
            renglon.appendChild(div);


            //NOMBRE
            const div2 = document.createElement('div');
            div2.classList.add('datoItem');
            const label2 = document.createElement('label');
            label2.textContent = `Nombre`;
            label2.classList.add('labelCenter');
            label2.classList.add('labelCenter142px');
            const input2 = document.createElement('input');
            input2.value = `${element.nombre}`;
            div2.appendChild(label2);
            div2.appendChild(input2);

            renglon.appendChild(div2);

            //APELLIDO
            const div3 = document.createElement('div');
            div3.classList.add('datoItem');
            const label3 = document.createElement('label');
            label3.textContent = `Apellido`;
            label3.classList.add('labelCenter');
            label3.classList.add('labelCenter142px');
            const input3 = document.createElement('input');
            input3.value = `${element.apellido}`;
            div3.appendChild(label3);
            div3.appendChild(input3);

            renglon.appendChild(div3);

            //ESTADO
            const div4 = document.createElement('div');
            div4.classList.add('datoItem');
            const label4 = document.createElement('label');
            label4.textContent = `Estado`;
            label4.classList.add('labelCenter');
            label4.classList.add('labelCenter142px');
            const input4 = document.createElement('input');
            if (element.estado == 1) {
                input4.value = 'DISPONIBLE';
            } else if (element.estado == 0) {
                input4.value = 'NO DISPONIBLE';
            }
            div4.appendChild(label4);
            div4.appendChild(input4);

            renglon.appendChild(div4);

            //SEGUNDO RENGLON EN LA CARD PACIENTE
            const renglon2 = document.createElement('div');
            renglon2.classList.add('divFlexRow');
            renglon2.classList.add('datosItem');
            //TELEFONO
            const div5 = document.createElement('div');
            div5.classList.add('datoItem');
            const label5 = document.createElement('label');
            label5.textContent = `Telefono`;
            label5.classList.add('labelCenter');
            label5.classList.add('labelCenter142px');
            const input5 = document.createElement('input');
            if (element.telefono == '') {
                input5.value = `DATO DESCONOCIDO`;
            } else {
                input5.value = `${element.telefono}`;
            }
            div5.appendChild(label5);
            div5.appendChild(input5);

            renglon2.appendChild(div5);


            //ALERGIA
            const div6 = document.createElement('div');
            div6.classList.add('datoItem');
            const label6 = document.createElement('label');
            label6.textContent = `Alergia`;
            label6.classList.add('labelCenter');
            label6.classList.add('labelCenter142px');
            const input6 = document.createElement('input');
            if (element.alergia == '') {
                input6.value = `DATO DESCONOCIDO`;
            } else {
                input6.value = `${element.alergia}`;
            }
            div6.appendChild(label6);
            div6.appendChild(input6);

            renglon2.appendChild(div6);

            //FECHA NACIMIENTO
            const div7 = document.createElement('div');
            div7.classList.add('datoItem');
            const label7 = document.createElement('label');
            label7.textContent = `Fecha Nacimiento`;
            label7.classList.add('labelCenter');
            label7.classList.add('labelCenter142px');
            const input7 = document.createElement('input');
            input7.value = `${element.fecha_nacimiento}`;
            div7.appendChild(label7);
            div7.appendChild(input7);

            renglon2.appendChild(div7);

            //GENERO
            const div8 = document.createElement('div');
            div8.classList.add('datoItem');
            const label8 = document.createElement('label');
            label8.textContent = `Fecha Nacimiento`;
            label8.classList.add('labelCenter');
            label8.classList.add('labelCenter142px');
            const input8 = document.createElement('input');
            input8.value = `${element.fecha_nacimiento}`;
            div8.appendChild(label8);
            div8.appendChild(input8);

            renglon2.appendChild(div8);

            cardPaciente.appendChild(renglon);
            cardPaciente.appendChild(renglon2);
            divContenedorPacientes.appendChild(cardPaciente);
        });
    }

    mostrarPacientes(pacientes);
    //---------------------------------------------------------------------------------------------------------------------------

    btnBuscar.addEventListener('click', async function () {
        let documentoBuscado = documentoInput.value.trim();

        if (!documentoBuscado) {
            mostrarMsjCliente('Documento obligatorio', ['Documento vacío, debe ingresar el número de documento.']);
            return;
        } else if (!validarDocumento(documentoBuscado)) {
            mostrarMsjCliente('Documento incorrecto', ['El documento debe tener solo números y una longitud mínima de 6 y máxima de 12.']);
            return;
        }

        documentoBuscado = parseInt(documentoBuscado, 10);
        pacienteEncontrado = await fetchVerificarDocumento(documentoBuscado);
        // console.log(paciente);

        if (pacienteEncontrado) {
            divMasCampos.classList.remove('displayNone')

            //cargar datos del paciente encontrado
            nombreInput.value = pacienteEncontrado.nombre;
            apellidoInput.value = pacienteEncontrado.apellido;
            telefonoInput.value = pacienteEncontrado.telefono;
            alergiaInput.value = pacienteEncontrado.alergia;
            fechaNacimientoDate.value = pacienteEncontrado.fecha_nacimiento;

            const option = document.createElement('option');
            option.textContent = pacienteEncontrado.sexo;
            generoSelect.add(option);

            const opt = document.createElement('option');

            if (pacienteEncontrado.estado === 1) {
                opt.textContent = 'DISPONIBLE';
            } else if (pacienteEncontrado.estado === 0) {
                opt.textContent = 'NO DISPONIBLE';
            }
            estadoSelect.appendChild(opt);

        } else {
            mostrarMsjCliente('Documento incorrecto', [`El numero de documento no esta registrado, puede agregarlo como paciente nuevo.`]);
            return;
        }

    });

});
