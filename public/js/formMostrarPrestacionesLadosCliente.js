
document.addEventListener('DOMContentLoaded', async () => {
    const divContenedorItemsLados = document.querySelector('.divContenedorItemsLados');
    const divContenedorItemsPrestaciones = document.querySelector('.divContenedorItemsPrestaciones')
    const descripcionInput = document.querySelector('#descripcion');
    const descripcionPrestacion = document.querySelector('#descripcionPrestacion');

    // Función para obtener prestaciones y lados desde la base de datos
    async function fetchObtenerPrestacionesYlados() {
        try {
            const response = await fetch('/obtenerPrestacionesYlados');
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            const datos = await response.json();
            return datos;
        } catch (error) {
            console.error('Hubo un problema con la solicitud:', error);
            document.getElementById('data').innerText = 'Ocurrió un error al cargar los datos.';
            return null;
        }
    }

    // Función para renderizar las cards de los lados
    function renderizarLados(lados) {
        divContenedorItemsLados.innerHTML = ''; // Limpiar el contenedor antes de renderizar

        lados.forEach(element => {
            // Crear la card de cada lado
            const card = document.createElement('div');
            card.classList.add('cardLados');

            // Título con id de cada lado fondo azul
            const h4 = document.createElement('h4');
            h4.classList.add('text-fondoAzul');
            // h4.classList.add('borderRadiusTop5px');
            h4.innerHTML = `Lado ID ${element.id}`;
            card.appendChild(h4);

            const divLabelInput = document.createElement('div');
            divLabelInput.classList.add('datoItem');

            const label = document.createElement('label');
            label.classList.add('labelCenter');
            label.classList.add('text-fondoCeleste');
            label.style.borderBottomLeftRadius = '0px';
            label.style.borderTopLeftRadius = '0px';
            label.textContent = 'Descripcion';
            divLabelInput.appendChild(label);

            const input = document.createElement('input');
            input.value = `${element.descripcion}`;
            input.style.borderRadius = '0px';

            divLabelInput.appendChild(input);
            card.appendChild(divLabelInput);

            divContenedorItemsLados.appendChild(card);
        });
    }


    function renderizarPrestaciones(prestaciones) {
        divContenedorItemsPrestaciones.innerHTML = ''; // Limpiar el contenedor antes de renderizar

        prestaciones.forEach(element => {
            // Crear la card de cada lado
            const card = document.createElement('div');
            card.classList.add('cardPrestacion');

            // Título con id de cada lado fondo azul
            const h4 = document.createElement('h4');
            h4.classList.add('text-fondoAzul');
            // h4.classList.add('borderRadiusTop5px');
            h4.innerHTML = `Prestacion ID ${element.id}`;
            card.appendChild(h4);

            //primer label input descripcion
            const divLabelInput = document.createElement('div');
            divLabelInput.classList.add('datoItem');

            const label = document.createElement('label');
            label.classList.add('labelCenter');
            label.classList.add('text-fondoCeleste');
            label.style.borderBottomLeftRadius = '0px';
            label.style.borderTopLeftRadius = '0px';
            label.textContent = 'Descripcion';
            divLabelInput.appendChild(label);

            const input = document.createElement('input');
            input.value = `${element.descripcion}`;
            input.style.borderRadius = '0px';

            divLabelInput.appendChild(input);
            card.appendChild(divLabelInput);

            //segundo label input estado
            const divLabelInput2 = document.createElement('div');
            divLabelInput2.classList.add('datoItem');

            const label2 = document.createElement('label');
            label2.classList.add('labelCenter');
            label2.classList.add('text-fondoCeleste');
            label2.style.borderBottomLeftRadius = '0px';
            label2.style.borderTopLeftRadius = '0px';
            label2.textContent = 'Estado';
            divLabelInput2.appendChild(label2);

            const input2 = document.createElement('input');
            if (element.estado === 0) {
                input2.value = `NO DISPONIBLE`;
            } else if (element.estado === 1) {
                input2.value = `DISPONIBLE`;
            }
            input2.style.borderRadius = '0px';

            divLabelInput2.appendChild(input2);
            card.appendChild(divLabelInput2);
            divContenedorItemsPrestaciones.appendChild(card);
        });
    }





    // Obtener datos y renderizar todos los lados inicialmente
    const datos = await fetchObtenerPrestacionesYlados();
    if (datos) {

        // LADOS 
        renderizarLados(datos.lados);
        // Filtrar y renderizar las cards según el input de descripción
        descripcionInput.addEventListener('input', function () {
            const filtro = descripcionInput.value.toLowerCase();
            const ladosFiltrados = datos.lados.filter(lado =>
                lado.descripcion.toLowerCase().includes(filtro)
            );
            renderizarLados(ladosFiltrados);
        });


        // PRESTACIONES
        renderizarPrestaciones(datos.prestaciones);

        // Filtrar y renderizar las prestaciones según el input de descripción
        descripcionPrestacion.addEventListener('input', function () {
            const filtroPrestacion = descripcionPrestacion.value.toLowerCase();
            const prestacionesFiltradas = datos.prestaciones.filter(prestacion =>
                prestacion.descripcion.toLowerCase().includes(filtroPrestacion)
            );
            renderizarPrestaciones(prestacionesFiltradas);
        });
    }
});