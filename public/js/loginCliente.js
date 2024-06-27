import { mostrarMsjCliente } from "./mostrarMsjCliente.js";


document.addEventListener('DOMContentLoaded', function () {
    //limpiar localStorage
    const formLogin = document.getElementById('formLogin');

    formLogin.addEventListener('submit', async function (event) {
        event.preventDefault();

        const documento = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!documento || !password) {
            mostrarMsjCliente("Datos vacíos", ["Por favor, ingrese documento y password."]);
            return;
        };
        
        // expreciones para user y pass
        const regexDocumento = /^[0-9]{6,12}$/;
        if (!regexDocumento.test(documento)) {
            mostrarMsjCliente("Documento incorrecto", ["El documento debe tener solo números y una longitud mínima de 6 y máxima de 12."]);
            return;
        }
        const regexPassword = /^[0-9]{4,10}$/;
        if (!regexPassword.test(password)) {
            mostrarMsjCliente("Password incorrecto", ["El password debe tener solo números y una longitud mínima de 4 y máxima de 10."]);
            return;
        }


        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documento, password })
            });

            const data = await response.json();
            //Usuario o pass incorrecto msjs de usuario
            if (!response.ok) {
                mostrarMsjCliente("Dato incorrecto", [data.mensaje]);
                return;  // Asegúrate de no continuar con el código si hay un error
            }

            //Con uno o varios roles recibibe datosProfesional que tendra caducado o los datos del profesional para guardar en el sessionStorage
            if (data.datosProfesional !== 'caducado') {
                sessionStorage.setItem('datosProfesional', JSON.stringify(data.datosProfesional[0]));
            } else {
                localStorage.clear();
            }

            //Usuario con unico rol 'PROFESIONAL' (caducado...)
            //Cuano tenga varios roles se verifica en el momento que seleccione rol PROFESIONAL para dar un msj en ese momento
            //Se va a utilizar la info guardada en el sessionStorage desde public/js/selectRol.js
            if (data.role === 'PROFESIONALCADUCADO' && data.datosProfesional.profesional === 'caducado') {
                mostrarMsjCliente("Desahabilitado", ["Por favor comuniquese con el admin, su rol como profesional se encuentra caducado."]);
                return;
            }

            switch (data.role) {
                case 'ADMINISTRADOR':
                    window.location.href = '/indexAdmin';
                    break;
                case 'PROFESIONAL':
                    window.location.href = '/indexProf';
                    break;
                case 'SELECCION_ROL':
                    const rolesJSON = JSON.stringify(data.roles);
                    window.location.href = '/selectRol?roles=' + encodeURIComponent(rolesJSON);
                    break;
                default:
                    console.log('Rol desconocido');
                    break;
            }

        } catch (error) {
            console.error('Error en la solicitud de inicio de sesión:', error);
            mostrarMsjCliente("Error", ["Error en la solicitud de inicio de sesión"]);
        }
    });
});

