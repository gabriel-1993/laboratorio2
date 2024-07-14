// Mostrar div con mensajes
export function mostrarMsjCliente(titulo, mensajes) {

    // section va estar siempre detras del cartel con los msjs
    const section = document.querySelector(".section");
    section.style.filter = 'blur(2px)';

    const cardMsj = document.querySelector(".divMsj");
    cardMsj.style.display = '';

    cardMsj.classList.add("mostrarMsj");

    // Limpiar mensajes anteriores si es necesario
    cardMsj.innerHTML = '';

    // Crear el título
    const h2 = document.createElement('h2');
    h2.textContent = titulo;
    cardMsj.appendChild(h2);

    // Crear la lista ul
    const ul = document.createElement('ul');

    // Recorrer el array de mensajes y agregar cada uno como un elemento li
    mensajes.forEach(mensaje => {
        const li = document.createElement('li');
        li.textContent = mensaje;
        ul.appendChild(li);
    });

    // Agregar la lista al div de mensajes
    cardMsj.appendChild(ul);

    // Crear el botón de cerrar
    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.classList.add('btn-Msj');
    btnCerrar.addEventListener('click', () => {
        section.style.filter = 'blur(0px)';
        cardMsj.style.display = 'none';
    });
    cardMsj.appendChild(btnCerrar);
}


