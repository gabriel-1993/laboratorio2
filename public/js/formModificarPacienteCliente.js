import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, ocultarLista, renderizarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'



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
    const btnModificarPaciente = document.querySelector('.btnPaciente');
    const divMasCampos = document.querySelector('.divMasCampos');
    const btnBuscar = document.querySelector('.btnBuscar');


    const pacientes = await fetchObtenerTodosLosPacientes();
    configurarInputConLista('#documento', '.pacientes-list', pacientes);
    let pacienteEncontrado;
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
            btnModificarPaciente.classList.remove('displayNone');
            console.log(pacienteEncontrado);

            //cargar datos del paciente encontrado
            nombreInput.value = pacienteEncontrado.nombre;
            apellidoInput.value = pacienteEncontrado.apellido;
            telefonoInput.value = pacienteEncontrado.telefono;
            alergiaInput.value = pacienteEncontrado.alergia;
            fechaNacimientoDate.value = pacienteEncontrado.fecha_nacimiento;

            switch (pacienteEncontrado.sexo) {
                case "MASCULINO":
                    generoSelect.value = "1";
                    break;
                case "FEMENINO":
                    generoSelect.value = "2";
                    break;
                case "OTRO":
                    generoSelect.value = "3";
                    break;
                default:
                    console.log("Sexo no reconocido");
                    break;
            }
            estadoSelect.value = pacienteEncontrado.estado;

        } else {
            mostrarMsjCliente('Documento incorrecto', [`El numero de documento no esta registrado, puede agregarlo como paciente nuevo.`]);
            return;
        }

    });









    btnModificarPaciente.addEventListener('click', async function () {
        // Aquí la lógica específica para modificar el paciente

        let documento = documentoInput.value.trim();
        const nombre = nombreInput.value.trim().toUpperCase();
        const apellido = apellidoInput.value.trim().toUpperCase();
        const telefono = telefonoInput.value.trim();
        const alergia = alergiaInput.value.trim().toUpperCase();
        const fecha_nacimiento = fechaNacimientoDate.value.trim();
        let sexo = generoSelect.value;
        const estado = estadoSelect.value;



        // //mo funciono esto....................
        // console.log(documento);
        // console.log(typeof documento);
        // console.log(pacienteEncontrado.documento);
        // console.log(typeof pacienteEncontrado.documento);
        // console.log(nombre);
        // console.log(pacienteEncontrado.nombre);
        // console.log(apellido);
        // console.log(pacienteEncontrado.apellido);
        // console.log(telefono);
        // console.log(pacienteEncontrado.telefono);
        // console.log(alergia);
        // console.log(pacienteEncontrado.alergia);
        // console.log(fecha_nacimiento);
        // console.log(pacienteEncontrado.fecha_nacimiento);
        // console.log(sexo);
        // console.log(pacienteEncontrado.sexo);

        if (documento == pacienteEncontrado.documento && nombre === pacienteEncontrado.nombre && apellido === pacienteEncontrado.apellido && telefono === pacienteEncontrado.telefono && alergia === pacienteEncontrado.alergia && fecha_nacimiento === pacienteEncontrado.fecha_nacimiento && sexo === pacienteEncontrado.sexo && estado == pacienteEncontrado.estado) {
            mostrarMsjCliente('Datos incorrectos', ['No se encontraron modificaciones en el paciente, primero debe hacer las modificaciones.'])
            return;
        }

        //EXPRESIONES REGULARES con MSJS DE ERROR
        if (!documento || !validarDocumento(documento)) {
            mostrarMsjCliente('Documento incorrecto', ['Documento no válido.']);
            return;
        }

        // VERIFICAR SI MODIFICARON EL DOCUMENTO DEL PACIENTE: si no esta ocupado el nuevo documento
        if (documento != pacienteEncontrado.documento) {
            //validar que no este ocupado el documento modificado
            const documentoOcupado = await fetchVerificarDocumento(documento);
            if (documentoOcupado) {
                mostrarMsjCliente('Documento incorrecto', [`El numero de documento no fue posible modificarlo, ya se encuentra registrado un paciente con el documento: ${documentoOcupado.documento}.`])
                return;
            }
        }

        //EXPRESIONES REGULARES con MSJS DE ERROR
        if (!nombre) {
            mostrarMsjCliente('Nombre obligatorio', ['Nombre vacio, debe ingresar el nombre.']);
            return;
        } else if (!validarNombreApellido(nombre)) {
            mostrarMsjCliente('Nombre incorrecto', ['Nombre ingresado no es válido. Debe contener entre 4 y 25 caracteres, y solo puede incluir letras y espacios.']);
            return;
        }

        if (!apellido) {
            mostrarMsjCliente('Apellido obligatorio', ['Apellido vacio, debe ingresar el apellido.'])
            return;
        } else if (!validarNombreApellido(apellido)) {
            mostrarMsjCliente('Apellido incorrecto', ['Apellido ingresado no es válido. Debe contener entre 4 y 25 caracteres, y solo puede incluir letras y espacios.']);
            return;
        }

        if (!telefono) {
            mostrarMsjCliente('Telefono obligatorio', ['Telefono vacio, debe ingresar el telefono.']);
            return;
        } else if (!validarTelefono(telefono)) {
            mostrarMsjCliente('Telefono incorrecto', ['El numero de Telefono debe comenzar con un código de país y contener solo dígitos.', 'Ejemplo: +542664123456']);
            return;
        }

        if (!validarAlergia(alergia)) {
            return;
        }

        if (!validarFechaNacimiento(fecha_nacimiento)) {
            return;
        }

        if (sexo === '-1') {
            mostrarMsjCliente('Genero incorrecto', ['Debe seleccionar un genero']);
            return;
        } else if (sexo === '1') {
            sexo = 'MASCULINO';
        } else if (sexo === '2') {
            sexo = 'FEMENINO';
        } else if (sexo === '3') {
            sexo = 'OTRO';
        } else {
            mostrarMsjCliente('Sexo incorrecto', ['Verifique el genero ingresado.']);
            return;
        }



        // Preparar datos para enviar
        const data = {
            id: pacienteEncontrado.id,
            nombre,
            apellido,
            documento,
            fecha_nacimiento,
            sexo,
            telefono,
            alergia,
            estado
        };

        try {
            const response = await fetch('/modificarPaciente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                mostrarMsjCliente('Paciente modificado', ['Las modificaciones fueron realizadas con éxito.']);
            } else {
                mostrarMsjCliente('Error', [result.mensaje]);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMsjCliente('Error al modificar paciente', [error.message]);
        }


    });
});
