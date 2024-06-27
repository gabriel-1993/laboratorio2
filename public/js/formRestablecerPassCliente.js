import { mostrarMsjCliente } from './mostrarMsjCliente.js';


// FORMULARIO PARA ASIGNAR EL CORREO AL QUE DESEA RECIBIR EL ENLACE DE RESTABLECIMIENTO EL USUARIO
//este evento captura el email ingresado lo valida y lo envia al controlador para validarlo: si existe le envia el enlace para modificar el pass

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRecuperarPassword');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = form.email.value.trim(); // Utiliza trim() para eliminar espacios en blanco al inicio y al final

        if (email === '') {
            mostrarMsjCliente('Dato obligatorio', ['Ingrese la dirección de correo electrónico.']);
            return;
        }

        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regex.test(email)) {
            mostrarMsjCliente('Dato incorrecto', ['Revise la dirección de correo electrónico.', 'ejemplo@gmail.com']);
            return;
        }

        try {
            const response = await fetch('/restablecer-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.status === 200) {
                form.email.value = "";
                mostrarMsjCliente('Enlace enviado', [result.mensaje]);
            } else if (response.status === 400) {
                mostrarMsjCliente('Correo incorrecto', [result.mensaje]);
            } else {
                mostrarMsjCliente('Error', [result.error || 'Ha ocurrido un error. Por favor, intenta nuevamente.']);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMsjCliente('Error de conexión. Por favor, intenta nuevamente.', 'error');
        }
    });
});
