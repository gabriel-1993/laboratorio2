import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, renderizarLista, ocultarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'



document.addEventListener('DOMContentLoaded', async () => {

    const descripcionInput = document.querySelector('#descripcion');
    const ulPrestaciones = document.querySelector('#prestaciones-list');
    const btnBuscar = document.querySelector('.btnBuscar');
    const estadoSelect = document.querySelector('#selectEstado');
    const ladoInput = document.querySelector('#lado');
    const btnAsignarLado = document.querySelector('.btnModificarLado');
    //div contenedor de estado,lado btn modificar lado ocultos
    const divMasCampos = document.querySelector('.divMasCampos');
    const ulLados = document.querySelector('.lados-list');
    const divLadosAsignados = document.querySelector('.divLadosModificados');
    const ulLadosAsignados = document.querySelector('.ulLadosModificados');
    const btnModificarPrestacion = document.querySelector('.btnModificarPrestacion')
    const todosLosLi = document.querySelectorAll('.listaFiltradaItem');

    // VARIABLES CON MAYOR SCOPE
    let prestacionOriginal;
    let prestacionIngresada;
    let idPrestacion;
    let ladoIngresado = '';
    let ladosAsignados = [];

    //CARGAR DATOS EN LAS LISTAS : 
    //Buscar todos los medicamentos y lados en la base : datos.prestaciones   o   datos.lados
    let datos = await fetchObtenerPrestacionesYlados();
    let prestacionesBase;
    let ladosBase;




    //Al cargar la pagina inicia las busquedas, Luego de agregar reiniciar datos para evitar errores
    async function reiniciarBusqueda() {
        ladoIngresado = '';
        ladosAsignados = [];
        descripcionInput.value = '';
        ladoInput.value = '';
        divLadosAsignados.style.display = 'none';
        ulLadosAsignados.innerHTML = '';
        divMasCampos.classList.add('displayNone');
        btnModificarPrestacion.classList.add('displayNone');
        prestacionIngresada = '';
        idPrestacion = '';
        prestacionOriginal = '';
        datos = '';
        prestacionesBase = [];
        ladosBase = '';
        datos = await fetchObtenerPrestacionesYlados();
        // let datos = await fetchObtenerPrestacionesYlados();
        if (datos) {
            prestacionesBase = datos.prestaciones;
            ladosBase = datos.lados;

            //Mostrar lista al hacer click en inputs y filtrar lista por letras ingresadas
            configurarInputConLista('#descripcion', '#prestaciones-list', prestacionesBase);
            configurarInputConLista('#lado', '#lados-list', ladosBase);
        } else {
            mostrarMsjCliente('Error en conexion', ['No se logro obtener datos de Prestaciones y Lados.']);
            return;
        }
    }

    //EJECUCION REINICIAR
    reiniciarBusqueda();


    //VALIDAR QUE EL PRESTACION:descripcion EXISTA EN LA BASE
    function validarPrestacionExistente(prestacionIngresada, prestacionesBase) {
        // Recorrer las prestaciones
        for (const prestacion of prestacionesBase) {
            if (prestacion.descripcion === prestacionIngresada) {
                if (prestacion.estado === 1) {
                    estadoSelect.value = 1;
                } else if (prestacion.estado === 0) {
                    estadoSelect.value = 0;
                }
                return true;
            }
        }
        return false;
    }

    //VALIDAR CON EXPRESION REGULAR EL LADO INGRESADO
    function validarLado(ladoIngresado) {
        // Expresión regular para validar solo letras, espacios y comas
        const regex = /^[A-Za-z,\s]{5,100}$/;

        if (!regex.test(ladoIngresado)) {
            mostrarMsjCliente('Dato incorrecto', ['Lado solo puede contener letras y espacios.', ' Minimo 5 y maximo 100 caracteres. ']);
            return false;
        }
        return true;
    }

    //validar repeticion de lado en el array de la base
    function existeLadoEnBase(descripcion, ladosBase) {
        return ladosBase.some(lado => lado.descripcion === descripcion);
    }

    //validar repeticion de lado en el array de lados asignados
    function existeLadoEnAsignados(descripcion, ladosAsignados) {
        return ladosAsignados.some(lado => lado.descripcion === descripcion);
    }


    const asignarLado = (ladoIngresado, ladosAsignados, ladosBase) => {

        //COMPARAR SI INGRESAN UN LADO REPETIDO si descripcion coincide con cualquier elemento return
        if (existeLadoEnBase(ladoIngresado, ladosBase)) {
            mostrarMsjCliente('Lado incorrecto', ['El Lado ingresado ya existe, no es posible asignar datos repetidos.']);
            ladoInput.value = '';
            return;
        }

        //COMPARAR SI INGRESAN UN LADO REPETIDO si descripcion coincide con cualquier elemento return
        if (existeLadoEnAsignados(ladoIngresado, ladosAsignados)) {
            mostrarMsjCliente('Lado incorrecto', ['El Lado ingresado ya fue asignado, no es posible asignar datos repetidos.']);
            ladoInput.value = '';
            return;
        }

        // Validar con expresión regular
        if (!validarLado(ladoIngresado)) {
            ladoInput.value = '';
            //funcion validarLado muestra los msjs de error
            return;
        }

        //crear objeto con todos los datos para el controlador
        ladoIngresado = {
            descripcion: ladoIngresado,
            agregar: true
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
            li.classList.add('liLadoAsignados');
            li.innerHTML = element.descripcion;
            //ELIMINAR LADO ICONO Y EVENTO CON FUNCION ELIMINAR ROL
            const iconoEliminar = document.createElement('span');
            iconoEliminar.className = 'fa fa-trash';
            iconoEliminar.addEventListener('click', eliminarLado); // Agregar evento de clic
            li.appendChild(iconoEliminar);
            // Agregamos cada rol con su li dentro de la lista roles
            ulLadosAsignados.appendChild(li);
        });

        ladoIngresado = '';
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




    //CAPTURAR DATOS DE LA PRESTACION SELECCIONADA  GUARDARLOS EN VARIABLE prestacionOriginal
    ulPrestaciones.addEventListener('click', event => {
        if (event.target.matches('.listaFiltradaItem')) {
            idPrestacion = event.target.getAttribute('data-id');

            //Variable con mayor scope agregar id
            prestacionIngresada = {
                id: idPrestacion
            }
        }
        // INT == STRING
        prestacionOriginal = prestacionesBase.find(prestacion => prestacion.id == prestacionIngresada.id);
    });



    //B O T O N     B U S C A R     C L I C K
    btnBuscar.addEventListener('click', () => {
        // Capturar el valor del input y convertirlo a mayúsculas
        const prestacionIngresada = descripcionInput.value.trim().toUpperCase();

        // Validar con expresion regular
        if (!validarDescripcion(prestacionIngresada)) {
            //funcion validarLado muestra los msjs de error
            return;
        }

        // Verificar si la prestación ya existe en la base de datos
        if (!validarPrestacionExistente(prestacionIngresada, prestacionesBase)) {
            mostrarMsjCliente('Dato incorrecto', ['La Descripcion ingresada no existe para ninguna Prestacion, no es posible modificarla.'])
            reiniciarBusqueda();
            return;
        };

        // Mostrar los campos adicionales si la descripción es válida y no existe
        divMasCampos.classList.remove('displayNone');
        btnModificarPrestacion.classList.remove('displayNone');
    });



    //B O T O N    A S I G N A R    L A D O    C L I C K
    btnAsignarLado.addEventListener('click', () => {
        // Captura el texto ingresado en la variable declarada al principio
        ladoIngresado = ladoInput.value.trim().toUpperCase();

        // VALIDAR QUE NO EXISTA, VALIDAR EXPRESIONES , SI CUMPLE:
        // ladoIngresado pasa a objeto con agregar:true , descripcion: ladoingresado ---> push.ladosAsignados -->  se remderiza en el ul con btn eliminar
        asignarLado(ladoIngresado, ladosAsignados, ladosBase);
        divLadosAsignados.classList.remove('displayNone');
        divLadosAsignados.style.display = 'flex';
    });


    //B O T O N   M O D I F I C A R   P R E S T A C I O N

    async function enviarModificaciones(prestacionIngresada, ladosAsignados) {
        try {
            const response = await fetch('/modificarPrestacionLados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prestacionIngresada, ladosAsignados }),
            });

            if (response.ok) {
                const result = await response.json();
                mostrarMsjCliente('Datos modificacos', ['Los datos ingresados fueron modificados con exito.']);
            } else {
                const error = await response.json();
                mostrarMsjCliente('Error modificar datos en Prestacion', [error.message]);
            }
        } catch (error) {
            mostrarMsjCliente('Error conexion modificar datos Prestacion', [error.message]);
        }
    }


    btnModificarPrestacion.addEventListener('click', () => {

        //  CODIGO EJECUTADO ANTERIORMENTE 

        // //CAPTURAR DATOS DE LA PRESTACION SELECCIONADA  GUARDARLOS EN VARIABLE prestacionOriginal
        // ulPrestaciones.addEventListener('click', event => {
        //     if (event.target.matches('.listaFiltradaItem')) {
        //         idPrestacion = event.target.getAttribute('data-id');
        //         //Variable con mayor scope agregar id
        //         prestacionIngresada = {
        //             id: idPrestacion
        //         }
        //     }
        //     // INT == STRING
        //     prestacionOriginal = prestacionesBase.find(prestacion => prestacion.id == prestacionIngresada.id);
        // });

        //DESCRIPCION PRESTACION : expresiones regulares y que no este repetida.
        const descripcionIngresada = descripcionInput.value.trim().toUpperCase();
        if (!validarDescripcion(descripcionIngresada)) {
            return;
        }

        // AGREGAR DESCRIPCION INGRESADA AL OBJETO
        prestacionIngresada.descripcion = descripcionIngresada;

        //VALIDAR SI LA DESCRIPCION FUE MODIFICADA Y SI LA DESCRIPCION INGRESADA YA EXISTE : modificar false, sino true
        if (prestacionOriginal.descripcion !== descripcionIngresada && validarPrestacionExistente(descripcionIngresada, prestacionesBase)) {
            prestacionIngresada.modificarDescripcion = false;
            mostrarMsjCliente('Dato incorrecto', ['Prestación ingresada existente, la descripción ingresada no se puede agregar.']);
            return;
        } else if (prestacionOriginal.descripcion !== descripcionIngresada && !validarPrestacionExistente(descripcionIngresada, prestacionesBase)) {
            //SI original !== ingresada y no existe en la base
            prestacionIngresada.modificarDescripcion = true;
        } else {
            // Si no se modifica la descripcion , modificar = false
            prestacionIngresada.modificarDescripcion = false;
        }



        //ESTADO PRESTACION
        const estadoIngresado = parseInt(estadoSelect.value.trim(), 10);

        if (prestacionOriginal.estado == estadoIngresado) {
            prestacionIngresada.modificarEstado = false;
            prestacionIngresada.estado = estadoIngresado
        } else {
            prestacionIngresada.modificarEstado = true;
            prestacionIngresada.estado = estadoIngresado;
        }

        if (prestacionIngresada.modificarDescripcion === false && prestacionIngresada.modificarEstado === false && !ladosAsignados.length) {
            mostrarMsjCliente('Datos incorrectos', ['No se encontraron modificaciones en Prestacios o Lados, primero debe hacer las modificaciones.'])
            return;
        }

        //ENVIAR PRESTACION NUEVA Y LADOS
        enviarModificaciones(prestacionIngresada, ladosAsignados);
        reiniciarBusqueda();

    });





});
