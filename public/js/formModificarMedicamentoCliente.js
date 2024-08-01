import { mostrarMsjCliente } from './mostrarMsjCliente.js';

document.addEventListener('DOMContentLoaded', async () => {


    const pMedicamentoBusqueda = document.querySelector('.pMedicamentoBusqueda');
    const h4Medicamento = document.querySelector('.h4Medicamento');
    const h4MedicamentoItem = document.querySelector('.h4MedicamentoItem');

    const nombre_generico_input = document.getElementById('nombreGenerico');
    const nombre_generico_lista = document.querySelector('.medicamentos-list');

    const divDatosMedicamento = document.querySelector('.divDatosMedicamento ');
    const divDatosMedicamentoItem = document.querySelector('.divDatosMedicamentoItem');
    const nombre_comercial_input = document.getElementById('nombreComercial');
    const familia_input = document.getElementById('familia');
    const familia_lista = document.querySelector('.familia-list');
    const categoria_input = document.getElementById('categoria');
    const categoria_lista = document.querySelector('.categoria-list');
    const selectEstadoMedicamento = document.querySelector('.selectEstadoModificarMedicamento');


    // Formas, presentaciones y concentraciones en el form agregar medicamento
    const medicamento_item_input = document.querySelector('.selectMedicamentoItem');
    const btnBuscarItem = document.querySelector('.btnBuscarItem');
    const forma_farmaceutica_input = document.querySelector('#formaFarmaceutica');
    const forma_farmaceutica_lista = document.querySelector('.formaFarmaceutica-list');
    const presentacion_input = document.querySelector('#presentacion');
    const presentacion_lista = document.querySelector('.presentacion-list');
    const concentracion_input = document.querySelector('#concentracion');
    const concentracion_lista = document.querySelector('.concentracion-list');
    const selectEstadoItem = document.querySelector('.selectEstadoModificarMedicamentoItem');


    // LUPA : nombre_generico
    const btnBuscar = document.querySelector('.btnBuscar');
    const btnModificarMedicamento = document.querySelector('.btnModificarMedicamento');
    const btnModificarMedicamentoItem = document.querySelector('.btnModificarMedicamentoItem');
    const divMedicamentosExistentes = document.querySelector('.divMedicamentosExistentes');
    //mostrar items/card de medicamento encontrado
    const divContenedorItems = document.querySelector('.divContenedorItems');

    //VARIABLES CON MAYOR SCOPE
    let msjs = [];
    let medicamentoEncontrado;
    let itemsMedicamento;
    let itemEncontrado;

    //VARIABLES CON MAYOR SCOPE PARA TRAER MEDICAMENTOS ,FORMAS ,PRESENTACIONES y CONCENTRACIONES Y VALIDAR POR EJ ELEMENTOS REPETIDOS O CUALES SON NUEVOS
    //TAMBIEN SE MUESTRAN EN UNA LISTA DEBAJO DEL INPUT CUANDO SE VAN A INGRESAR CON UN FILTRO POR LETRAS INGRESADAS
    let medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones;
    let medicamentosBase;
    let categoriasBase;
    let familiasBase;
    let concentracionesBase;
    let formasBase;
    let presentacionesBase;


    //TRAER TOD@S MEDICAMENTOS,FORMAS,PRESENTACIONES,CONCENTRACIONES de la base de datos: *************************************************************************************************************
    //-->>luego de buscar un nombre generico: (se muestran al darle click en el input correspondiente y se filtra el listado por letras ingresadas) 
    async function fetchMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones() {
        try {
            const response = await fetch('/medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones');
            const data = await response.json();

            if (response.ok) {
                return data;
            } else {
                console.error('Error al obtener medicamentos, categorias, familias , formas, presentaciones y concentraciones:', formas.message);
                return null;
            }
        } catch (error) {
            console.error('Error al llamar a medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones:', error);
            return null;
        }
    }

    // Obtener datos de la base de datos
    medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones = await fetchMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones();

    //DESTRUCTURING PARA ORDENARLOS Y PODER UTILIZARLOS
    medicamentosBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.medicamentos;
    categoriasBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.categorias;
    familiasBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.familias;
    concentracionesBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.concentraciones;
    presentacionesBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.presentaciones;
    formasBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.formas;

    //EJECUTAR EL FETCH ANTERIOR Y CARGAR LAS LISTAS CON LOS EVENTOS PARA FILTRAR RESULTADOS Y OCULTAR LISTAS 
    async function cargarListasInputConFiltro() {

        function mostrarLista(array, listaUl) {
            listaUl.innerHTML = '';
            array.forEach(elem => {
                const li = document.createElement('li');
                li.classList.add('listaFiltradaItem');
                if (elem.nombre_generico) {
                    li.textContent = elem.nombre_generico;
                } else {
                    li.textContent = elem.descripcion;
                }
                li.dataset.id = elem.id;
                listaUl.appendChild(li);
            });
            listaUl.classList.remove('displayNone');
            listaUl.classList.add('listaFiltrada');

        }

        function ocultarListas() {
            datosMedicamentosFamiliasCategoriasFormasConcentracionesPresentaciones.forEach(({ lista }) => {
                lista.innerHTML = '';
                lista.classList.add('displayNone');
                // lista.classList.remove('listaFiltrada');
            });
        }

        const { medicamentos: medicamentosBase, categorias: categoriasBase, familias: familiasBase, concentraciones: concentracionesBase, presentaciones: presentacionesBase, formas: formasBase } = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones;

        // Agrupar datos con inputs y listas para reutilizar el mismo código en mostrar y filtrar listas
        const datosMedicamentosFamiliasCategoriasFormasConcentracionesPresentaciones = [
            { input: nombre_generico_input, lista: nombre_generico_lista, array: medicamentosBase, key: 'nombre_generico' },
            { input: familia_input, lista: familia_lista, array: familiasBase, key: 'descripcion' },
            { input: categoria_input, lista: categoria_lista, array: categoriasBase, key: 'descripcion' },
            { input: forma_farmaceutica_input, lista: forma_farmaceutica_lista, array: formasBase, key: 'descripcion' },
            { input: presentacion_input, lista: presentacion_lista, array: presentacionesBase, key: 'descripcion' },
            { input: concentracion_input, lista: concentracion_lista, array: concentracionesBase, key: 'descripcion' }];

        // Mostrar y filtrar listas en el formulario de medicamentos
        datosMedicamentosFamiliasCategoriasFormasConcentracionesPresentaciones.forEach(({ input, lista, array, key }) => {
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
            datosMedicamentosFamiliasCategoriasFormasConcentracionesPresentaciones.forEach(({ input, lista }) => {
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

    //EJECUTAR CARGAR LISTAS(nombre generico, categoria, familia, forma, presen, concen)
    cargarListasInputConFiltro();

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
                    mostrarMsjCliente('Medicamento nuevo', [result.mensaje]);
                    return false;
                } else {
                    mostrarMsjCliente('Medicamento encontrado', ['Puede modificar el medicamento como también sus items.', 'Las modificaciones de Medicamento se aplican en todos sus Items.', 'La modificación de un Item no aplica a Medicamento o los demás Items.']);
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

    //REINICIAR BUSQUEDA
    // luego de buscar nombre generico si modifican el input se reinicia todo el form
    // vaciar variables con mayor scope y divs con contenido
    function reiniciarBusqueda() {
        divContenedorItems.innerHTML = '';
        medicamentoEncontrado = '';
        itemsMedicamento = '';
        nombre_comercial_input.value = '';
        familia_input.value = '';
        categoria_input.value = '';
        medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones = '';
        medicamentosBase = '';
        categoriasBase = '';
        familiasBase = '';
        concentracionesBase = '';
        formasBase = '';
        presentacionesBase = '';
        addDisplayNone();
    };

    function addDisplayNone() {
        h4Medicamento.classList.add('displayNone');
        h4MedicamentoItem.classList.add('displayNone');
        //ocultar p el nombre ya fue ingresado
        pMedicamentoBusqueda.classList.remove('displayNone');
        divDatosMedicamento.classList.add('displayNone');
        divMedicamentosExistentes.classList.add('displayNone');
        divDatosMedicamentoItem.classList.add('displayNone');
        btnModificarMedicamento.classList.add('displayNone');
        btnModificarMedicamentoItem.classList.add('displayNone');
    };

    function removeDisplayNone() {
        h4Medicamento.classList.remove('displayNone');
        h4MedicamentoItem.classList.remove('displayNone');
        pMedicamentoBusqueda.classList.add('displayNone');
        divDatosMedicamento.classList.remove('displayNone');
        //mostrar el p que solicita el nombre generico
        divMedicamentosExistentes.classList.remove('displayNone');
        divDatosMedicamentoItem.classList.remove('displayNone');
        btnModificarMedicamento.classList.remove('displayNone');
        btnModificarMedicamentoItem.classList.remove('displayNone');
    };
    //Si es modificado nombre generico se reinica toda la busqueda anulado para permitir modificar nombre generico
    //nombre_generico_input.addEventListener('input', reiniciarBusquedaToggleDisplay);
    function reiniciarBusquedaToggleDisplay() {
        addDisplayNone();
        reiniciarBusqueda();
    }

    //DOS FUNCIONES EN UNA
    // OBTENER ITEMS EXISTENTES DEL MEDICAMENTO ENCONTRADO PARA MOSTRAR SU LISTA Y PARA VALIDAR QUE NO SE ENVIE ITEM REPETIDO(De todas formas la base lo rechazaria pero lo controlamos en el front)
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


    //B O T O N    B U S C A R : N O M B R E   G E N E R I C O *************************************************************************************************************************************

    // BUSCAR el nombre generico y mostrar el form en blanco o el form y los items existentes...
    btnBuscar.addEventListener('click', async () => {


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

            if (medicamentoEncontrado.estado === 1) {
                selectEstadoMedicamento.value = 1; // Selecciona la opción con value='1'
            } else {
                selectEstadoMedicamento.value = 0; // O cualquier otro valor por defecto o que corresponda
            }

            // // VARIABLE CON MAYOR SCOPE para otras funciones : consultar los items existentes 
            //ITEM: RENDERIZARLOS Y GUARDARLOS en la variable para VALIDAR mas adelante que NO ingresen un item REPETIDO
            itemsMedicamento = obtenerYMostrarItems(medicamentoEncontrado);

        } else {
            mostrarMsjCliente('Medicamento incorrecto', 'El Nombre Generico ingresado no existe en medicamentos.');
        }

    });

    //anular reiniciar busqueda para poder modificar tambien nombre generico
    // nombre_generico_input.addEventListener('input', reiniciarBusqueda);



    // M O D I F I C A R   M E D I C A M E N T O  *******************************************************************************************************************************************************


    //VALIDAR NOMBRES : comparten la misma expresion regular
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

    //VALIDAR CATEGORIA O FAMILIA : comparten la misma expresion regular
    function validarFamiliaOcategoria(valor, tipo) {
        const regex = /^[a-zA-Z\s]{6,99}$/;
        let mensaje = [];
        // Determinar el mensaje de error basado en el tipo
        switch (tipo) {
            case 'tipoFamilia':
                mensaje.push('Familia debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.');
                break;
            case 'tipoCategoria':
                mensaje.push('Categoría debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.');
                break;
            default:
                console.error('Tipo de campo no válido.');
                return false;
        }

        // Verificar si el valor cumple con la expresión regular
        if (!regex.test(valor)) {
            mostrarMsjCliente('Dato incorrecto', mensaje);
            return false;
        }

        return true;
    }

    //Validar Nombre Generico esta modificado o no, si existe en la base o es nuevo : CREAR OBJETO PARA CONTROLADOR
    function procesarNombreGenerico(nombreGenerico, medicamentoEncontrado, medicamentosBase) {
        // SI MODIFICARON NOMBRE GENERICO
        if (nombreGenerico !== medicamentoEncontrado.nombre_generico) {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarNombre(nombreGenerico, 'generico')) {
                return null;
            } else {
                // EXPRESION OK: VALIDAR SI EXISTE EN LA BASE O ES PARA AGREGAR
                let existe = medicamentosBase.some(element => element.nombre_generico === nombreGenerico);

                if (existe) {
                    mostrarMsjCliente('Dato incorrecto', ['El nombre generico ingresado ya existe, no se permite agregar datos repetidos.']);
                    return null;
                } else {
                    // SI NO ESTA REPETIDO: CREAR UN OBJETO CON LA DESCRIPCION Y MODIFICAR TRUE
                    return {
                        descripcion: nombreGenerico,
                        modificar: true
                    };
                }
            }
        } else {
            // SI NO ES DISTINTO AL ENCONTRADO ORIGINAL: CREAR UN OBJETO CON LA DESCRIPCION Y MODIFICAR FALSE
            return {
                descripcion: nombreGenerico,
                modificar: false
            };
        }
    }

    //Validar Nombre Comercial esta modificado o no, si existe en la base o es nuevo : CREAR OBJETO PARA CONTROLADOR
    function procesarNombreComercial(nombreComercial, medicamentoEncontrado) {
        // SI MODIFICARON NOMBRE COMERCIAL (dato desconocido se renderiza cuando el dato llega vacio de la base)
        if (nombreComercial !== medicamentoEncontrado.nombre_comercial && nombreComercial !== 'DATO DESCONOCIDO') {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarNombre(nombreComercial, 'comercial')) {
                return null;
            } else {
                // CREAR UN OBJETO CON LA DESCRIPCION Y MODIFICAR TRUE
                return {
                    descripcion: nombreComercial,
                    modificar: true
                };
            }
        } else {
            // CREAR UN OBJETO CON LA DESCRIPCION Y MODIFICAR FALSE
            return {
                descripcion: nombreComercial,
                modificar: false
            };
        }
    }

    //Validar si familia esta modificada o no, si existe en la base o es nueva : CREAR OBJETO PARA CONTROLADOR
    function procesarFamilia(familia, medicamentoEncontrado, familiasBase) {
        // SI MODIFICAN FAMILIA
        if (familia !== medicamentoEncontrado.familia.descripcion) {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarFamiliaOcategoria(familia, 'tipoFamilia')) {
                return null;
            } else {
                // EXPRESION OK: VALIDAR SI EXISTE EN LA BASE O ES PARA AGREGAR
                let familiaObj = familiasBase.find(element => element.descripcion === familia);

                if (familiaObj) {
                    // Reemplazar la descripcion del input por el objeto que coincide en descripcion para utilizar el id  
                    return {
                        descripcion: familiaObj.descripcion,
                        id: familiaObj.id,
                        asignarExistente: true,
                        crearYasignar: false
                    };
                } else {
                    // Si no coincide con las demas , crear una nueva y asignarla
                    return {
                        descripcion: familia,
                        id: '',
                        asignarExistente: false,
                        crearYasignar: true
                    };
                }
            }
        } else {
            // No hay modificaciones en familia
            return {
                descripcion: medicamentoEncontrado.familia.descripcion,
                id: medicamentoEncontrado.familia_id,
                asignarExistente: false,
                modificar: false
            };
        }
    }

    //Validar si categoria esta modificada o no, si existe en la base o es nueva : CREAR OBJETO PARA CONTROLADOR
    function procesarCategoria(categoria, medicamentoEncontrado, categoriasBase) {
        // SI MODIFICAN CATEGORIA
        if (categoria !== medicamentoEncontrado.categoria.descripcion) {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarFamiliaOcategoria(categoria, 'tipoCategoria')) {
                return null;
            } else {
                // EXPRESION OK: VALIDAR SI EXISTE EN LA BASE O ES PARA AGREGAR
                let categoriaObj = categoriasBase.find(element => element.descripcion === categoria);

                if (categoriaObj) {
                    // Reemplazar la descripcion del input por el objeto que coincide en descripcion para utilizar el id  
                    return {
                        descripcion: categoriaObj.descripcion,
                        id: categoriaObj.id,
                        asignarExistente: true,
                        crearYasignar: false
                    };
                } else {
                    // Si no coincide con las demas , crear una nueva y asignarla
                    return {
                        descripcion: categoria,
                        id: '',
                        asignarExistente: false,
                        crearYasignar: true
                    };
                }
            }
        } else {
            // No hay modificaciones en categoria
            return {
                descripcion: medicamentoEncontrado.categoria.descripcion,
                id: medicamentoEncontrado.categoria.id,
                asignarExistente: false,
                modificar: false
            };
        }
    }

    function procesarEstado(estado, item) {
        if (estado !== item.estado) {
            estado = {
                modificar: true,
                estado: estado
            }
        } else {
            estado = {
                modificar: false,
                estado: estado
            }
        }
        return estado;
    }

    async function fetchModificarMedicamento(medicamentoEncontrado, estado, nombreGenerico, nombreComercial, familia, categoria) {
        // ENVIAR DATOS
        const data = {
            medicamentoEncontrado,
            estado,
            nombreGenerico,
            nombreComercial,
            familia,
            categoria
        };

        try {
            const response = await fetch('/modificarMedicamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en la solicitud: ${response.statusText}`);
            }

            const result = await response.json();
            mostrarMsjCliente('Medicamento modificado', ['Medicamento modificado con exito, items actualizados con los nuevos datos de Medicamento.']);

        } catch (error) {
            // console.error('Error:', error);
            mostrarMsjCliente('Error al modificar Medicamento item', [error.message]);
        }

    }


    //B O T O N   M O D I F I C A R   M E D I C A M E N T O **********************************************************************************************************************************************
    btnModificarMedicamento.addEventListener('click', async () => {

        // LOS STRING CAPTURADOS LUEGO PASAN A .DESCRIPCION EN UN OBJETO CON LA MISMA VARIABLE
        let nombreGenerico = nombre_generico_input.value.trim().toUpperCase();
        let nombreComercial = nombre_comercial_input.value.trim().toUpperCase();
        let familia = familia_input.value.trim().toUpperCase();
        let categoria = categoria_input.value.trim().toUpperCase();
        let estado = selectEstadoMedicamento.value;
        estado = parseInt(estado, 10);


        //SI NO HAY NINGUN CAMBIO SE MUESTRA MSJ DE ERROR Y SE EVITA EL FETCH
        // Verificar si todos los campos coinciden
        if (
            nombreGenerico === medicamentoEncontrado.nombre_generico &&
            familia === medicamentoEncontrado.familia.descripcion &&
            categoria === medicamentoEncontrado.categoria.descripcion &&
            estado === medicamentoEncontrado.estado && nombreComercial === 'DATO DESCONOCIDO' && medicamentoEncontrado.nombre_comercial === '' ||
            nombreComercial === medicamentoEncontrado.nombre_comercial
        ) {
            mostrarMsjCliente('Datos incorrectos', ['No se encontraron modificaciones en el Medicamento, primero debe hacer las modificaciones.']);
            return;
        }

        nombreGenerico = procesarNombreGenerico(nombreGenerico, medicamentoEncontrado, medicamentosBase);
        nombreComercial = procesarNombreComercial(nombreComercial, medicamentoEncontrado);
        familia = procesarFamilia(familia, medicamentoEncontrado, familiasBase);
        categoria = procesarCategoria(categoria, medicamentoEncontrado, categoriasBase);
        estado = procesarEstado(estado, medicamentoEncontrado);


        //FETCH AL CONTROLADOR CON LOS DATOS: AL FINALIZAR MUESTRA MSJ DE EXITO O MSJ DE ERROR
        await fetchModificarMedicamento(medicamentoEncontrado, estado, nombreGenerico, nombreComercial, familia, categoria);
    });




    // B O T O N    B U S C A R  I T E M   E S P E C I F I C O (F O R M    M O D I F I C A R  I T E M)------------------------------------------------------------------
    // Función para validar el ID ingresado
    function validarIdIngresado(id) {
        if (id === '') {
            mostrarMsjCliente('Dato vacío', ['Por favor ingrese el ID del Item que desea modificar.']);
            return false;
        }

        const idEntero = parseInt(id, 10);
        if (isNaN(idEntero)) {
            mostrarMsjCliente('Item ID incorrecto', ['Ingrese el ID del medicamento-item que desea modificar. En la lista de items, cada uno tiene su ID en el título.']);
            return false;
        }

        return idEntero;
    }


    // Función para buscar el item en la lista
    function buscarItemPorId(id, items) {
        for (const item of items) {
            if (id === item.item_id) {
                return item;
            }
        }

        mostrarMsjCliente('Item ID incorrecto', ['El Item ID no se encontró en el listado de Items del Medicamento actual', 'Verifique el ID en el listado de Items.']);
        return null;
    }


    // Función para mostrar los datos del item encontrado
    function mostrarDatosItem(item) {
        forma_farmaceutica_input.value = item.descripcion_forma;
        forma_farmaceutica_input.disabled = false;
        presentacion_input.value = item.descripcion_presentacion;
        presentacion_input.disabled = false;
        concentracion_input.value = item.descripcion_concentracion;
        concentracion_input.disabled = false;
        selectEstadoItem.value = item.estado;
        selectEstadoItem.disabled = false;
    }

    // LUEGO DE BUSCAR ITEM ID: SI ES MODIFICADO SE REINICIA LA BUSQUEDA PARA EVITAR ERRORES
    function reiniciarBusquedaItem() {
        forma_farmaceutica_input.value = '';
        forma_farmaceutica_input.disabled = true;
        presentacion_input.value = '';
        presentacion_input.disabled = true;
        concentracion_input.value = '';
        concentracion_input.disabled = true;
        selectEstadoItem.value = '';
        selectEstadoItem.disabled = true;
        itemEncontrado = '';
    }


    // E V E N T O    B U S C A R    I T E M-------------------------------------------------------------------------------------------------------------------------------------
    btnBuscarItem.addEventListener('click', async () => {

        //Capturar num ingresado , si es correcto parsearlo como entero para compararlo con los ids de items
        let idIngresado = medicamento_item_input.value.trim();
        idIngresado = validarIdIngresado(idIngresado);
        if (!idIngresado) {
            return;
        }
        //BUSCAR ITEM POR EL ID INGRESADO itemEncontrado declarado al pincipio de la hoja con mayor scope para otras funciones
        itemEncontrado = buscarItemPorId(idIngresado, itemsMedicamento);
        //MOSTRAR DATOS DEL ITEM ENCONTRADO
        if (itemEncontrado) {
            mostrarDatosItem(itemEncontrado);
        } else {
            return;
        }
    });


    //SI MODIFICAN ID ITEM LUEGO DE BUSCARLO : REINICIAR BUSQUEDA PARA EVITAR ERRORES
    medicamento_item_input.addEventListener('input', () => {
        reiniciarBusquedaItem();
        return;
    });





    //M O D I F I C A R    I T E M    M E D I C A M E N T O--------------------------------------------------------------------------------------------------------------------------------
    // VALIDAR FORMA,PRESENTACION Y CONCENTRACION PARA APLICARLES EXPRESIONES REGULARES LAS MISMAS SE APLICAN TAMBIEN EN EL SERVIDOR
    function validarForma(formaIngresada) {
        const regex = /^[A-Za-z][A-Za-z0-9 ]{4,99}$/;
        let msjs = [];

        if (!regex.test(formaIngresada)) {
            msjs.push('Forma farmaceutica debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras, espacios y números.');
        }

        if (msjs.length > 0) {
            mostrarMsjCliente('Datos incorrectos', msjs);
            return false;
        }
        return true;
    }

    function validarPresentacion(presentacionIngresada) {
        const regex2 = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;
        let msjs = [];

        if (!regex2.test(presentacionIngresada)) {
            msjs.push('Presentacion debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 15 UNIDADES)');
        }

        if (msjs.length > 0) {
            mostrarMsjCliente('Datos incorrectos', msjs);
            return false;
        }
        return true;
    }

    function validarConcentracion(concentracionIngresada) {
        const regex2 = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;
        let msjs = [];

        if (!regex2.test(concentracionIngresada)) {
            msjs.push('Concentracion debe comenzar con número/s, min 6 max 99 caracteres. Puede ingresar números, espacios y letras. (Ej: 200 MG)');
        }

        if (msjs.length > 0) {
            mostrarMsjCliente('Datos incorrectos', msjs);
            return false;
        }
        return true;
    }



    //Validar FormaFarmaceutica esta modificada o no, si existe en la base o es nueva : CREAR OBJETO PARA CONTROLADOR
    function procesarFormaFarmaceutica(formaFarmaceutica, itemEncontrado, itemsMedicamento) {
        // SI MODIFICARON FormaFarmaceutica
        if (formaFarmaceutica !== itemEncontrado.descripcion_forma) {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarForma(formaFarmaceutica)) {
                return null;
            } else {
                // EXPRESION OK: VALIDAR SI EXISTE EN LA BASE O ES PARA AGREGAR
                let existe = itemsMedicamento.some(element => element.descripcion_forma === formaFarmaceutica);

                if (existe) {
                    return {
                        id: existe.formafarmaceutica_id,
                        descripcion: '',
                        asignarExistente: true,
                        crearYasignar: false
                    }
                } else {
                    // SI NO ESTA REPETIDO: CREAR UN OBJETO CON LA DESCRIPCION Y crearYasignar: true

                    return {
                        id: '',
                        descripcion: formaFarmaceutica,
                        asignarExistente: false,
                        crearYasignar: true
                    };
                }
            }
        } else {
            // SI NO ES DISTINTO AL ENCONTRADO ORIGINAL: false, false
            return {
                id: itemEncontrado.formafarmaceutica_id,
                descripcion: '',
                asignarExistente: false,
                crearYasignar: false
            };
        }
    }

    //Validar Presentacion esta modificada o no, si existe en la base o es nueva : CREAR OBJETO PARA CONTROLADOR
    function procesarPresentacion(presentacion, itemEncontrado, itemsMedicamento) {
        // SI MODIFICARON presentacion
        if (presentacion !== itemEncontrado.descripcion_presentacion) {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarPresentacion(presentacion)) {
                return null;
            } else {
                // EXPRESION OK: VALIDAR SI EXISTE EN LA BASE O ES PARA AGREGAR
                let existe = itemsMedicamento.some(element => element.descripcion_presentacion === presentacion);

                if (existe) {
                    return {
                        id: existe.presentacion_id,
                        descripcion: '',
                        asignarExistente: true,
                        crearYasignar: false
                    }
                } else {
                    // SI NO ESTA REPETIDO: CREAR UN OBJETO CON LA DESCRIPCION Y crearYasignar: true
                    return {
                        id: '',
                        descripcion: presentacion,
                        asignarExistente: false,
                        crearYasignar: true
                    };
                }
            }
        } else {
            // SI NO ES DISTINTO AL ENCONTRADO ORIGINAL: false, false
            return {
                id: itemEncontrado.presentacion_id,
                descripcion: '',
                asignarExistente: false,
                crearYasignar: false
            };
        }
    }

    //Validar Concentracion esta modificada o no, si existe en la base o es nueva : CREAR OBJETO PARA CONTROLADOR
    function procesarConcentracion(concentracion, itemEncontrado, itemsMedicamento) {
        // SI MODIFICARON concentracion
        if (concentracion !== itemEncontrado.descripcion_concentracion) {
            // VALIDAR CON EXPRESION REGULAR MOSTRAR MSJS ERROR
            if (!validarConcentracion(concentracion)) {
                return null;
            } else {
                // EXPRESION OK: VALIDAR SI EXISTE EN LA BASE O ES PARA AGREGAR
                let existe = itemsMedicamento.some(element => element.descripcion_concentracion === concentracion);

                if (existe) {
                    return {
                        id: existe.concentracion_id,
                        descripcion: '',
                        asignarExistente: true,
                        crearYasignar: false
                    };
                } else {
                    // SI NO ESTA REPETIDO: CREAR UN OBJETO CON LA DESCRIPCION Y crearYasignar: true
                    return {
                        id: '',
                        descripcion: concentracion,
                        asignarExistente: false,
                        crearYasignar: true
                    };
                }
            }
        } else {
            // SI NO ES DISTINTO AL ENCONTRADO ORIGINAL: false, false
            return {
                id: itemEncontrado.concentracion_id,
                descripcion: '',
                asignarExistente: false,
                crearYasignar: false
            };
        }
    }






    //B O T O N   M O D I F I C A R    I T E M    M E D I C A M E N T O
    // btnModificarMedicamentoItem.addEventListener('click', async () => {

    async function fetchModificarMedicamentoItem(medicamento_id, item_id, formaIngresada, presentacionIngresada, concentracionIngresada, estadoIngresado) {
        // ENVIAR DATOS
        const data = {
            medicamento_id,
            item_id,
            formaIngresada,
            presentacionIngresada,
            concentracionIngresada,
            estadoIngresado
        };
        console.log(data);
        try {
            const response = await fetch('/modificarMedicamentoItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en la solicitud: ${response.statusText}`);
            }

            const result = await response.json();
            mostrarMsjCliente('Medicamento Item modificado', ['Medicamento Item modificado con exito.']);

        } catch (error) {
            // console.error('Error:', error);
            mostrarMsjCliente('Error al modificar Medicamento item', [error.message]);
        }

    }



    // B O T O N    M O D I F I C A R   M E D I C A M E N T O   I T E M (INDIVIDUAL)

    btnModificarMedicamentoItem.addEventListener('click', async () => {

        // Obtener valores ingresados y normalizarlos
        let formaIngresada = forma_farmaceutica_input.value.trim().toUpperCase();
        let presentacionIngresada = presentacion_input.value.trim().toUpperCase();
        let concentracionIngresada = concentracion_input.value.trim().toUpperCase();
        let estadoIngresado = selectEstadoItem.value;

        // Verificar si el ID del medicamento está vacío
        if (medicamento_item_input.value.trim() === '') {
            mostrarMsjCliente('Datos vacíos', ['Primero debe ingresar el ID ITEM y buscarlo con la LUPA.']);
            return;
        }
        if (formaIngresada.value === '' || presentacionIngresada.value === '' || concentracionIngresada.value === '' || estadoIngresado == -1) {
            mostrarMsjCliente('Datos vacíos', ['Todos los datos son obligatorios en Medicamento Item.']);
            return;
        }

        // Verificar si no hay ninguna modificación
        const noModificaciones = (
            formaIngresada === itemEncontrado.descripcion_forma &&
            presentacionIngresada === itemEncontrado.descripcion_presentacion &&
            concentracionIngresada === itemEncontrado.descripcion_concentracion
            && estadoIngresado == itemEncontrado.estado
        );

        if (noModificaciones) {
            mostrarMsjCliente('Datos incorrectos', ['No se encontraron modificaciones en el Item, primero debe hacer las modificaciones.']);
            return;
        }

        // Validar los datos ingresados
        const datosValidos = (
            validarForma(formaIngresada) &&
            validarPresentacion(presentacionIngresada) &&
            validarConcentracion(concentracionIngresada)
        );

        if (!datosValidos) {
            return;
        }

        // Procesar los datos ingresados
        formaIngresada = procesarFormaFarmaceutica(formaIngresada, itemEncontrado, itemsMedicamento);
        presentacionIngresada = procesarPresentacion(presentacionIngresada, itemEncontrado, itemsMedicamento);
        concentracionIngresada = procesarConcentracion(concentracionIngresada, itemEncontrado, itemsMedicamento);

        // Procesar el estado ingresado
        estadoIngresado = parseInt(estadoIngresado, 10);
        estadoIngresado = {
            modificar: estadoIngresado !== itemEncontrado.estado,
            valor: estadoIngresado
        };

        console.log(formaIngresada);
        console.log(presentacionIngresada);
        console.log(concentracionIngresada);
        console.log(estadoIngresado);

        //FETCH MODIFICAR MEDICAMENTO ITEM, MUESTRA MSJ AL USUARIO AL FINALIZAR
        fetchModificarMedicamentoItem(medicamentoEncontrado.id, itemEncontrado.item_id, formaIngresada, presentacionIngresada, concentracionIngresada, estadoIngresado);


    });


});
