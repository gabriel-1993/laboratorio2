import { mostrarMsjCliente } from './mostrarMsjCliente.js';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('formRestablecerPassword');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = form.token.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        // if (password === '' || confirmPassword === '') {
        //     mostrarMsjCliente('Datos obligatorios', ['Debes ingresar una nueva contraseña y confirmar contraseña nueva.']);
        //     return;
        // }

        // const regexPassword = /^[0-9]{4,10}$/;
        // if (!regexPassword.test(password) || !regexPassword.test(confirmPassword)) {
        //     mostrarMsjCliente("Password incorrecto", ["El password debe tener solo números y una longitud mínima de 4 y máxima de 10."]);
        //     return;
        // }

        // if (password !== confirmPassword) {
        //     mostrarMsjCliente('Error', ['Las contraseñas no coinciden.']);
        //     return;
        // }

        try {
            const response = await fetch(`/restablecer-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password, confirmPassword })
            });

            const result = await response.json();

            if(response.status === 400){
                mostrarMsjCliente('Datos incorrectos', result.mensaje);
                return;
            }

            if (response.ok) {
                mostrarMsjCliente('Contraseña modificada', ['Su contraseña ha sido modificada con éxito.']);
                setTimeout(() => {

                    window.location.href = '/';
                  }, 3000);

            } else {
                mostrarMsjCliente('Error', result.error || ['Ha ocurrido un error. Por favor, intenta nuevamente.']);
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMsjCliente('Error', ['Error de conexión. Por favor, intenta nuevamente.']);
        }
    });

});
