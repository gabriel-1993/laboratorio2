
//AL IGUAL QUE MOSTRAR MENSAJES PUEDE SER UTIL EN DISTINTAS PARTES DE LA APP 

//MOSTRAR LISTA ASIGNADA CON INPUT ESPECIFICO , AL HACER CLICK O ESCRIBIR

//FILTRAR LISTA POR LETRAS INGRESADAS EN CUALQUIER PARTE DE LAS DESCRIPCIONES NO SOLO AL PRINCIPIO

//CLICK FUERA O SCROLL PARA OCULTAR LA LISTA

// CSS :
// DIVCONTENEDOR (position relative) 
// ---- DIV CON LABEL E INPUT
//----- UL para mstrar lista estilos:
// .listaFiltrada {
//     max-height: 200px;
//     overflow-y: auto;
//     position: absolute;
//     z-index: 2;
//     top: 26px;
//     width: 100%;
//     display: flex;
//     flex-direction: column;
//     justify-content: end;
//     align-items: end;
// }

// cada li:-------------------------------------------
// .listaFiltradaItem {
//     background-color: var(--color-fondo);
//     padding: 5px;
//     cursor: pointer;
//     width: 62%;
//     color: var(--azulOscuro);
// }

// Función para configurar el comportamiento de un input con su lista correspondiente
export function configurarInputConLista(selectorInput, selectorLista, elementos) {
    const input = document.querySelector(selectorInput);
    const lista = document.querySelector(selectorLista);

    // Mostrar lista al hacer clic en el input
    input.addEventListener('click', () => mostrarLista(lista, elementos));

    // Filtrar lista al escribir en el input
    input.addEventListener('input', () => filtrarLista(input, lista, elementos));

    // Ocultar lista al hacer clic fuera del input y la lista
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !lista.contains(event.target)) {
            ocultarLista(lista);
        }
    });

    // Ocultar lista al desplazarse
    window.addEventListener('scroll', () => ocultarLista(lista));

    // Mostrar lista si el input no está vacío
    input.addEventListener('focus', () => {
        if (input.value !== '') {
            mostrarLista(lista, elementos);
        }
    });

    // Añadir opción al hacer clic en la lista
    lista.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            input.value = event.target.textContent;
            ocultarLista(lista);
        }
    });
}

// Función para mostrar la lista
export function mostrarLista(lista, elementos) {
    lista.classList.remove('displayNone');
    renderizarLista(lista, elementos);
}

// Función para ocultar la lista
export function ocultarLista(lista) {
    lista.classList.add('displayNone');
}

// Función para renderizar la lista
export function renderizarLista(elementoLista, elementos) {
    elementoLista.innerHTML = ''; // Limpiar lista anterior

    elementos.forEach(elemento => {
        const itemLista = document.createElement('li');
        itemLista.classList.add('listaFiltradaItem');
        //SI TIENE ID ASIGNARLO AL LI
        if (elemento.id) {
            itemLista.dataset.id = elemento.id;
        }
        if (elemento.descripcion) {
            itemLista.textContent = elemento.descripcion;
            elementoLista.appendChild(itemLista);
        } else if (elemento.nombre && !elemento.documento) {
            //obras sociales por ej muestro nombres
            itemLista.textContent = elemento.nombre;
            elementoLista.appendChild(itemLista);
        }else if(elemento.documento){
              // pacientes muestra documento
              itemLista.textContent = elemento.documento;
              elementoLista.appendChild(itemLista);
        }


    });
}

// Función para filtrar la lista
export function filtrarLista(input, lista, elementos) {
    const textoFiltro = input.value.toLowerCase();
    let elementosFiltrados;
    if (elementos[0].descripcion) {
        elementosFiltrados = elementos.filter(elemento =>
            elemento.descripcion.toLowerCase().includes(textoFiltro)
        );
    } else if (elementos[0].nombre) {
        //Obra social .nombre
        elementosFiltrados = elementos.filter(elemento =>
            elemento.nombre.toLowerCase().includes(textoFiltro)
        );
    }



    if (textoFiltro === '') {
        ocultarLista(lista);
    } else {
        mostrarLista(lista, elementosFiltrados);
    }
}