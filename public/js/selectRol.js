import { mostrarMsjCliente } from "./mostrarMsjCliente.js";
//Usuario con varios roles luego de logearse, cuando elija el rol en el select 
//Este escuchador va a modificar la url de la pagina para mostrar la vista corresponiente

document.addEventListener('DOMContentLoaded', function () {
    const select = document.querySelector("#selectorRol");

    if (select) { // Verificar si el select está presente en la página
        select.addEventListener('change', function (event) {
            const selectedOption = event.target.value;

            if (selectedOption === "2") {
                // VALIDAR CADUCIDAD ROL PROFESIONAL: Recuperar los datos del sessionStorage
                const datosProfesional = sessionStorage.getItem('datosProfesional');
                let msjs = [];
                

                if (datosProfesional === 'undefined') {
                    // Mostrar mensaje cuando no hay datos guardados (PROFESIONAL CADUCADO)
                    msjs.push("Por favor comuniquese con el admin, su rol como profesional se encuentra caducado.");
                }
                
                if (msjs.length > 0) {
                    // Mostrar los mensajes al usuario
                    mostrarMsjCliente("Desahabilitado",msjs);
                } else {
                    // Redirigir si no hay mensajes
                    window.location.href = '/indexProf';
                }
            } else if (selectedOption === "1") {
                // Redirigir para la opción 1 sin necesidad de validar mensajes
                window.location.href = '/indexAdmin';
            } else {
                console.log("No se ha seleccionado una opción válida.");
            }
        });
    }
});
