import { mostrarMsjCliente } from './mostrarMsjCliente.js';

document.addEventListener('DOMContentLoaded', () => {
    let roles = [];
    let msjs = [];



    const formAgregarUsuario = document.getElementById('formAgregarUsuario');
    const btnAgregarUsuario = document.querySelector('.btnAgregarUsuario');
    const btnAsignarRol = document.querySelector('.btnAsignarRol');
    const selectRoles = document.getElementById('roles');
    const divRolAsignado = document.querySelector('.divRolesAsignados');
    const ulRolesAsignados = document.querySelector('.ulRolesAsignados');
    const divDatosProfesional = document.querySelector('.divDatosRolProfesional');



    // Consultar roles a la base de datos 
    // ruta de roleRoutes importada en usuarioRoutes 
    const obtenerRoles = async () => {
        try {
            const response = await fetch('/obtenerRoles');
            if (!response.ok) {
                throw new Error('Error al obtener los roles');
            }
            const rolesDisponibles = await response.json();

            return rolesDisponibles;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // Cargar roles en el select de usuario
    const cargarRolesSelect = async () => {
        const rolesDisponibles = await obtenerRoles();

        // Limpiar el select antes de añadir los roles
        selectRoles.innerHTML = '';
        const option = document.createElement('option');
        option.value = -1;
        option.textContent = 'SELECCIONAR ROL';
        selectRoles.appendChild(option);

        rolesDisponibles.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol.id;
            option.textContent = rol.rol_descripcion;
            selectRoles.appendChild(option);
        });
    };

    cargarRolesSelect();

    // Rol/Roles agregar o eliminar
    const asignarRol = () => {

        // Obtenemos la opción seleccionada
        const optionSeleccionada = selectRoles.options[selectRoles.selectedIndex];

        // Verificamos que la opción seleccionada no sea la de "Seleccionar"
        if (optionSeleccionada.value !== '-1') {
            const rolSeleccionado = {
                id: optionSeleccionada.value,
                rol_descripcion: optionSeleccionada.textContent
            };
            // Verificamos si el rol ya está en el array roles
            if (!roles.some(rol => rol.id === rolSeleccionado.id)) {
                // Reiniciamos para evitar duplicados visuales
                selectRoles.value = '-1';
                divRolAsignado.innerHTML = '';
                ulRolesAsignados.innerHTML = '';

                // Agregamos el rol al array
                roles.push(rolSeleccionado);

                // Título para mostrar roles asignados
                const liTitulo = document.createElement('li');
                liTitulo.innerHTML = 'ROLES ASIGNADOS';
                liTitulo.classList.add('liRolesAsignadosTitulo');
                ulRolesAsignados.appendChild(liTitulo);

                // Renderizamos los roles asignados
                roles.forEach(element => {
                    const li = document.createElement('li');
                    li.classList.add('liRolAsignadoCrearUsuario');
                    li.value = element.id;
                    li.textContent = element.rol_descripcion;

                    const iconoEliminar = document.createElement('span');
                    iconoEliminar.className = 'fa fa-trash';
                    iconoEliminar.addEventListener('click', eliminarRol); // Agregar evento de clic
                    li.appendChild(iconoEliminar);

                    // Agregamos cada rol con su li dentro de la lista roles
                    ulRolesAsignados.appendChild(li);
                });

                // Agregamos la lista completa con todos los roles agregados al div contenedor oculto
                divRolAsignado.appendChild(ulRolesAsignados);
                // Mostramos el div oculto
                divRolAsignado.style.display = 'flex';

                // Cuando el rol seleccionado es "PROFESIONAL", mostramos el div con datos obligatorios para profesionales
                if (rolSeleccionado.rol_descripcion === 'PROFESIONAL') {
                    divDatosProfesional.style.display = 'flex';
                }
            } else {
                selectRoles.value = '-1';
                mostrarMsjCliente('Dato incorrecto', ['El rol seleccionado ya ha sido asignado.']);
            }
        } else {
            mostrarMsjCliente('Dato incorrecto', ['Debe seleccionar un rol antes de asignarlo.']);
        }
    };

    // cada li en roles asignados tiene un event click en eliminar que ejecuta esta funcion para eliminar de la vista y el array roles.
    const eliminarRol = (event) => {
        event.preventDefault();
        const li = event.target.closest('li');
        if (li) {
            // Obtenemos el id del rol a eliminar desde el valor del <li>
            const rolId = li.value;

            // Encontramos el rol en el array roles
            const rol = roles.find(rol => rol.id == rolId);

            // Filtramos el array roles para eliminar el rol correspondiente
            roles = roles.filter(rol => rol.id != rolId);

            // Si eliminan el rol "PROFESIONAL", volvemos a ocultar los campos de profesional
            if (rol && rol.rol_descripcion === 'PROFESIONAL') {
                divDatosProfesional.style.display = 'none';
            }

            // Eliminamos el elemento <li> del DOM
            li.remove();

            // Si se borra el último elemento, ocultamos el div completo
            if (roles.length === 0) {
                divRolAsignado.style.display = 'none';
            }
        }
    };

    // retorna usuario con sus datos, solo si son validados 
    const validarUsuario = () => {
        msjs = [];
        // datos usuario
        const nombre = document.getElementById('nombre').value.trim().toUpperCase();
        const apellido = document.getElementById('apellido').value.trim().toUpperCase();
        const documento = document.getElementById('documento').value.trim();
        const email = document.getElementById('email').value.trim().toUpperCase();
        const password = document.getElementById('password').value.trim();
        const confirmarPassword = document.getElementById('confirmarPassword').value.trim();

        const nombreApellidoRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{4,54}$/;
        const documentoRegex = /^\d{6,12}$/;
        const passwordRegex = /^\d{4,10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!nombreApellidoRegex.test(nombre)) {
            msjs.push('Nombre debe tener entre 4 y 54 caracteres. Puede contener letras, espacios y caracteres especiales como ´ y ¨.');
        }

        if (!nombreApellidoRegex.test(apellido)) {
            msjs.push('Apellido debe tener entre 4 y 54 caracteres. Puede contener letras, espacios y caracteres especiales como ´ y ¨.');
        }

        if (!documentoRegex.test(documento)) {
            msjs.push('El documento debe tener entre 6 y 12 números y no puede estar vacío.');
        }

        if (!emailRegex.test(email)) {
            msjs.push('El email debe ser un correo electrónico válido y no puede estar vacío.');
        }

        if (!passwordRegex.test(password)) {
            msjs.push('La contraseña debe tener entre 4 y 10 números y no puede estar vacía.');
        }

        if (password !== confirmarPassword) {
            msjs.push('Las contraseñas ingresadas no coinciden.');
        }

        if (!roles.length) {
            msjs.push('Rol obligatorio, debe tener minimo un rol o varios.');
        }

        if (msjs.length > 0) {
            mostrarMsjCliente("Verifica los datos", msjs);
            return;
        } else {
            let estado = 1;
            let usuario = {
                nombre,
                apellido,
                documento,
                password,
                estado,
                email
            };



            // retornar usuario con los datos validados
            return usuario;
        }
    };

    //retorna profesional con datos ,solo si son validados
    const validarProfesional = () => {
        //datos profesional(div oculto a menos que asignen profesional)
        const profesion = document.getElementById('profesion').value.trim().toUpperCase();
        const especialidad = document.getElementById('especialidad').value.trim().toUpperCase();
        const matricula = document.getElementById('matricula').value.trim().toUpperCase();
        const domicilio = document.getElementById('domicilio').value.trim().toUpperCase();
        const idRefeps = document.getElementById('idRefeps').value.trim();
        const caducidad = document.getElementById('caducidad').value;

        let msjs = [];
        // Validación de profesion
        const profesionRegex = /^[a-zA-ZñÑ\s,.´¨]{6,99}$/;
        if (!profesionRegex.test(profesion)) {
            msjs.push('Profesion incorrecta. Debe contener min 6, max 99 caracteres. (Simbolos permitidos: , . ´ ¨ ñ).')
        }

        // Validación de especialidad
        const especialidadRegex = /^[a-zA-ZñÑ\s,.´¨]{6,99}$/;
        if (!especialidadRegex.test(especialidad)) {
            msjs.push('Especialidad incorrecta. Debe contener min 6, max 99 caracteres. (Simbolos permitidos: , . ´ ¨ ñ).')
        }

        // Validación de matricula
        const matriculaRegex = /^M\d{3,6}$/;
        if (!matriculaRegex.test(matricula)) {
            msjs.push('Matricula incorrecta. Dede contener min 4, max 10 caracteres. (Ejemplo: M123, M3423).')
        }

        // Validación de domicilio
        const domicilioRegex = /^[a-zA-ZñÑ\s0-9´¨().,]{20,149}$/;
        if (!domicilioRegex.test(domicilio)) {
            msjs.push('Domicilio incorrecto. Dede contener min 20, max 149 caracteres. (Simbolos permitidos: ´ ¨ () . , ñ ).')
        }

        // Validación de idRefeps
        if (!idRefeps || isNaN(idRefeps) || idRefeps.length < 4 || idRefeps.length > 11) {
            msjs.push('ID-REFEPS incorrecto. Solo permite numeros, dede contener min 4, max 11 numeros.')
        }

        if (!caducidad) {
            msjs.push('Caducidad incorrecta. Debe ingresar una fecha.')
        } else {
            let currentDate = new Date();
            let selectedDate = new Date(caducidad);

            if (selectedDate <= currentDate) {
                msjs.push("Caducidad incorrecta, debe ser una fecha futura.");
            }
        }

        if (msjs.length > 0) {
            mostrarMsjCliente('Profesional Datos Incorrectos', msjs);
        } else {
            let profesional = {
                profesion: profesion,
                especialidad: especialidad,
                matricula: matricula,
                domicilio: domicilio,
                id_refeps: idRefeps,
                caducidad: caducidad
            }
            return profesional;
        }
    }

    // Eventos click asignar Rol, (event click eliminar esta dentro de asignarRol en cada li ingresado)
    btnAsignarRol.addEventListener('click', function (event) {
        event.preventDefault();
        asignarRol();
    });



    // AGREGAR USUARIO COMPLETO 
    //LLamar funciones para validar primero los datos como usuario que tambien valida que tenga al menos 1 rol.
    //Si esta funcion cumple todas las validaciones verificamos el array roles si tiene asignado rol: profesional.
    //Si esta asignado este rol(profesional) llamamos a validarProfesional para los datos ingresados como profesional.
    //Se vuelve a verificar roles y se envian datos al servidor con fetch { usuario{}, roles[], opcional profesional{}}

    btnAgregarUsuario.addEventListener('click', async function (event) {
        event.preventDefault();

        // Validar datos del usuario y guardar objeto usuario
        let usuario = validarUsuario();

        // Si no retorna un objeto usuario con los datos, no continuar con las validaciones
        if (!usuario) {
            return;
        }

        // Si está asignado el rol 'Profesional', validar campos de Profesional y guardar objeto profesional
        let profesional;

        // Verificar roles dentro de validarUsuario que mínimo tenga un rol
        for (const element of roles) {
            if (element.rol_descripcion === 'PROFESIONAL') {
                profesional = validarProfesional();
                // Si no retorna un objeto profesional con los datos, no continuar con el fetch al servidor
                if (profesional === undefined) {
                    return;
                }
            }
        }

        try {
            const response = await fetch('/crearUsuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, roles, profesional })
            });

            if (!response.ok) {
                const errorData = await response.json();
                let msjs = [];
                if (errorData.error === 'documento_duplicado') {
                    msjs.push('El documento ingresado ya se encuentra registrado.');
                } else if (errorData.error === 'email_duplicado') {
                    msjs.push('El email ingresado ya se encuentra registrado.');
                } else if (errorData.error === 'matricula_duplicada') {
                    msjs.push('La matrícula ingresada ya se encuentra registrada.');
                } else if (errorData.error === 'id_refeps_duplicado') {
                    msjs.push('El ID REFEPS ingresado ya se encuentra registrado.');
                } else if (errorData.error === 'validacion_fallida') {
                    msjs.push(...errorData.message);
                } else {
                    throw new Error('Error al crear el usuario completo');
                }
                if (msjs.length > 0) {
                    msjs.push('El usuario no pudo ser agregado, verifique los datos.');
                    mostrarMsjCliente('Datos incorrectos', msjs);
                }
                return;
            }

            const nuevoUsuario = await response.json();
            mostrarMsjCliente('Datos correctos', ['El usuario ha sido agregado exitosamente']);

        } catch (error) {
            console.error('Error:', error);
            mostrarMsjCliente('Error en el servidor', ['Hubo un problema al intentar agregar el usuario. Intente nuevamente más tarde.']);
        }
    });
});

