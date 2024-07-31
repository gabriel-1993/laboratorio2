import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, ocultarLista, renderizarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'

document.addEventListener('DOMContentLoaded', async () => {


    const descripcionInput = document.querySelector('#descripcion');
    const selectEstado = document.querySelector('#selectEstado')
    const ladoInput = document.querySelector('#lado');
    const divMasCampos = document.querySelector('.divMasCampos');
    const divLadosAsignados = document.querySelector('.divLadosAsignados');
    const ulLadosAsignados = document.querySelector('.ulLadosAsignados');
    const btnBuscar = document.querySelector('.btnBuscar');
    const btnAsignarLado = document.querySelector('.btnAsignarLado');
    const btnAgregarPrestacion = document.querySelector('.btnAgregarPrestacion');


    // VARIABLES CON MAYOR SCOPE
    let ladoIngresado;
    let ladosAsignados = [];
    //Buscar todos los medicamentos y lados en la base
    //datos.prestaciones   o   datos.lados
    let datos = await fetchObtenerPrestacionesYlados();
    let prestacionesBase = datos.prestaciones;
    let ladosBase = datos.lados;
    //cargar listas debajo de inputs con los datos 
    if (datos) {
        //Mostrar lista al hacer click en inputs y filtrar lista por letras ingresadas
        configurarInputConLista('#descripcion', '#prestaciones-list', datos.prestaciones);
        configurarInputConLista('#lado', '#lados-list', datos.lados);
    }

    //Luego de agregar reiniciar datos para evitar errores
    function reiniciarBusqueda() {
        ladoIngresado = '';
        ladosAsignados = [];
        datos = '';
        prestacionesBase = '';
        ladosBase = '';
        descripcionInput.value = '';
        ladoInput.value = '';
        divLadosAsignados.style.display = 'none';
        ulLadosAsignados.innerHTML = '';
        divMasCampos.classList.add('displayNone');
        btnAgregarPrestacion.classList.add('displayNone');
    }

    //BUSCAR TODAS LAS PRESTACIONES Y LADOS EN LA BASE PARA MOSTRARLOS DEBAJO DEL INPUT CON FILTRO( y EVITAR AGREGAR DATOS REPETIDOS)
    async function fetchObtenerPrestacionesYlados() {
        try {
            const response = await fetch('/obtenerPrestacionesYlados');
            // Verificar si la solicitud fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            // Parsear la respuesta a JSON
            const datos = await response.json();
            return datos;
        } catch (error) {
            // Manejo de errores
            console.error('Hubo un problema con la solicitud:', error);
            document.getElementById('data').innerText = 'Ocurrió un error al cargar los datos.';
            return null;
        }
    }

    //VALIDAR CON EXPRESION REGULAR LA DESCRIPCION
    function validarDescripcion(prestacionIngresada) {
        // Validar longitud de la descripción
        if (prestacionIngresada.length < 14 || prestacionIngresada.length > 100) {
            mostrarMsjCliente('Dato incorrecto', ['La descripción debe tener entre 14 y 100 caracteres.']);
            return false;
        }

        // Validar que la descripción solo contenga letras y espacios
        const regex = /^[A-Za-z\s]+$/;
        if (!regex.test(prestacionIngresada)) {
            mostrarMsjCliente('Dato incorrecto', ['La descripción solo puede contener letras y espacios.']);
            return false;
        }

        return true;
    }

    //VALIDAR PRESTACION(DESCRIPCION) QUE NO SEA EXISTENTE
    function validarPrestacionExistente(prestacionIngresada, prestaciones) {
        // Recorrer las prestaciones
        for (const prestacion of prestaciones) {
            if (prestacion.descripcion === prestacionIngresada) {
                mostrarMsjCliente('Dato incorrecto', ['Prestación existente, la descripción ingresada ya se encuentra registrada.']);
                return true;
            }
        }
        return false;
    }

    //VALIDAR CON EXPRESION REGULAR EL LADO INGRESADO
    function validarLado(ladoIngresado) {
        // Expresión regular para validar solo letras, espacios y comas
        const regex = /^[A-Za-z,\s]{5,100}$/;

        // Validar el campo
        return regex.test(ladoIngresado);
    }

    //CAPTURAR ID de LADO o CREARLO EN CONTROLADOR : Si es nuevo, se agrega al array para agregarlo en el controlador, sino se captura su ID
    function validarLadoExistente(lado, lados) {
        // Recorrer array lados
        for (const e of lados) {
            if (e.descripcion === lado) {
                return lado = {
                    agregar: false,
                    id: e.id,
                    descripcion: e.descripcion
                }
            }
        }

        lado = {
            agregar: true,
            id: '',
            descripcion: lado
        }
        return lado;
    }


    const asignarLado = (ladoIngresado, ladosAsignados) => {

        const duplicado = ladosAsignados.some(objeto => objeto.descripcion === ladoIngresado.descripcion);
        if (duplicado) {
            mostrarMsjCliente('Dato incorrecto', ['El Lado ingresado ya se encuentra asignado.']);
            return;
        }
        // Agregar ladoingresado al array de ladosAsignados
        ladosAsignados.push(ladoIngresado);
        //Limpiar para no acumular anteriores con actuales
        divLadosAsignados.innerHTML = '';
        ulLadosAsignados.innerHTML = '';

        //Mostrar div si hay al menos un lado asignado
        if (ladosAsignados.length && ladosAsignados.length > 0) {
            //MOSTRAR DIV
            divLadosAsignados.classList.remove('displayNone');
            divLadosAsignados.style.display = 'flex';
            //AGREGAR TITULO por unica vez
            const li = document.createElement('li');
            li.classList.add('liLadosAsignadosTitulo');
            ulLadosAsignados.innerHTML = '';
            li.innerHTML = 'LADOS ASIGNADOS';
            ulLadosAsignados.appendChild(li);
        }

        //array con lados ya asignados por el usuario
        ladosAsignados.forEach(element => {
            const li = document.createElement('li');
            li.classList.add('liLadoAsignado');
            li.innerHTML = element.descripcion;
            //ELIMINAR LADO ICONO Y EVENTO CON FUNCION ELIMINAR ROL
            const iconoEliminar = document.createElement('span');
            iconoEliminar.className = 'fa fa-trash';
            iconoEliminar.addEventListener('click', eliminarLado); // Agregar evento de clic
            li.appendChild(iconoEliminar);
            // Agregamos cada rol con su li dentro de la lista roles
            ulLadosAsignados.appendChild(li);
        });

        divLadosAsignados.appendChild(ulLadosAsignados);
        ladoInput.value = '';
    };

    // cada li en roles asignados tiene un event click en eliminar que ejecuta esta funcion para eliminar de la vista y el array roles.
    const eliminarLado = (event) => {
        event.preventDefault();
        const li = event.target.closest('li');
        if (li) {
            //Capturar descripcion del lado
            const ladoDescripcion = li.textContent;
            // Encontramos rol en rolesBase
            ladosAsignados = ladosAsignados.filter(objeto => objeto.descripcion !== ladoDescripcion);
            // Eliminamos el elemento <li> del DOM
            li.remove();
            // Si se borra el último elemento, ocultamos el div completo
            if (ladosAsignados.length === 0) {
                divLadosAsignados.style.display = 'none';
            }
        }
    };


    //B O T O N    B U S C A R  
    // BUSCAR DESCRIPCION la descripcion validar si es una nueva o es existente
    btnBuscar.addEventListener('click', () => {
        // Capturar el valor del input y convertirlo a mayúsculas
        const prestacionIngresada = descripcionInput.value.trim().toUpperCase();
        // Validar longitud de la descripción
        if (!validarDescripcion(prestacionIngresada)) {
            return;
        }
        //RECORRER PRESTACIONES
        if (validarPrestacionExistente(prestacionIngresada, prestacionesBase)) {
            return;
        }

        divMasCampos.classList.remove('displayNone');
        btnAgregarPrestacion.classList.remove('displayNone');
    });


    //B O T O N    A S I G N A R    L A D O
    btnAsignarLado.addEventListener('click', () => {
        ladoIngresado = ladoInput.value.trim().toUpperCase();

        // Validar lado
        if (!validarLado(ladoIngresado)) {
            // NO es válido
            mostrarMsjCliente('Lado incorrecto', ['Lado puede contener únicamente letras (a-z,A-Z), espacios y comas. Min 5 y max 100 caracteres.']);
            return;
        }

        //PARSEAR STRING DE LADO A OBJETO CON ID O BOOLEAN PARA CREARLO
        ladoIngresado = validarLadoExistente(ladoIngresado, ladosBase);

        asignarLado(ladoIngresado, ladosAsignados);

    });




    // B O T O N     A G R E G A R     P R E S T A C I O N / L A D O S

    async function enviarPrestacionLados(prestacionIngresada, ladosAsignados) {
        try {
            const response = await fetch('/agregarPrestacionLados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prestacionIngresada, ladosAsignados }),
            });

            if (response.ok) {
                const result = await response.json();
                mostrarMsjCliente('Prestacion agregada', ['Los datos ingresados fueron agregados con exito.']);
            } else {
                const error = await response.json();
                mostrarMsjCliente('Error Agregar Prestacion', [error.message]);
            }
        } catch (error) {
            mostrarMsjCliente('Error conexion Agregar Prestacion', [error.message]);
        }
    }


    //B O T O N     A G R E G A R    P R E S T A C I O N ( L A D O S)
    //prestacion es obligatoria, lados puede estar vacio. Solo los que sean nuevos se agregan a la base de datos
    btnAgregarPrestacion.addEventListener('click', () => {

        //VOLVER A VALIDAR DESCRIPCION POR SI FUE MODIFICADA DESPUES DE BUSCARLA
        // Capturar el valor del input y convertirlo a mayúsculas
        let prestacionIngresada = descripcionInput.value.trim().toUpperCase();
        // Validar longitud de la descripción
        if (!validarDescripcion(prestacionIngresada)) {
            return;
        }
        //RECORRER PRESTACIONES
        if (validarPrestacionExistente(prestacionIngresada, prestacionesBase)) {
            return;
        }

        //CAPTURAR ESTADO Y ASIGNARLO A LA PRESTACION
        const estadoSeleccionado = selectEstado.value;

        prestacionIngresada = {
            descripcion: prestacionIngresada,
            estado: estadoSeleccionado
        }

        //ENVIAR PRESTACION NUEVA Y LADOS
        enviarPrestacionLados(prestacionIngresada, ladosAsignados);
        reiniciarBusqueda();

    });


});


