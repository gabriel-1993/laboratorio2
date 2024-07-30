import { mostrarMsjCliente } from "./mostrarMsjCliente.js";

document.addEventListener('DOMContentLoaded', async function () {

    const pMedicamentoBusqueda = document.querySelector('.pMedicamentoBusqueda');
    const h4Medicamento = document.querySelector('.h4Medicamento');
    const h4MedicamentoItem = document.querySelector('.h4MedicamentoItem');

    const nombre_generico_input = document.getElementById('nombreGenerico');
    const nombre_generico_lista = document.querySelector('.medicamentos-list');

    const divMedicamentosExistentes = document.querySelector('.divMedicamentosExistentes');
    const divDatosMedicamento = document.querySelector('.divDatosMedicamento ');
    const divContenedorItems = document.querySelector('.divContenedorItems');
    const nombre_comercial_input = document.getElementById('nombreComercial');
    const familia_input = document.getElementById('familia');
    const familia_lista = document.querySelector('.familia-list');
    const categoria_input = document.getElementById('categoria');
    const categoria_lista = document.querySelector('.categoria-list');
    const selectEstadoMedicamento = document.querySelector('.selectEstadoMostrarMedicamento');
    const btnBuscar = document.querySelector('.btnBuscar');

    //VARIABLES CON MAYOR SCOPE
    let msjs = [];
    let medicamentoEncontrado;
    let itemsMedicamento;
    let medicamentosBase;


    //TRAER TOD@S MEDICAMENTOS *************************************************************************************************************
    async function fetchBuscarMedicamentosTodos() {
        try {
            const response = await fetch('/buscarMedicamentosTodos');
            const data = await response.json();

            if (response.ok) {
                // Suponiendo que 'medicamentos' es la propiedad que contiene el array
                return data.medicamentos || [];
            } else {
                console.error('Error al obtener todos los medicamentos:');
                return [];
            }
        } catch (error) {
            console.error('Error al llamar a todos los medicamentos:', error);
            return [];
        }
    }

    // Obtener datos de la base de datos
    medicamentosBase = await fetchBuscarMedicamentosTodos();


    //EJECUTAR EL FETCH ANTERIOR Y CARGAR LA LISTA medicamento CON LOS EVENTOS PARA FILTRAR RESULTADOS Y OCULTAR LISTAS 
    async function cargarListasInputConFiltro() {

        function mostrarLista(array, listaUl) {

            listaUl.innerHTML = '';
            array.forEach(elem => {
                const li = document.createElement('li');
                li.classList.add('listaFiltradaItem');
                if (elem.nombre_generico) {
                    li.textContent = elem.nombre_generico;
                }
                li.dataset.id = elem.id;
                listaUl.appendChild(li);
            });
            listaUl.classList.remove('displayNone');
            listaUl.classList.add('listaFiltrada');
        }

        function ocultarListas() {
            datosMedicamentos.forEach(({ lista }) => {
                lista.innerHTML = '';
                lista.classList.add('displayNone');
            });
        }

        const datosMedicamentos = [
            { input: nombre_generico_input, lista: nombre_generico_lista, array: medicamentosBase, key: 'nombre_generico' }
        ];

        // Mostrar y filtrar listas en el formulario de medicamentos
        datosMedicamentos.forEach(({ input, lista, array, key }) => {
            input.addEventListener('click', () => {
                mostrarLista(array, lista, key);
            });

            input.addEventListener('input', (e) => {
                const filtro = e.target.value.toLowerCase();
                const filtrados = array.filter(item => item[key].toLowerCase().includes(filtro));
                mostrarLista(filtrados, lista, key);
            });

            lista.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI') {
                    input.value = e.target.textContent;
                    ocultarListas();
                }
            });
        });

        // Ocultar lista con clic fuera o scroll
        document.addEventListener('click', (e) => {
            let clickEnInputOLaLista = false;
            datosMedicamentos.forEach(({ input, lista }) => {
                if (lista.contains(e.target) || e.target === input) {
                    clickEnInputOLaLista = true;
                }
            });

            if (!clickEnInputOLaLista) {
                ocultarListas();
            }
        });

        window.addEventListener('scroll', ocultarListas);
    }

    //EJECUTAR CARGAR LISTA
    cargarListasInputConFiltro();

    //REINICIAR BUSQUEDA : se ejecuta en linea  4 8 2 
    // luego de buscar nombre generico si modifican el input se reinicia todo el form
    // vaciar variables con mayor scope y divs con contenido
    function reiniciarBusqueda() {
        divContenedorItems.innerHTML = '';
        medicamentoEncontrado = '';
        itemsMedicamento = '';
        nombre_comercial_input.value = '';
        familia_input.value = '';
        categoria_input.value = '';
        medicamentosBase = '';
        addDisplayNone();
    };

    function addDisplayNone() {
        h4Medicamento.classList.add('displayNone');
        h4MedicamentoItem.classList.add('displayNone');
        //ocultar p el nombre ya fue ingresado
        pMedicamentoBusqueda.classList.remove('displayNone');
        divDatosMedicamento.classList.add('displayNone');
        divMedicamentosExistentes.classList.add('displayNone');
    };

    function removeDisplayNone() {
        h4Medicamento.classList.remove('displayNone');
        h4MedicamentoItem.classList.remove('displayNone');
        pMedicamentoBusqueda.classList.add('displayNone');
        divDatosMedicamento.classList.remove('displayNone');
        //mostrar el p que solicita el nombre generico
        divMedicamentosExistentes.classList.remove('displayNone');
    };
    //Si es modificado nombre generico se reinica toda la busqueda 
    //nombre_generico_input.addEventListener('input', reiniciarBusquedaToggleDisplay);
    function reiniciarBusquedaToggleDisplay() {
        addDisplayNone();
        reiniciarBusqueda();
    }



    //************************************************************************************************************************************************************************************************** */

    //VALIDAR EL NOMBRE INGRESADO CON LA BASE DE DATOS 
    async function buscarNombreGenerico(nombre_generico) {

        try {
            const response = await fetch(`/buscarNombreGenerico?nombre_generico=${encodeURIComponent(nombre_generico)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (response.ok) {
                if (result.mensaje) {
                    mostrarMsjCliente('Dato incorrecto', [result.mensaje]);
                    return false;
                } else {
                    mostrarMsjCliente('Medicamento encontrado', ['En la lista cargada, puede consultar todos los items que pertenecen al medicamento ingresado.']);
                    return result;
                }
            } else {
                mostrarMsjCliente('Error', [result.mensaje]);
                return [false];
            }
        } catch (error) {
            mostrarMsjCliente('Error...', [error.message]);
        }
    }

    //DOS FUNCIONES EN UNA
    // OBTENER ITEMS EXISTENTES DEL MEDICAMENTO ENCONTRADO PARA MOSTRAR SU LISTA.
    async function obtenerYMostrarItems(medicamentoEncontrado) {

        // CREO OBTENER Y MOSTRAR DENTRO DE ESTA FUNCION YA QUE ES LA UNICA QUE LAS EJECUTA

        // OBTENER : MEDICAMENTO ENCONTRADO --> BUSCAR ITEMS DEL MEDICAMENTO 
        async function buscarItemsMedicamento(medicamento_id) {
            try {
                const response = await fetch(`/buscarItemsMedicamento?medicamento_id=${encodeURIComponent(medicamento_id)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    return result;
                } else {
                    return ['No se encontraron items'];
                }
            } catch (error) {
                mostrarMsjCliente('Error...', [error.message]);
            }
        }


        // MOSTRAR ITEMS DEL MEDICAMENTO ENCONTRADO . CREAR CARDS Y RENDERIZARLAS (card contiene: h4, un div por renglon 3 divs(label+input) en cada renglon).
        function mostrarItems(medicamentoEncontrado, items) {

            divMedicamentosExistentes.classList.remove('displayNone');
            // div que va contener cada card con los divDatosMedicamento
            divContenedorItems.innerHTML = '';
            divContenedorItems.classList.remove('displayNone');

            items.forEach(element => {

                let estadoBool = true;
                if (element.estado === 0) {
                    estadoBool = false;
                }

                const cardItem = document.createElement('div');
                cardItem.classList.add('cardItem')

                const h4 = document.createElement('h4');
                h4.classList.add('text-fondoAzul');
                h4.classList.add('borderRadiusTop5px');
                h4.innerHTML = `Medicamento Item ID ${element.item_id}`;
                cardItem.appendChild(h4);

                //primer renglon con datos del item ( nombre generico, nombre comercial, estado)
                const divDatos1 = document.createElement('div');
                divDatos1.classList.add('divFlexRow');
                divDatos1.classList.add('datosItem');

                //segundo renglon con datos del item (presentacion, forma farmaceutica, concentracion)
                const divDatos2 = document.createElement('div');
                divDatos2.classList.add('divFlexRow');
                divDatos2.classList.add('datosItem');

                //div con label e input para nombre_generico
                const divMedicamento = document.createElement('div');
                const labelMedicamento = document.createElement('label');
                labelMedicamento.classList.add('labelCenter');
                labelMedicamento.classList.add('labelCenter142px');
                labelMedicamento.innerHTML = 'Nombre Generico';

                const inputMedicamento = document.createElement('input');
                inputMedicamento.value = medicamentoEncontrado.nombre_generico;
                inputMedicamento.classList.add('inputItemMedicamento');

                divMedicamento.appendChild(labelMedicamento);
                divMedicamento.appendChild(inputMedicamento);
                divMedicamento.classList.add('datoItem');

                divDatos1.appendChild(divMedicamento);

                //div con label e input de nombre comercial
                const divComercial = document.createElement('div');
                const labelComercial = document.createElement('label');
                labelComercial.classList.add('labelCenter');
                labelComercial.classList.add('labelCenter142px');
                labelComercial.innerHTML = 'Nombre Comercial';

                const inputComercial = document.createElement('input');
                // Asignar el valor al input, comprobando si es null o una cadena vacía
                if (medicamentoEncontrado == undefined || medicamentoEncontrado.nombre_comercial == null || medicamentoEncontrado.nombre_comercial === '') {
                    inputComercial.value = 'DATO DESCONOCIDO';
                } else {
                    inputComercial.value = medicamentoEncontrado.nombre_comercial;
                }

                inputComercial.classList.add('inputItemMedicamento');

                divComercial.appendChild(labelComercial);
                divComercial.appendChild(inputComercial);
                divComercial.classList.add('datoItem');

                divDatos1.appendChild(divComercial);

                //agregar estado de disponibilidad del item en lugar de la concentracion
                const divEstado = document.createElement('div');

                const labelEstado = document.createElement('label');
                labelEstado.classList.add('labelCenter');
                labelEstado.classList.add('labelCenter142px');
                labelEstado.innerHTML = 'Estado';

                const inputEstado = document.createElement('input');
                inputEstado.classList.add('inputItemMedicamento');

                if (estadoBool) {
                    inputEstado.value = 'DISPONIBLE';
                } else {
                    inputEstado.value = 'NO DISPONIBLE';
                }


                divEstado.appendChild(labelEstado);
                divEstado.appendChild(inputEstado);
                divEstado.classList.add('datoItem');

                divDatos1.appendChild(divEstado);


                //SEGUNDO RENGLON
                //FORMA
                const divForma = document.createElement('div');

                const labelForma = document.createElement('label');
                labelForma.classList.add('labelCenter');
                labelForma.classList.add('labelCenter142px');
                labelForma.innerHTML = 'Forma farmaceutica';

                const inputForma = document.createElement('input');
                inputForma.value = element.descripcion_forma;
                inputForma.classList.add('inputItemMedicamento');

                divForma.appendChild(labelForma);
                divForma.appendChild(inputForma);
                divForma.classList.add('datoItem');

                divDatos2.appendChild(divForma);

                //PRESENTACION
                const divPresentacion = document.createElement('div');

                const labelPresentacion = document.createElement('label');
                labelPresentacion.classList.add('labelCenter');
                labelPresentacion.classList.add('labelCenter142px');
                labelPresentacion.innerHTML = 'Presentacion';

                const inputPresentacion = document.createElement('input');
                inputPresentacion.value = element.descripcion_presentacion;
                inputPresentacion.classList.add('inputItemMedicamento');

                divPresentacion.appendChild(labelPresentacion);
                divPresentacion.appendChild(inputPresentacion);
                divPresentacion.classList.add('datoItem');


                divDatos2.appendChild(divPresentacion);


                //CONCENTRACION

                //div con label e input concentracion en lugar del estado
                const divConcentracion = document.createElement('div');

                const labelConcentracion = document.createElement('label');
                labelConcentracion.classList.add('labelCenter');
                labelConcentracion.classList.add('labelCenter142px');
                labelConcentracion.innerHTML = 'Concentracion';

                const inputConcentracion = document.createElement('input');
                inputConcentracion.value = element.descripcion_concentracion;
                inputConcentracion.classList.add('inputItemMedicamento');

                divConcentracion.appendChild(labelConcentracion);
                divConcentracion.appendChild(inputConcentracion);
                divConcentracion.classList.add('datoItem');

                divDatos2.appendChild(divConcentracion);

                //guardar ambos renglones de datos en la card del medicamento item
                cardItem.appendChild(divDatos1);
                cardItem.appendChild(divDatos2);

                //guardar card en el contenedor general de medicamentos items
                divContenedorItems.appendChild(cardItem);

            });
        }


        // EJECUCION DE LAS FUNCIONES DECLARADAS PREVIAMENTES
        try {
            // Obtener los items del medicamento encontrado
            itemsMedicamento = await buscarItemsMedicamento(medicamentoEncontrado.id);
            // Mostrar los items una vez obtenidos
            mostrarItems(medicamentoEncontrado, itemsMedicamento);
            return itemsMedicamento;
        } catch (error) {
            console.error('Error al obtener y mostrar los items:', error);
            // Manejar el error según sea necesario
        }
    }

    //VALIDAR NOMBRE
    function validarNombre(nombre, tipo) {
        const regex = /^[A-Za-z0-9 ]{6,100}$/;
        let mensaje;

        // Determinar el mensaje de error basado en el tipo
        switch (tipo) {
            case 'generico':
                mensaje = 'Nombre genérico debe contener solo letras, números y espacios, min 6 y max 100 caracteres.';
                break;
            case 'comercial':
                mensaje = 'Nombre comercial debe contener solo letras, números y espacios, min 6 y max 100 caracteres.';
                break;
            default:
                console.error('Tipo de nombre no válido.');
                return false;
        }

        // Verificar si el nombre cumple con la expresión regular
        if (!regex.test(nombre)) {
            msjs.push(mensaje);
            mostrarMsjCliente('Dato incorrecto', msjs);
            return false;
        }

        return true;
    }


    //B O T O N    B U S C A R : N O M B R E   G E N E R I C O *************************************************************************************************************************************

    // BUSCAR el nombre generico Y CARGAR SUS DATOS SI ES ENCONTRADO, SI NO MOSTRAR MSJ DE ERROR...
    btnBuscar.addEventListener('click', async () => {

        msjs = [];
        // VALIDAR NOMBRE GENERICO INGRESADO ANTES DE HACER EL FETCH, SINO MOSTRAR MSJ DE ERROR...
        const nombre_generico = nombre_generico_input.value.trim().toUpperCase();

        if (!validarNombre(nombre_generico, 'generico')) {
            return;
        }
        // VARIABLE CON MAYOR SCOPE para otras funciones
        medicamentoEncontrado = await buscarNombreGenerico(nombre_generico);

        //MEDICAMENTO ENCONTRADO:
        // mostrar datos true: medicamento existente mostrar su lista, undefined medicamento no encontrado...
        if (medicamentoEncontrado !== false && medicamentoEncontrado !== undefined) {
            //MOSTRAR CAMPOS DE MEDICAMENTO CON SUS DATOS y Ocultar <p>ingrese nombre generico...
            removeDisplayNone();
            nombre_comercial_input.value = medicamentoEncontrado.nombre_comercial;
            // Asignar el valor al input, comprobando si es null o una cadena vacía
            if (medicamentoEncontrado.nombre_comercial == null || medicamentoEncontrado.nombre_comercial === '') {
                // inputComercial.value = 'DATO DESCONOCIDO';
                nombre_comercial_input.value = 'DATO DESCONOCIDO';
            } else {
                // Establece el valor del input con el nombre comercial y deshabilítalo
                nombre_comercial_input.value = medicamentoEncontrado.nombre_comercial;
            }
            familia_input.value = medicamentoEncontrado.familia.descripcion;
            categoria_input.value = medicamentoEncontrado.categoria.descripcion;

            selectEstadoMedicamento.innerHTML = '';
            // Seleccionar la opción adecuada
            if (medicamentoEncontrado.estado === 1) {
                selectEstadoMedicamento.value='DISPONIBLE';
            } else {
                selectEstadoMedicamento.value='NO DISPONIBLE';
            }
            

            itemsMedicamento = obtenerYMostrarItems(medicamentoEncontrado);

        } else {
            mostrarMsjCliente('Medicamento incorrecto', ['El Nombre Generico ingresado no existe en medicamentos.']);
        }

    });

    //REINICIAR BUSQUEDA SI MODIFICAN NOMBRE GENERICO
    nombre_generico_input.addEventListener('input', reiniciarBusqueda);


});




