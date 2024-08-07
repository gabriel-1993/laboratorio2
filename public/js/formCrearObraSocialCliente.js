import { mostrarMsjCliente } from './mostrarMsjCliente.js';
// MOSTRAR LISTAS EN INPUT Y FILTRARLA POR LETRAS INGRESADAS
import { configurarInputConLista, mostrarLista, ocultarLista, renderizarLista, filtrarLista } from './mostrarFiltrarListasInputs.js'


document.addEventListener('DOMContentLoaded', async () => {

    const btnBuscar = document.querySelector('.btnBuscar');
    const btnAsignarPlan = document.querySelector('.btnAsignarPlan');
    const planInput = document.querySelector('#plan');
    const divMasCampos = document.querySelector('.divMasCampos');
    const nombreInput = document.querySelector('#nombre');
    const telefonoInput = document.querySelector('#telefono');
    const direccionInput = document.querySelector('#direccion');
    const estadoSelect = document.querySelector('#selectEstado');
    const divPlanesAsignados = document.querySelector('.divPlanesAsignados');
    const ulPlanesAsignados = document.querySelector('.listaPlanesAsignados');
    const btnAgregarObraSocial = document.querySelector('.btnAgregarObraSocial');

    // VARIABLES CON MAYOR SCOPE
    //Datos base de datos
    let datos = [];
    let allObrasSociales = [];
    let allPlanes = [];

    //Asignados en el front
    let planesAsignados = [];


    datos = await fetchObtenerObrasSocialesYplanes();
    if (datos) {
        allObrasSociales = datos.allObrasSociales;
        allPlanes = datos.allPlanes;

        //Mostrar lista al hacer click en inputs y filtrar lista por letras ingresadas
        configurarInputConLista('#nombre', '.obrasSociales-list', allObrasSociales);
        configurarInputConLista('#plan', '.planes-list', allPlanes);
    }


    //Luego de agregar reiniciar datos para evitar errores
    function reiniciarBusqueda() {
        datos = [];
        allObrasSociales = [];
        allPlanes = [];
        planesAsignados = [];
        divMasCampos.classList.add('displayNone');
        btnAgregarObraSocial.classList.add('displayNone');
        ulPlanesAsignados.innerHTML = '';
        divPlanesAsignados.innerHTML = '';
        //nombreInput.value = '';
        telefonoInput.value = '';
        direccionInput.value = '';
    }


    //VALIDAR CON EXPRESION REGULAR LA DESCRIPCION
    function validarDescripcion(obraSocialIngresada) {
        // Validar longitud de la descripción
        if (obraSocialIngresada.length < 4 || obraSocialIngresada.length > 100) {
            mostrarMsjCliente('Dato incorrecto', ['La descripción debe tener entre 4 y 100 caracteres.']);
            return false;
        }
        // Validar que la descripción solo contenga letras y espacios
        const regex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
        if (!regex.test(obraSocialIngresada)) {
            mostrarMsjCliente('Dato incorrecto', ['La descripción solo puede contener letras y espacios.']);
            return false;
        }
        return true;
    }


    //VALIDAR CON EXPRESION REGULAR PLAN INGRESADO
    function validarPlan(planIngresado) {
        // Validar longitud de la descripción
        if (planIngresado.length < 4 || planIngresado.length > 30) {
            mostrarMsjCliente('Dato incorrecto', ['El Plan debe tener entre 4 y 30 caracteres.']);
            return false;
        }
        // Validar que la descripción solo contenga letras y espacios
        const regex = /^[A-Za-z ]{4,30}$/;
        if (!regex.test(planIngresado)) {
            mostrarMsjCliente('Dato incorrecto', ['La descripción solo puede contener letras y espacios.']);
            return false;
        }
        return true;
    }


    //VALIDAR OBRA SOCIAL (DESCRIPCION) QUE NO SEA EXISTENTE
    function validarObraSocialExistente(obraSocialIngresada, obrasSociales) {
        // Recorrer las obras sociales
        for (const obraSocial of obrasSociales) {
            if (obraSocial.nombre === obraSocialIngresada) {
                mostrarMsjCliente('Dato incorrecto', ['Obra social existente, el nombre ingresado ya se encuentra registrado.']);
                return true;
            }
        }
        return false;
    }


    //VALIDAR PLAN EXISTENTE: capturar ID para asignarlo, si es nuevo propiedad agrerar:true para el controlador
    function procesarPlan(planIngresado, allPlanes) {
        // Recorrer las obras sociales
        for (const plan of allPlanes) {
            if (plan.nombre === planIngresado) {
                return {
                    agregar: false,
                    asignar: true,
                    nombre: plan.nombre,
                    id: plan.id
                }
            }
        }
        return {
            agregar: true,
            asignar: false,
            nombre: planIngresado,
            id: ''
        }
    }


    //BUSCAR TODAS LAS OBRAS SOCIALES Y PLANES DE LA BASE PARA MOSTRARLOS DEBAJO DEL INPUT CON FILTRO( y EVITAR AGREGAR DATOS REPETIDOS)
    async function fetchObtenerObrasSocialesYplanes() {
        try {
            const response = await fetch('/obtenerObrasSocialesYplanes');

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
            mostrarMsjCliente('Error en conexión', ['Error al obtener obras sociales y planes.']);
            return null;
        }
    }


    //ASIGNAR PLAN (agrega boton eliminar en cada opcion agregada)
    const asignarPlan = (planIngresado, planesAsignados) => {
        // Verificamos si el rol ya está en el array roles
        if (!planesAsignados.some(plan => plan.nombre === planIngresado.nombre)) {
            // Reiniciamos para evitar duplicados visuales
            ulPlanesAsignados.classList.remove('displayNone');
            divPlanesAsignados.innerHTML = '';
            ulPlanesAsignados.innerHTML = '';

            // Agregamos el rol al array
            planesAsignados.push(planIngresado);

            // Título para mostrar roles asignados
            const liTitulo = document.createElement('li');
            liTitulo.innerHTML = 'PLANES ASIGNADOS';
            liTitulo.classList.add('liPlanesAsignados');
            ulPlanesAsignados.appendChild(liTitulo);

            // Renderizamos los roles asignados
            planesAsignados.forEach(element => {
                const li = document.createElement('li');
                li.classList.add('planAsignado');
                li.innerHTML = element.nombre;

                const iconoEliminar = document.createElement('span');
                iconoEliminar.className = 'fa fa-trash';
                iconoEliminar.addEventListener('click', eliminarPlan); // Agregar evento de clic
                li.appendChild(iconoEliminar);

                // Agregamos cada rol con su li dentro de la lista roles
                ulPlanesAsignados.appendChild(li);
            });

            // Agregamos la lista completa con todos los roles agregados al div contenedor oculto
            divPlanesAsignados.appendChild(ulPlanesAsignados);
            // Mostramos el div oculto
            divPlanesAsignados.style.display = 'flex';
        } else {
            mostrarMsjCliente('Dato incorrecto', ['El Plan ingresado ya ha sido asignado.']);
            return;
        }
    }


    //ELIMINAR PLAN 
    // cada li en roles asignados tiene un event click en eliminar que ejecuta esta funcion para eliminar de la vista y el array roles.
    const eliminarPlan = (event) => {
        event.preventDefault();
        const li = event.target.closest('li');
        if (li) {
            // Obtenemos el id del rol a eliminar desde el valor del <li>
            const descripcion = li.textContent;

            // Encontramos el rol en el array roles
            const plan = planesAsignados.find(plan => plan.nombre == descripcion);

            // Filtramos el array roles para eliminar el rol correspondiente
            planesAsignados = planesAsignados.filter(plan => plan.nombre != descripcion);

            // Eliminamos el elemento <li> del DOM
            li.remove();
            console.log('eliminar');

            console.log(planesAsignados);

            // Si se borra el último elemento, ocultamos el div completo
            if (planesAsignados.length === 0) {
                divPlanesAsignados.style.display = 'none';
            }
        }
    };


    //B O T O N   B U S C A R   O B R A   S O C I A L
    btnBuscar.addEventListener('click', () => {
        // Capturar el valor del input y convertirlo a mayúsculas
        const obraSocialIngresada = nombreInput.value.trim().toUpperCase();
        // Validar longitud de la descripción
        if (!validarDescripcion(obraSocialIngresada)) {
            return;
        }
        //RECORRER OBRAS SOCIALES
        if (validarObraSocialExistente(obraSocialIngresada, allObrasSociales)) {
            return;
        }

        divMasCampos.classList.remove('displayNone');
        btnAgregarObraSocial.classList.remove('displayNone');
        // btnAgregarObraSocial.classList.remove('displayNone');

        nombreInput.addEventListener('input', function () {
            //al modificar la prestacion encontrada , reiniciar la busqueda para evitar errores
            reiniciarBusqueda();
        });
    });


    //B O T O N   A S I G N A R   P L A N
    btnAsignarPlan.addEventListener('click', () => {
        event.preventDefault();  // Previene el comportamiento por defecto

        let planIngresado = planInput.value.trim().toUpperCase();

        // Validar longitud de la descripción
        if (!validarPlan(planIngresado)) {
            return;
        }

        //RECORRER PLANES DE LA BASE, si nombre existe capturar id sino guardar descripcion y agregar:true
        planIngresado = procesarPlan(planIngresado, allPlanes);
        //Asignar Plan a menos que ya exista en el ul Planes asignados
        asignarPlan(planIngresado, planesAsignados);
    });

    //VALIDAR CON EXPRESION REGULAR TELEFONO
    function validarTelefono(telefono) {
        // Validar telefono ingresado
        const regex = /^\+?[1-9]\d{1,14}$/;
        if (!regex.test(telefono)) {
            mostrarMsjCliente('Dato incorrecto', ['El numero de Telefono debe comenzar con un código de país y contener solo dígitos.', 'Ejemplo: +542664123456']);
            return false;
        }
        return true;
    }

    //VALIDAR CON EXPRESION REGULAR DIRECCION
    function validarDireccion(direccion) {
        // Validar telefono ingresado
        const regex = /^[A-Za-z\s,.'0-9]+$/;
        if (!regex.test(direccion)) {
            mostrarMsjCliente('Dato incorrecto', ['Direccion puede contener letras (sin tildes), numeros, espacios, comas, puntos y apostrofes.', ' Ejemplo: Argentina, San Luis Capital. San Martin 456.']);
            return false;
        }
        return true;
    }




    //B O T O N    A G R E G A R    O B R A   S O C I A L

    async function fetchAgregarObraYplan(obraSocialIngresada, telefonoIngresado, direccionIngresada, estadoIngresado, planesAsignados) {
        const data = {
            obraSocialIngresada,
            telefonoIngresado,
            direccionIngresada,
            estadoIngresado,
            planesAsignados
        };

        console.log(data);

        try {
            const response = await fetch('/agregarObraSocialConPlan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error en la solicitud: ${response.statusText}`);
            }

            return response;  // Retornar la respuesta en caso de éxito
        } catch (error) {
            console.error('Error en fetchAgregarObraYplan:', error);
            return null;  // Retornar null o un objeto vacío en caso de error
        }
    }

    btnAgregarObraSocial.addEventListener('click', async (event) => {
        event.preventDefault();

        const obraSocialIngresada = nombreInput.value.trim().toUpperCase();
        const telefonoIngresado = telefonoInput.value.trim();
        const direccionIngresada = direccionInput.value.trim().toUpperCase();

        if (!validarTelefono(telefonoIngresado) || !validarDireccion(direccionIngresada)) {
            return;
        }

        let estadoIngresado = estadoSelect.value === 'DISPONIBLE' ? 1 : 0;

        if (!planesAsignados.length) {
            mostrarMsjCliente('Datos incompletos', ['Debe asignar como mínimo un plan a la obra social.']);
            return;
        }

        try {
            const response = await fetchAgregarObraYplan(obraSocialIngresada, telefonoIngresado, direccionIngresada, estadoIngresado, planesAsignados);

            if (!response) {
                mostrarMsjCliente('Error', ['No se pudo conectar con el servidor.']);
                return;
            }

            if (!response.ok) {
                const errorResult = await response.json();
                mostrarMsjCliente('Error', [errorResult.message]);
                return;
            }

            const result = await response.json();
            mostrarMsjCliente('Datos agregados', [result.message]);
            reiniciarBusqueda();

        } catch (error) {
            console.error('Error al agregar obra social:', error);
            mostrarMsjCliente('Error', ['Hubo un problema al intentar agregar la obra social.']);
        }
    });







});
