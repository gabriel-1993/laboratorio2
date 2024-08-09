import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, ocultarLista, renderizarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'

const documentoInput = document.querySelector('#documento');
const nombreInput = document.querySelector('#nombre');
const apellidoInput = document.querySelector('#apellido');
const telefonoInput = document.querySelector('#telefono');
const alergiaInput = document.querySelector('#alergia');
const fechaNacimientoDate = document.querySelector('#fechaNacimiento');
const generoSelect = document.querySelector('#genero');
const btnBuscar = document.querySelector('.btnBuscar');
const divMasCampos = document.querySelector('.divMasCampos ');



const btnPaciente = document.querySelector('.btnPaciente');


// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async function () {


    // FUNCIONES CON EXPRESIONES REGULARES PARA EL FORM
    function validarNombreApellido(elem) {
        // Verificar si el nombre está vacío
        if (!elem || elem.trim() === '') {
            return false;
        }

        // Expresión regular para validar que solo contenga letras y espacios
        const regex = /^[a-zA-Z\s]{4,25}$/;

        // Verificar si elem cumple con la expresión regular
        return regex.test(elem);
    }

    function validarDocumento(documento) {
        // Expresión regular para validar que solo contenga números y tenga entre 6 y 20 dígitos
        const regex = /^\d{6,20}$/;

        // Verificar si el documento cumple con la expresión regular
        return regex.test(documento);
    }


    function validarGenero(genero) {

        // Verificar que el género seleccionado sea distinto de -1
        if (genero === "-1") {
            return false;
        }

        return true;
    }


    function validarTelefono(telefono) {
        // Validar telefono ingresado
        const regex = /^\+?[1-9]\d{1,14}$/;
        if (!regex.test(telefono)) {
            mostrarMsjCliente('Dato incorrecto', ['El numero de Telefono debe comenzar con un código de país y contener solo dígitos.', 'Ejemplo: +542664123456']);
            return false;
        }
        return true;
    }

    function validarAlergia(alergiaInput) {

        // Verificar si el campo está vacío
        if (!alergiaInput.trim()) {
            return false;
        }

        // Expresión regular para validar letras y espacios opcionales
        const regex = /^[a-zA-Z\s]*$/;

        // Verificar si el valor cumple con la expresión regular
        return regex.test(alergiaInput);
    }


    function validarFechaNacimiento(fechaInput) {
        // Verificar si la fecha está vacía
        if (!fechaInput) {
            mostrarMsjCliente('Dato vacio', ['Debe ingresar la fecha de nacimiento.']);
            return false;
        }

        // Convertir la cadena a un objeto Date
        const fechaNacimiento = new Date(fechaInput);

        // Verificar que la fecha es válida
        const fechaValida = fechaNacimiento instanceof Date && !isNaN(fechaNacimiento.getTime());
        if (!fechaValida) {
            mostrarMsjCliente('Dato incorrecto', ['Por favor, verifique la fecha de nacimiento.']);
            return false;
        }

        // Obtener la fecha actual
        const fechaActual = new Date();

        // Calcular la diferencia en años
        const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();

        // Ajustar la edad si no ha cumplido años aún este año
        const mesNacimiento = fechaNacimiento.getMonth();
        const mesActual = fechaActual.getMonth();
        const diaNacimiento = fechaNacimiento.getDate();
        const diaActual = fechaActual.getDate();

        if (mesNacimiento > mesActual || (mesNacimiento === mesActual && diaNacimiento > diaActual)) {
            edad--;
        }

        // Verificar que la persona no tenga más de 120 años
        if (edad > 120) {
            mostrarMsjCliente('Dato incorrecto', ['Verifique la fecha de nacimiento.'])
            return false;
        }

        // Verificar que la fecha no sea futura
        if (fechaNacimiento > fechaActual) {
            mostrarMsjCliente('Dato incorrecto', ['No es posible asignar una fecha futura.'])
            return false;
        }

        return true;
    }

    function validarAlergia(alergia) {
        const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

        if (alergia !== "") {
            if (alergia.length < 7 || alergia.length > 149) {
                mostrarMsjCliente('Alergia incorrecta', ["La alergia debe tener entre 10 y 149 caracteres."]);
                return false;
            }

            if (!regex.test(alergia)) {
                mostrarMsjCliente('Alergia incorrecta', ["La alergia solo puede contener letras sin tildes y espacios."]);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    // FIN  FUNCIONES CON EXPRESIONES REGULARES PARA EL FORM

    //---------------------------------------------------------------------------------------------------------------------------


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

    const pacientes = await fetchObtenerTodosLosPacientes();
    configurarInputConLista('#documento', '.pacientes-list', pacientes);

    //---------------------------------------------------------------------------------------------------------------------------




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

    btnBuscar.addEventListener('click', async function () {
        let documento = documentoInput.value.trim();

        if (!documento) {
            mostrarMsjCliente('Documento obligatorio', ['Documento vacío, debe ingresar el número de documento.']);
            return;
        } else if (!validarDocumento(documento)) {
            mostrarMsjCliente('Documento incorrecto', ['El documento debe tener solo números y una longitud mínima de 6 y máxima de 12.']);
            return;
        }

        documento = parseInt(documento, 10);
        const paciente = await fetchVerificarDocumento(documento);
        // console.log(paciente);

        if (paciente) {
            mostrarMsjCliente('Paciente encontrado', [`El paciente ${paciente.nombre} ${paciente.apellido} ya se encuentra registrado.`]);
            return;
        }

        divMasCampos.classList.remove('displayNone')
    });



    //B O T O N   A G R E G A R   P A C I E N T E ----------------------------------------------------------------------------------------
    async function enviarDatosPaciente(data) {
        try {
            const response = await fetch('/agregarPaciente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                nombreInput.value = '';
                apellido.value = '';
                telefonoInput.value = '';
                alergiaInput.value = '';
                fechaNacimientoDate.value = '';
                generoSelect.value = -1;
                documentoInput.value='';
                divMasCampos.classList.add('displayNone');
                mostrarMsjCliente('Paciente agregado', [result.mensaje]);
            } else {
                alert(result.mensaje);
                mostrarMsjCliente('Error', [result.mensaje])
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMsjCliente('Error al crear paciente', [error]);
        }
    }


    btnPaciente.addEventListener('click', async function () {

        let documento = documentoInput.value.trim();
        if (!documento) {
            mostrarMsjCliente('Documento obligatorio', ['Documento vacío, debe ingresar el número de documento.']);
            return;
        } else if (!validarDocumento(documento)) {
            mostrarMsjCliente('Documento incorrecto', ['El documento debe tener solo números y una longitud mínima de 6 y máxima de 12.']);
            return;
        }
        documento = parseInt(documento, 10);
        const paciente = await fetchVerificarDocumento(documento);

        const nombre = nombreInput.value.trim().toUpperCase();
        if (!nombre) {
            mostrarMsjCliente('Nombre obligatorio', ['Nombre vacio, debe ingresar el nombre.']);
            return;
        } else if (!validarNombreApellido(nombre)) {
            mostrarMsjCliente('Nombre incorrecto', ['Nombre ingresado no es válido. Debe contener entre 4 y 25 caracteres, y solo puede incluir letras y espacios.']);
            return;
        }

        const apellido = apellidoInput.value.trim().toUpperCase();
        if (!apellido) {
            mostrarMsjCliente('Apellido obligatorio', ['Apellido vacio, debe ingresar el apellido.'])
            return;
        } else if (!validarNombreApellido(apellido)) {
            mostrarMsjCliente('Apellido incorrecto', ['Apellido ingresado no es válido. Debe contener entre 4 y 25 caracteres, y solo puede incluir letras y espacios.']);
            return;
        }

        const telefono = telefonoInput.value.trim();
        if (!telefono) {
            mostrarMsjCliente('Telefono obligatorio', ['Telefono vacio, debe ingresar el telefono.']);
            return;
        } else if (!validarTelefono(telefono)) {
            mostrarMsjCliente('Telefono incorrecto', ['El numero de Telefono debe comenzar con un código de país y contener solo dígitos.', 'Ejemplo: +542664123456']);
            return;
        }

        const alergia = alergiaInput.value.trim().toUpperCase();
        if (!validarAlergia(alergia)) {
            return;
        }

        const fecha_nacimiento = fechaNacimientoDate.value.trim();
        if (!validarFechaNacimiento(fecha_nacimiento)) {
            return;
        }

        let sexo = generoSelect.value;
        if (sexo === '-1') {
            mostrarMsjCliente('Genero incorrecto', ['Debe seleccionar un genero']);
            return;
        } else if (sexo === '1') {
            sexo = 'MASCULINO';
        } else if (sexo === '2') {
            sexo = 'FEMENINO';
        } else if (sexo === '3') {
            sexo = 'OTRO';
        }


        // Preparar datos para enviar
        const data = {
            nombre,
            apellido,
            documento,
            fecha_nacimiento,
            sexo,
            telefono,
            alergia
        };

        // Llamar a la función para enviar los datos
        await enviarDatosPaciente(data);
 

    });





});














