import { mostrarMsjCliente } from './mostrarMsjCliente.js';

document.addEventListener('DOMContentLoaded', async () => {

    const nombre_generico_input = document.getElementById('nombreGenerico');
    const nombre_generico_lista = document.querySelector('.medicamentos-list');

    const divDatosMedicamento = document.querySelector('.divDatosMedicamento ');
    const nombre_comercial_input = document.getElementById('nombreComercial');
    const familia_input = document.getElementById('familia');
    const familia_lista = document.querySelector('.familia-list');
    const categoria_input = document.getElementById('categoria');
    const categoria_lista = document.querySelector('.categoria-list');


    // Formas, presentaciones y concentraciones en el form agregar medicamento
    const forma_farmaceutica_input = document.querySelector('#formaFarmaceutica');
    const forma_farmaceutica_lista = document.querySelector('.formaFarmaceutica-list');
    const presentacion_input = document.querySelector('#presentacion');
    const presentacion_lista = document.querySelector('.presentacion-list');
    const concentracion_input = document.querySelector('#concentracion');
    const concentracion_lista = document.querySelector('.concentracion-list');

    // LUPA : nombre_generico
    const btnBuscar = document.querySelector('.btnBuscar');
    const btnAgregar = document.querySelector('.btnAgregarMedicamento');
    const divMedicamentosExistentes = document.querySelector('.divMedicamentosExistentes');
    //mostrar items/card de medicamento encontrado
    const divContenedorItems = document.querySelector('.divContenedorItems');

    //VARIABLES CON MAYOR SCOPE
    let msjs = [];
    let medicamentoEncontrado;
    let itemsMedicamento;

    //VARIABLES CON MAYOR SCOPE PARA TRAER MEDICAMENTOS ,FORMAS ,PRESENTACIONES y CONCENTRACIONES Y VALIDAR POR EJ ELEMENTOS REPETIDOS O CUALES SON NUEVOS
    //TAMBIEN SE MUESTRAN EN UNA LISTA DEBAJO DEL INPUT CUANDO SE VAN A INGRESAR CON UN FILTRO POR LETRAS INGRESADAS
    let medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones;
    let medicamentosBase;
    let categoriasBase;
    let familiasBase;
    let concentracionesBase;
    let formasBase;
    let presentacionesBase;

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
        divDatosMedicamento.classList.add('displayNone');
        divMedicamentosExistentes.classList.add('displayNone');
        divContenedorItems.classList.add('displayNone');
        btnAgregar.classList.add('displayNone');
    }




    //TRAER TOD@S MEDICAMENTOS,FORMAS,PRESENTACIONES,CONCENTRACIONES de la base de datos: *************************************************************************************************************

    //-->>luego de buscar un nombre generico: (se muestran al darle click en el input correspondiente y se filtra el listado por letras ingresadas) 
    async function fetchMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones() {
        try {
            const response = await fetch('/medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones'); // Ajusta la URL según tu API
            const data = await response.json();

            if (response.ok) {
                return data;
            } else {
                console.error('Error al obtener medicamentos, categorias, familias , formas, presentaciones y concentraciones:', formas.message);
                return null;
            }
        } catch (error) {
            console.error('Error al llamar a la API de formas disponibles:', error);
            return null;
        }
    }

    //OBTENER MEDICAMENTOS FORMAS PRESENTACIONES CONCENTRACIONES EN LA BASE DE DATOS
    medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones = await fetchMedicamentosCategoriasFamiliasFormasPresentacionesConcentraciones();

    //DESTRUCTURING PARA ORDENARLOS Y PODER UTILIZARLOS
    medicamentosBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.medicamentos;
    categoriasBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.categorias;
    familiasBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.familias;
    concentracionesBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.concentraciones;
    presentacionesBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.presentaciones;
    formasBase = medicamentosCategoriasFamiliasFormasPresentacionesConcentraciones.formas;

    // agrupar datos con inputs y uls para reutilizar el mismo codigo en mostrar y filtrar listas(medicamento,forma,presen,concen...)
    const datosMedicamentosFamiliasCategoriasFormasConcentracionesPresentaciones = [
        { input: nombre_generico_input, lista: nombre_generico_lista, array: medicamentosBase },
        { input: familia_input, lista: familia_lista, array: familiasBase },
        { input: categoria_input, lista: categoria_lista, array: categoriasBase },
        { input: forma_farmaceutica_input, lista: forma_farmaceutica_lista, array: formasBase },
        { input: presentacion_input, lista: presentacion_lista, array: presentacionesBase },
        { input: concentracion_input, lista: concentracion_lista, array: concentracionesBase }
    ];

    // MOSTRAR medicamentos, formas , presentaciones y concentraciones en el form medicamento
    //FILTRAR listado por letras ingresadas
    datosMedicamentosFamiliasCategoriasFormasConcentracionesPresentaciones.forEach(({ input, lista, array }) => {
        input.addEventListener('click', () => {
            mostrarLista(array, lista);
        });

        input.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();

            if (array[0].descripcion) {
                const filtrados = array.filter(item =>
                    item.descripcion.toLowerCase().includes(filtro)
                );
                mostrarLista(filtrados, lista);
            } else {
                //sino :es medicamento
                const filtrados = array.filter(item =>
                    item.nombre_generico.toLowerCase().includes(filtro)
                );
                mostrarLista(filtrados, lista);
            }


        });

        lista.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                input.value = e.target.textContent;
                ocultarListas();
            }
        });
    });

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
    // OCULTAR lista con click fuera o scroll
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

    //************************************************************************************************************************************************************************************************** */




    //BUSCAR SI EL NOMBRE GENERICO YA EXISTE : PARA RENDERIZAR FORM EL BLANCO O FORM EN BLANCO MAS ITEMS AGREGADOS PREVIAMENTE
    async function buscarNombreGenerico(nombre_generico) {

        //ENVIAR NOMBRE GENERICO AL SERVIDOR. Si existe ,regresa el medicamento con todos sus datos
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
                    mostrarMsjCliente('Medicamento encontrado', ['El medicamento ya existe, puede agregar combinaciones distintas a las existentes.']);
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


    //B O T O N    B U S C A R : N O M B R E   G E N E R I C O
    // BUSCAR el nombre generico y mostrar el form en blanco o el form y los items existentes...
    btnBuscar.addEventListener('click', async () => {

        // VALIDAR NOMBRE GENERICO INGRESADO ANTES DE HACER EL FETCH, SINO MOSTRAR MSJ DE ERROR...
        const nombre_generico = nombre_generico_input.value.trim().toUpperCase();
        const regex = /^[A-Za-z0-9 ]{6,100}$/;

        // Verificar si el nombre genérico cumple con la expresión regular
        // Inicializar msjs para almacenar los mensajes

        // Verificar si el nombre genérico cumple con la expresión regular
        if (!regex.test(nombre_generico)) {
            // Msj error para expresión regular
            msjs.push('Nombre genérico debe contener solo letras, números y espacios, min 6 y max 100 caracteres.');
            mostrarMsjCliente('Dato incorrecto', msjs);
            return;
        }

        // VARIABLE CON MAYOR SCOPE para otras funciones
        medicamentoEncontrado = await buscarNombreGenerico(nombre_generico);

        //MEDICAMENTO ENCONTRADO:
        // mostrar datos true: medicamento existente mostrar su lista, undefined medicamento(nuevo) no encontrado...
        if (medicamentoEncontrado !== false && medicamentoEncontrado != 'undefined') {
            //MOSTRAR CAMPOS DE MEDICAMENTO CON SUS DATOS
            divDatosMedicamento.classList.remove('displayNone');
            nombre_comercial_input.value = medicamentoEncontrado.nombre_comercial;
            // Asignar el valor al input, comprobando si es null o una cadena vacía
            if (medicamentoEncontrado.nombre_comercial == null || medicamentoEncontrado.nombre_comercial === '') {
                // inputComercial.value = 'DATO DESCONOCIDO';
                nombre_comercial_input.value = 'DATO DESCONOCIDO';
                nombre_comercial_input.disabled = true;
            } else {
                // Establece el valor del input con el nombre comercial y deshabilítalo
                nombre_comercial_input.value = medicamentoEncontrado.nombre_comercial;
                nombre_comercial_input.disabled = true;
            }
            familia_input.value = medicamentoEncontrado.familia.descripcion;
            familia_input.disabled = true;
            categoria_input.value = medicamentoEncontrado.categoria.descripcion;
            categoria_input.disabled = true;


            // // VARIABLE CON MAYOR SCOPE para otras funciones : consultar los items existentes 
            //ITEM: RENDERIZARLOS Y GUARDARLOS en la variable para VALIDAR mas adelante que NO ingresen un item REPETIDO
            itemsMedicamento = obtenerYMostrarItems(medicamentoEncontrado);

            // EVENTO EN NOMBRE GENERICO ,SI ES MODIFICADO LUEGO DE BUSCARLO SE REINICIA TODO EL FORM
            nombre_generico_input.addEventListener('input', reiniciarBusqueda);
        } else {
            //MEDICAMENTO NUEVO
            //REINICIAR DATOS SI ANTES SE HABIA ENCONTRADO OTRO MEDICAMENTO
            divMedicamentosExistentes.classList.add('displayNone');
            divContenedorItems.innerHTML = '';
            divContenedorItems.classList.add('displayNone');
            divDatosMedicamento.classList.add('displayNone');
            nombre_comercial_input.disabled = false;
            familia_input.disabled = false;
            categoria_input.disabled = false;
            divDatosMedicamento.classList.remove('displayNone');
            btnAgregar.classList.remove('displayNone');
        }

    });

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
                    return ['No se encontraron concentraciones'];
                }
            } catch (error) {
                mostrarMsjCliente('Error...', [error.message]);
            }
        }


        // MOSTRAR ITEMS DEL MEDICAMENTO ENCONTRADO 
        function mostrarItems(medicamentoEncontrado, items) {

            divMedicamentosExistentes.classList.remove('displayNone');
            // div que va contener cada card con los divDatosMedicamento
            divContenedorItems.innerHTML = '';
            divContenedorItems.classList.remove('displayNone');
            btnAgregar.classList.remove('displayNone');

            let estadoBool = true;
            if (medicamentoEncontrado.estado === 0) {
                estadoBool = false;
            }

            items.forEach(element => {

                const cardItem = document.createElement('div');
                cardItem.classList.add('cardItem')

                const h4 = document.createElement('h4');
                h4.classList.add('text-fondoAzul');
                h4.classList.add('borderRadiusTop5px');
                h4.innerHTML = `Medicamento ItemID ${element.item_id}`;
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


    // VALIDAR FAMILIA Y CATEGORIA PARA APLICARLES EXPRESIONES REGULARES LAS MISMAS SE APLICAN TAMBIEN EN EL SERVIDOR
    function validarFamiliaYcategoria(familiaIngresada, categoriaIngresada) {
        msjs = [];

        // Expresión regular
        const regex = /^[a-zA-Z\s]{6,99}$/;

        // Validar forma, presentacion y concentracion ingresada
        if (!regex.test(familiaIngresada)) {
            msjs.push('Familia debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.');
        }
        if (!regex.test(categoriaIngresada)) {
            msjs.push('Categoria debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras y espacios.');
        }

        if (msjs.length > 0) {
            mostrarMsjCliente('Datos incorrectos', msjs);
            return false;
        }
        return true;
    }

    // VALIDAR FORMA,PRESENTACION Y CONCENTRACION PARA APLICARLES EXPRESIONES REGULARES LAS MISMAS SE APLICAN TAMBIEN EN EL SERVIDOR
    // function validarFormaPresentacionConcentracion(formaIngresada, presentacionIngresada, concentracionIngresada) {
    //     msjs = [];

    //     // Expresión regular
    //     const regex = /^[A-Za-z][A-Za-z0-9 ]{4,99}$/;
    //     // const regex2 = /^[0-9]+ [A-Za-z][A-Za-z0-9 ]{1,97}$/;
    //     const regex2 = /^[0-9]+(\.[0-9]+)? [A-Za-z ]{1,94}$/;

    //     // Validar forma, presentacion y concentracion ingresada
    //     if (!regex.test(formaIngresada)) {
    //         msjs.push('Forma farmaceutica debe comenzar con letras, min 6 max 99 caracteres. Puede ingresar letras,espacios y numeros.');
    //     }
    //     if (!regex2.test(presentacionIngresada)) {
    //         msjs.push('Presentacion debe comenzar con numero/s, min 6 max 99 caracteres. Puede ingresar numeros, espacios y letras.(Ej: 15 UNIDADES)');
    //     }
    //     if (!regex2.test(concentracionIngresada)) {
    //         msjs.push('Concentracion debe comenzar con numero/s, min 6 max 99 caracteres. Puede ingresar numeros, espacios y letras.(Ej: 200 MG)');
    //     }
    //     if (msjs.length > 0) {
    //         mostrarMsjCliente('Datos incorrectos', msjs);
    //         return false;
    //     }
    //     return true;
    // }

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
    

    // VALIDAR QUE FORMA, PRESENTACION Y CONCENTRACION NO ESTEN CARGADAS CON LOS MISMOS DATOS ANTERIORMENTE
    function validarItemRepetido(itemsMedicamento, formaIngresada, presentacionIngresada, concentracionIngresada) {

        for (let e of itemsMedicamento) {
            if (e.descripcion_forma === formaIngresada && e.descripcion_presentacion === presentacionIngresada && e.descripcion_concentracion
                === concentracionIngresada) {
                return true;
            }
        }
        return false;
    };

    //VALIDAR SI LOS DATOS INGRESADOS EXISTEN O SON NUEVOS
    //CAPTURAR ID(forma,presen,concen) PARA ASIGNARLOS EN MEDICAMENTO ITEM 
    //SI ES UNA FORMA,PRESENTACION o CONCENTRACION NUEVA, SE AGREGA EN EL CONTROLADOR A LA BASE, SE CAPTURA SU ID 
    //( ASIGNAR ID AL MEDICAMENTO Y LUEGO ASIGNAR ID EN MEDICAMENTO ITEM )

    //VALIDAR SI INGRESAN CATEGORIA, FAMILIA, FORMA, PRES, CONC EXISTENTE = CAPTURAR su ID 
    function capturarId(elementoBuscado, arrayElementos) {
        let resultado = null;

        for (let e of arrayElementos) {
            if (elementoBuscado === e.descripcion) {
                resultado = e;
                break;  // Salir del bucle una vez encontrado el objeto
            }
        }
        return resultado;
    }

    //APLICAR CAPTURARID SINO GUARDAR DESCRIPCION INGRESADA PARA AGREGARLA EN LA BASE
    function procesarFormaPresentacionConcentracion(formaIngresada, presentacionIngresada, concentracionIngresada, formasBase, presentacionesBase, concentracionesBase) {
        //RECUPERAR ID , SI NO SE RECUPERA ID SE DEBE AGREGAR A LA BASE PRIMERO
        let asignarForma = capturarId(formaIngresada, formasBase);
        let asignarPresentacion = capturarId(presentacionIngresada, presentacionesBase);
        let asignarConcentracion = capturarId(concentracionIngresada, concentracionesBase);

        //Si es undefined no se encontro en las listas por lo tanto no hay id. Enviamos Descripcion para agregarla y capturar su id en el controlador.
        //Agregamos la descripcion de cada una antes de enviar las variables asignar.
        if (asignarForma == undefined) {
            asignarForma = formaIngresada;
        }
        if (asignarPresentacion == undefined) {
            asignarPresentacion = presentacionIngresada;
        }
        if (asignarConcentracion == undefined) {
            asignarConcentracion = concentracionIngresada;
        }

        return { asignarForma, asignarPresentacion, asignarConcentracion };
    }

    function procesarFamiliaYcategoria(familiaIngresada, categoriaIngresada, familiasBase, categoriasBase) {
        //RECUPERAR ID , SI NO SE RECUPERA ID SE DEBE AGREGAR A LA BASE PRIMERO
        let asignarFamilia = capturarId(familiaIngresada, familiasBase);
        let asignarCategoria = capturarId(categoriaIngresada, categoriasBase);

        //Si es undefined no se encontro en las listas por lo tanto no hay id. Enviamos Descripcion para agregarla y capturar su id en el controlador.
        //Agregamos la descripcion de cada una antes de enviar las variables asignar.
        if (asignarFamilia == undefined) {
            asignarFamilia = familiaIngresada;
        }
        if (asignarCategoria == undefined) {
            asignarCategoria = categoriaIngresada;
        }

        return { asignarFamilia, asignarCategoria };
    }

    // AGREGAR ITEM A MEDICAMENTO EXISTENTE: cuando se encuentra el nombre_generico
    async function agregarItemMedicamento(medicamentoEncontrado, asignarForma, asignarPresentacion, asignarConcentracion) {
        // ENVIAR DATOS
        const data = {
            medicamentoEncontrado,
            asignarForma,
            asignarPresentacion,
            asignarConcentracion
        };

        try {
            const response = await fetch('/agregarItemMedicamento', {
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
            mostrarMsjCliente('Item agregado', ['Nuevo item agregado al medicamento con éxito.']);

        } catch (error) {
            // console.error('Error:', error);
            mostrarMsjCliente('Error al agregar Medicamento item', [error.message]);
        }
    }

    async function agregarMedicamentoNuevoEitem(nombreGenerico, nombreComercial, asignarFamilia, asignarCategoria, asignarForma, asignarPresentacion, asignarConcentracion) {
        // ENVIAR DATOS
        const data = {
            nombreGenerico,
            nombreComercial,
            asignarFamilia,
            asignarCategoria,
            asignarForma,
            asignarPresentacion,
            asignarConcentracion
        };

        try {
            const response = await fetch('/agregarMedicamentoNuevoEitem', {
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
            mostrarMsjCliente('Medicamento nuevo agregado', ['El medicamento fue agregado con exito, puedes agregar mas items del mismo medicamento.']);

        } catch (error) {
            // console.error('Error:', error);
            mostrarMsjCliente('Error al agregar Medicamento item', [error.message]);
        }

    }

    //B O T O N   A G R E G A R  M E D I C A M E N T O ---- >> MEDICAMENTO NUEVO COMPLETO /  MEDICAMENTO ENCONTRADO
    btnAgregar.addEventListener('click', async () => {

        // M E D I C A M E N T O  N U E V O  C O M P L E T O : Agregar medicamento, asignar O crear y asignar:familia,categoria, forma, presentacion, concentracion. crear item dek medicamento.
        if (medicamentoEncontrado === false) {
            msjs = [];
            let nombreGenerico = nombre_generico_input.value.trim().toUpperCase();

            const regex = /^[A-Za-z0-9 ]{6,100}$/;
            if (!regex.test(nombreGenerico)) {
                msjs.push('Nombre genérico debe contener solo letras, números y espacios, min 6 y max 100 caracteres.');
            }


            // Dato opcional puede estar vacio
            const regex2 = /^[a-zA-Z\s]{6,99}$/;
            let nombreComercial = nombre_comercial_input.value;
            if (nombreComercial !== '') {
                nombreComercial = nombreComercial.trim().toUpperCase();
                if (!regex2.test(nombreComercial)) {
                    msjs.push('Nombre comercial debe contener solo letras y espacios, min 6 y max 99 caracteres.');
                }
            }

            //MOSTRAR MSJS DE ERROR POR NOMBRE GENERICO Y/O NOMBRE COMERICAL
            if (msjs.length > 0) {
                mostrarMsjCliente('Dato incorrecto', msjs);
                return;
            }

            let familiaIngresada = familia_input.value.trim().toUpperCase();
            let categoriaIngresada = categoria_input.value.trim().toUpperCase();

            // VALIDAR CON EXPRESIONES REGULARES: si no cumple muestra msjs de error al usuario
            if (!validarFamiliaYcategoria(familiaIngresada, categoriaIngresada)) {
                return;
            }

            const { asignarFamilia, asignarCategoria } = procesarFamiliaYcategoria(familiaIngresada, categoriaIngresada, familiasBase, categoriasBase)

            let formaIngresada = forma_farmaceutica_input.value.trim().toUpperCase();
            let presentacionIngresada = presentacion_input.value.trim().toUpperCase();
            let concentracionIngresada = concentracion_input.value.trim().toUpperCase();

            // VALIDAR CON EXPRESIONES REGULARES: si no cumple muestra msjs de error al usuario
            // if (!validarFormaPresentacionConcentracion(formaIngresada, presentacionIngresada, concentracionIngresada)) {
            //     return;
            // }
            if(!validarForma(formaIngresada) || !validarPresentacion(presentacionIngresada) || !validarConcentracion(concentracionIngresada)){
                return;
            };

            const { asignarForma, asignarPresentacion, asignarConcentracion } = procesarFormaPresentacionConcentracion(formaIngresada, presentacionIngresada, concentracionIngresada, formasBase, presentacionesBase, concentracionesBase);

            const res = await agregarMedicamentoNuevoEitem(nombreGenerico, nombreComercial, asignarFamilia, asignarCategoria, asignarForma, asignarPresentacion, asignarConcentracion);

        } else {

            // M E D I C A M E N T O    E N C O N T R A D O : A G R E G A R   N U E V O   I T E M : asignar o crear y asignar forma, presentacion y concentracion. crear item del medicamento.

            let formaIngresada = forma_farmaceutica_input.value.trim().toUpperCase();
            let presentacionIngresada = presentacion_input.value.trim().toUpperCase();
            let concentracionIngresada = concentracion_input.value.trim().toUpperCase();

            // VALIDAR CON EXPRESIONES REGULARES: si no cumple muestra msjs de error al usuario
            if (!validarFormaPresentacionConcentracion(formaIngresada, presentacionIngresada, concentracionIngresada)) {
                return;
            }

            //EVITAR ITEM REPETIDO: Validar si ingresaron forma,presen y concen identicas a un item anterior
            const repetido = validarItemRepetido(itemsMedicamento, formaIngresada, presentacionIngresada, concentracionIngresada);
            if (repetido) {
                mostrarMsjCliente('Medicamento item repetido', [`El medicamento ya cuenta con la combinacion de Forma-farmaceutica, Presentacion y Concentracion ingresada.`, `No es posible agregar items repetidos ...`]);
                return;
            }

            const { asignarForma, asignarPresentacion, asignarConcentracion } = procesarFormaPresentacionConcentracion(formaIngresada, presentacionIngresada, concentracionIngresada, formasBase, presentacionesBase, concentracionesBase);

            agregarItemMedicamento(medicamentoEncontrado, asignarForma, asignarPresentacion, asignarConcentracion);
            reiniciarBusqueda();

        }

    });


});
