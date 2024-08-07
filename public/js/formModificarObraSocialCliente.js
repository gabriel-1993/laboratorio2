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
    const btnModificarObraSocial = document.querySelector('.btnModificarObraSocial');

    // VARIABLES CON MAYOR SCOPE
    let obraSocialIngresada;
    //Datos base de datos
    let datos = [];
    let allObrasSociales = [];
    let allPlanes = [];

    //Asignados en el front
    let planesAsignadosFront = [];
    let planesAsignadosBDD = [];

    datos = await fetchObtenerObrasSocialesYplanes();
    if (datos) {
        allObrasSociales = datos.allObrasSociales;
        allPlanes = datos.allPlanes;

        //Mostrar lista al hacer click en inputs y filtrar lista por letras ingresadas
        configurarInputConLista('#nombre', '.obrasSociales-list', allObrasSociales);
        configurarInputConLista('#plan', '.planes-list', allPlanes);
    }

    //Al modificar la obra social ingresada reiniciar busqueda
    async function reiniciarBusqueda() {
        // obraSocialIngresada = '';
        datos = [];
        allObrasSociales = [];
        allPlanes = [];
        planesAsignadosFront = [];
        planesAsignadosBDD = [];
        divMasCampos.classList.add('displayNone');
        btnModificarObraSocial.classList.add('displayNone');
        ulPlanesAsignados.innerHTML = '';
        divPlanesAsignados.innerHTML = '';
        //nombreInput.value = '';
        telefonoInput.value = '';
        direccionInput.value = '';
        // Volver a ejecutar la búsqueda
        await buscarObraSocial();

        // datos = await fetchObtenerObrasSocialesYplanes();
        // if (datos) {
        //     allObrasSociales = datos.allObrasSociales;
        //     allPlanes = datos.allPlanes;

        //     //Mostrar lista al hacer click en inputs y filtrar lista por letras ingresadas
        //     configurarInputConLista('#nombre', '.obrasSociales-list', allObrasSociales);
        //     configurarInputConLista('#plan', '.planes-list', allPlanes);
        // }
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

    // MOSTRAR DATOS DE OBRA SOCIAL, SI NO EXISTE MOSTRA MSJ DE ERROR
    function renderizarDatosObraSocial(obraSocialIngresada, allObrasSociales) {
        nombreInput.value = obraSocialIngresada.nombre;
        telefonoInput.value = obraSocialIngresada.telefono;
        direccionInput.value = obraSocialIngresada.direccion;
        estadoSelect.value = obraSocialIngresada.estado;

        divMasCampos.classList.remove('displayNone');
        btnModificarObraSocial.classList.remove('displayNone')
    }

    // RENDERIZAR PLANES ASIGNADOS A OBRA SOCIAL
    function renderizarPlanesAsignados(planesAsignadosFront) {
        divPlanesAsignados.innerHTML = '';
        ulPlanesAsignados.innerHTML = '';

        //AGREGAR TITULO PLANES ASIGNADOS
        const li = document.createElement('li');
        li.textContent = 'PLANES ASIGNADOS';
        li.classList.add('liPlanesAsignados');
        ulPlanesAsignados.appendChild(li);



        planesAsignadosFront.forEach(element => {
            const li = document.createElement('li');

            li.textContent = element.nombrePlan;
            li.setAttribute('data-plan-id', element.plan_id);
            li.classList.add('planAsignado');

            ulPlanesAsignados.appendChild(li);

            // Agregar icono eliminar con evento para ejecutar eliminar
            const iconoEliminar = document.createElement('span');
            iconoEliminar.className = 'fa fa-trash';
            iconoEliminar.addEventListener('click', eliminarPlan); // Agregar evento de clic
            li.appendChild(iconoEliminar);

            // Agregamos cada rol con su li dentro de la lista roles
            ulPlanesAsignados.appendChild(li);


        });

        divPlanesAsignados.appendChild(ulPlanesAsignados);
    }

    //VALIDAR PLAN EXISTENTE: capturar ID para asignarlo, si es nuevo propiedad agrerar:true para el controlador
    function procesarPlan(planIngresado, allPlanes) {
        // Recorrer las obras sociales
        for (const plan of allPlanes) {
            if (plan.nombre === planIngresado) {
                return {
                    agregar: false,
                    asignar: true,
                    nombrePlan: plan.nombre,
                    plan_id: plan.id
                }
            }
        }
        return {
            agregar: true,
            asignar: true,
            nombrePlan: planIngresado,
            plan_id: ''
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

    //FETCH PARA OBTENER TODOS LOS PLANES ASIGNADOS A LA OBRA SOCIAL
    async function fetchObtenerPlanesAsignados(obraSocialID) {
        try {
            const response = await fetch('/obtenerPlanesAsignados', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idObraSocial: obraSocialID })  // Enviar idObraSocial en el cuerpo
            });

            // Verificar si la solicitud fue exitosa
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            // Parsear la respuesta a JSON
            const datos = await response.json();
            return datos.planesAsignados;
        } catch (error) {
            // Manejo de errores
            console.error('Hubo un problema con la solicitud:', error);
            mostrarMsjCliente('Error en conexión', ['Error al obtener planes asignados.']);
            return null;
        }
    }


    //ASIGNAR PLAN (agrega boton eliminar en cada opcion agregada)
    const asignarPlan = (planIngresado, planesAsignadosFront) => {
        // Verificamos si el rol ya está en el array roles
        if (!planesAsignadosFront.some(plan => plan.nombrePlan === planIngresado.nombre)) {
            // Reiniciamos para evitar duplicados visuales
            ulPlanesAsignados.classList.remove('displayNone');
            divPlanesAsignados.innerHTML = '';
            ulPlanesAsignados.innerHTML = '';

            // Agregamos el rol al array
            planesAsignadosFront.push(planIngresado);

            // Título para mostrar roles asignados
            const liTitulo = document.createElement('li');
            liTitulo.innerHTML = 'PLANES ASIGNADOS';
            liTitulo.classList.add('liPlanesAsignados');
            ulPlanesAsignados.appendChild(liTitulo);

            // Renderizamos los roles asignados
            renderizarPlanesAsignados(planesAsignadosFront);
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
            const plan = planesAsignadosFront.find(plan => plan.nombrePlan == descripcion);


            if (planesAsignadosFront.length > 1) {
                // Filtramos el array roles para eliminar el rol correspondiente
                planesAsignadosFront = planesAsignadosFront.filter(plan => plan.nombrePlan != descripcion);

                // Eliminamos el elemento <li> del DOM
                li.remove();
            }else{
                mostrarMsjCliente('Datos incorrectos',['La Obra social debe tener minimo un plan asignado.']);
                return;
            }


        
        }
    };

    // CAPTURAR DATOS DE OBRA SOCIAL
    const obtenerObraSocialCompleta = (obraSocialIngresada, allObrasSociales) => {
        for (const element of allObrasSociales) {
            if (element.nombre === obraSocialIngresada) {
                return element; // Retorna el elemento encontrado
            }
        }
        return null; // Retorna null si no se encuentra la obra social
    }



    //ACA CARGAR DATOS DE OBRA SOCIAL Y SUS PLANES
    //B O T O N   B U S C A R   O B R A   S O C I A L

    async function buscarObraSocial() {
        // Capturar el valor del input y convertirlo a mayúsculas
        obraSocialIngresada = nombreInput.value.trim().toUpperCase();

        // Expresión regular con mensaje de error
        if (!validarDescripcion(obraSocialIngresada)) {
            return;
        }

        // Capturar datos de obra social: en array de obrasSociales capturar objeto
        obraSocialIngresada = obtenerObraSocialCompleta(obraSocialIngresada, allObrasSociales);
        if (!obraSocialIngresada) {
            mostrarMsjCliente('Dato incorrecto', ['La Obra Social ingresada no existe, no es posible realizar modificaciones.']);
            return;
        }

        // Obtener planes asignados de la obra social encontrada
        planesAsignadosBDD = await fetchObtenerPlanesAsignados(obraSocialIngresada.id);

        // Renderizar datos de obra social y sus planes
        renderizarDatosObraSocial(obraSocialIngresada, allObrasSociales);

        // Crear una copia de los planes asignados para evitar referencias
        planesAsignadosFront = [...planesAsignadosBDD];

        renderizarPlanesAsignados(planesAsignadosFront);

        divMasCampos.classList.remove('displayNone');
        btnModificarObraSocial.classList.remove('displayNone');
    }

    // Evento para el botón de buscar obra social
    btnBuscar.addEventListener('click', buscarObraSocial);


    //B O T O N   A S I G N A R   P L A N
    btnAsignarPlan.addEventListener('click', () => {
        event.preventDefault();  // Previene el comportamiento por defecto

        let planIngresado = planInput.value.trim().toUpperCase();

        // Validar longitud de la descripción
        if (!validarPlan(planIngresado)) {
            return;
        }

        //VALIDAR QUE YA NO ESTE ASIGNADO
        for (const element of planesAsignadosFront) {
            if (element.nombrePlan === planIngresado) {
                mostrarMsjCliente('Plan incorrecto', ['El Plan ya se encuentra asigado.']);
                return;
            }
        }

        //RECORRER PLANES DE LA BASE, si nombre existe capturar id sino guardar descripcion y agregar:true
        planIngresado = procesarPlan(planIngresado, allPlanes);
        //Asignar Plan a menos que ya exista en el ul Planes asignados
        asignarPlan(planIngresado, planesAsignadosFront);
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


    //B O T O N    MO D I F I C A R   O B R A   S O C I A L
    //VALIDAR SI PLANESASIGNADOSFRONT TIENE EL MISMO LENGHT Y OBJETOS QUE PLANESASIGNADOSBDD
    function planesModificadosBool(arr1, arr2) {
        // Verificar si ambos arrays tienen la misma longitud
        if (arr1.length !== arr2.length) {
            return true; // Hay una diferencia en la longitud
        }

        // Función para comparar dos objetos
        function compararObjetos(obj1, obj2) {
            return obj1.obraSocial_id === obj2.obraSocial_id &&
                obj1.plan_id === obj2.plan_id &&
                obj1.nombrePlan === obj2.nombrePlan;
        }

        // Verificar que cada objeto de arr1 exista en arr2
        for (let obj1 of arr1) {
            const matchingObj = arr2.find(obj2 => compararObjetos(obj1, obj2));
            if (!matchingObj) {
                return true; // Hay una diferencia
            }
        }
        // Si todos los objetos coinciden, no hay diferencias
        return false;
    }

    //DESASIGNAR PLANES DE OBRA SOCIAL
    function capturarPlanesEliminados(planesAsignadosFront, planesAsignadosBDD) {
        const planesNoExistentes = planesAsignadosBDD.filter(planBDD => {
            return !planesAsignadosFront.some(planFront =>
                planFront.obraSocial_id === planBDD.obraSocial_id &&
                planFront.plan_id === planBDD.plan_id &&
                planFront.nombrePlan === planBDD.nombrePlan
            );
        });
        return planesNoExistentes;
    }

    // VERIFICAR SI OBRA SOCIAL TIENE CAMBIOS
    function obraSocialModificadaBool(obraSocialIngresada, nombre, telefono, direccion, estado) {
        if (obraSocialIngresada.nombre === nombre &&
            obraSocialIngresada.telefono === telefono &&
            obraSocialIngresada.direccion === direccion &&
            obraSocialIngresada.estado == estado) {
            // NO HAY CAMBIOS PARA OBRA SOCIAL
            return false;
        } else {
            //Hay al menos un cambio
            //asignar datos ingresados al objeto obra social
            obraSocialIngresada.nombre = nombre;
            obraSocialIngresada.telefono = telefono;
            obraSocialIngresada.direccion = direccion;
            //parsear entero
            estado = parseInt(estado, 10);
            obraSocialIngresada.estado = estado;
            return true;
        }
    }

    //ENVIAR OBJETO OBRA SOCIAL Y ARRAY DE PLANES ASIGNADOS
    async function fetchModificarObraYplan(obraSocialIngresada, planesAsignadosFront, eliminarPlanes) {
        const data = {
            obraSocialIngresada,
            planesAsignadosFront,
            eliminarPlanes
        };

        try {
            const response = await fetch('/modificarObraSocialPlanes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error en la solicitud: ${response.statusText}`);
            } else {
                const result = await response.json();  // Convertir la respuesta a JSON

                // Mostrar mensaje de éxito
                reiniciarBusqueda();
                mostrarMsjCliente('Datos modificacos', ['Datos modificados con exito.']);
            }


        } catch (error) {
            console.error('Error en fetchModificarObraYplan:', error);
            // Mostrar mensaje de error
            mostrarMsjCliente('error', [error.message || 'Ocurrió un error al modificar la obra social.']);
        }
    }

    btnModificarObraSocial.addEventListener('click', () => {
        event.preventDefault();  // Previene el comportamiento por defecto

        const nombre = nombreInput.value.trim().toUpperCase();
        const telefono = telefonoInput.value.trim();
        const direccion = direccionInput.value.trim().toUpperCase();
        const estado = estadoSelect.value;

        //Validar modificaciones y asignar datos ingresados en obraSocialIngresada
        let modificarObra = obraSocialModificadaBool(obraSocialIngresada, nombre, telefono, direccion, estado);
        let modificarPlanes = planesModificadosBool(planesAsignadosFront, planesAsignadosBDD);

        // SI AMBOS SON FALSE NO HAY MODIFICACIONES PARA HACER: return
        if (modificarObra && modificarPlanes) {
            mostrarMsjCliente('Datos incorrectos', ['No se encontraron modificaciones.']);
            return;
        }

        if (planesAsignadosFront.length === 0) {
            mostrarMsjCliente('Datos incorrectos', ['Obra social debe terner asignado minimo un Plan.']);
            return;
        }
        //agregar modificar al objeto para el controlador
        if (modificarObra) {
            obraSocialIngresada.modificar = true;
        }
        //agregar modificar al objeto para el controlador
        if (modificarPlanes) {
            planesAsignadosFront.modificar = true;
        }

        const eliminarPlanes = capturarPlanesEliminados(planesAsignadosFront, planesAsignadosBDD);

        fetchModificarObraYplan(obraSocialIngresada, planesAsignadosFront, eliminarPlanes);


    });

});

