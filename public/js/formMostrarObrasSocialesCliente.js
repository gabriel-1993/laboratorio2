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
    const divContenedorPlanes = document.querySelector('.contenedorPlanes');
    const divContenedorObras = document.querySelector('.contenedorObrasSociales');

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



    // MOSTRAR DATOS DE OBRA SOCIAL, SI NO EXISTE MOSTRA MSJ DE ERROR
    function renderizarDatosObraSocial(obraSocialIngresada, allObrasSociales) {
        nombreInput.value = obraSocialIngresada.nombre;
        telefonoInput.value = obraSocialIngresada.telefono;
        direccionInput.value = obraSocialIngresada.direccion;
        if (obraSocialIngresada.estado === 1) {
            const opt = document.createElement('option');
            opt.textContent = 'DISPONIBLE';
            opt.value = '1'; // Puedes ajustar el valor según lo que necesites
            estadoSelect.appendChild(opt);
        } else if (obraSocialIngresada.estado === 0) {
            const opt = document.createElement('option');
            opt.textContent = 'NO DISPONIBLE';
            opt.value = '0'; // Puedes ajustar el valor según lo que necesites
            estadoSelect.appendChild(opt);
        }
        divMasCampos.classList.remove('displayNone');
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
            // Agregamos cada rol con su li dentro de la lista roles
            ulPlanesAsignados.appendChild(li);
        });

        divPlanesAsignados.appendChild(ulPlanesAsignados);
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
    }

    // Evento para el botón de buscar obra social
    btnBuscar.addEventListener('click', buscarObraSocial);


    function cargarPlanes(allPlanes) {

        for (const element of allPlanes) {
            const divCard = document.createElement('div');
            const h4 = document.createElement('h4');
            h4.textContent = `Plan ID #${element.id}`;
            h4.classList.add('text-fondoAzul');
            h4.classList.add('borderRadiusTop5px');
            divCard.appendChild(h4);
            divCard.classList.add('divCard');

            const div = document.createElement('div');
            const label = document.createElement('label');
            label.classList.add('labelCenter');
            label.textContent = 'Nombre'
            const input = document.createElement('input');
            input.value = `${element.nombre}`;
            div.appendChild(label);
            div.appendChild(input);
            div.classList.add('displayFlex');
            divCard.appendChild(div);
            divContenedorPlanes.appendChild(divCard);

        }
    }

    cargarPlanes(allPlanes);

    console.log(allObrasSociales);


    function cargarObrasSociales(allObrasSociales) {
        allObrasSociales.forEach(element => {
            //card obra social
            const cardObra = document.createElement('div');
            // titulo con fondo azul
            const h4 = document.createElement('h4');
            h4.textContent = `Obra Social ID #${element.id}`;
            h4.classList.add('text-fondoAzul');
            h4.classList.add('borderRadiusTop5px');
            cardObra.appendChild(h4);

            //div contenedor de los div con input label
            const divDatos = document.createElement('div');
            divDatos.style.display='flex';
            divDatos.style.flexDirection ='column';
            divDatos.style.gap= '8px';


            //NOMBRE
            //div contenedor input y label
            const div = document.createElement('div');
            const label = document.createElement('label');
            const input = document.createElement('input');
            label.textContent = 'Nombre';
            label.classList.add('labelCenter');
            input.value = element.nombre;
            div.appendChild(label);
            div.appendChild(input);
            div.classList.add('datoItem');
            divDatos.appendChild(div);

            //TELEFONO
            const div2 = document.createElement('div');
            const label2 = document.createElement('label');
            const input2 = document.createElement('input');
            label2.textContent = 'Telefono';
            label2.classList.add('labelCenter');
            input2.value = element.telefono;
            div2.appendChild(label2);
            div2.appendChild(input2);
            div2.classList.add('datoItem');
            divDatos.appendChild(div2);

            //DIRECCION
            const div3 = document.createElement('div3');
            const label3 = document.createElement('label');
            const input3 = document.createElement('input');
            label3.classList.add('labelCenter');
            label3.textContent = 'Direccion';
            input3.value = element.direccion;
            div3.appendChild(label3);
            div3.appendChild(input3);
            div3.classList.add('datoItem');
            divDatos.appendChild(div3);

            // //ESTADO 
            const div4 = document.createElement('div');
            div4.classList.add('datoItem');
            const label4 = document.createElement('label');
            label4.classList.add('labelCenter');
            const input4 = document.createElement('input');
            label4.textContent = 'Estado';
            if (element.estado === 1) {
                input4.value = 'DISPONIBLE'
            }
            if (element.estado === 0) {
                input4.value = 'NO DISPONIBLE';
            }
            div4.appendChild(label4);
            div4.appendChild(input4);
            divDatos.appendChild(div4);
            cardObra.classList.add('divCard');
            cardObra.classList.add('cardObras');
            cardObra.appendChild(divDatos);
            divContenedorObras.appendChild(cardObra);
        });
    }

    cargarObrasSociales(allObrasSociales);

});

