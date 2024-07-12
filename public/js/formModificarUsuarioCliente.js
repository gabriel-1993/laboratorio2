// MODIFICAR USUARIO GENERA LA MODIFICACION COMPLETA PARA EVITAR INCONSISTENCIAS EN LA BASE DE DATOS
//PRIMERO valida usuario, luego roles y si esta asignado rol profesional valido form profesional


import { mostrarMsjCliente } from './mostrarMsjCliente.js';

document.addEventListener('DOMContentLoaded', () => {

    const btnBuscarDocumento = document.querySelector('.btnBuscarDocumento');
    const btnAsignarRol = document.querySelector('.btnAsignarRol');
    const documentoInput = document.querySelector('#buscarDocumento');
    const datosContenedor = document.querySelector('.divFlexRow');
    const divDatosModificarRolProfesional = document.querySelector('.divDatosModificarRolProfesional');
    const divModificarUsuario = document.querySelector('.divModificarUsuario');
    const btnModificarUsuario = document.querySelector('.btnModificarUsuario');

    // DATOS USUARIO
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const documento = document.getElementById('documento');
    const email = document.getElementById('email');
    const selectEstado = document.getElementById('estado');
    const selectRoles = document.querySelector('.selectRolesModificarUsuario');
    const divRolAsignado = document.querySelector('.divRolesAsignados');
    const ulRolesAsignados = document.querySelector('.ulRolesAsignados');

    // DATOS ROL: PROFESIONAL
    const profesion = document.querySelector('#profesion');
    const especialidad = document.querySelector('#especialidad');
    const matricula = document.querySelector('#matricula');
    const domicilio = document.querySelector('#domicilio');
    const id_refeps = document.querySelector('#idRefeps');
    const caducidad = document.querySelector('#caducidad');


    let msjs = [];
    // variables con mayor scope
    //arrays con alcance para varias funciones
    // para guardar los roles asignados en el front
    let rolesAsignados = [];
    //roles que se muestran en el select de roles(llegan de la base de datos y se filtran los que no esten asignados al usuario)
    let rolesDisponibles = [];
    //roles que trae el usuario al buscar el documento de la base de datos 
    let rolesOriginales = [];
    let modificarRoles = false;


    //usuarioValidado: form
    let usuarioValidado;
    //usuario: capturado en la base de datos
    let usuario;
    //profesionalValidado: form profesional
    let profesionalValidado;
    //datosProfesional: capturado de la base de datos
    let datosProfesional = null;

    //booleans para enviar al controlador: por ejemplo validar datos de tipo unico solo si fueron modificados en el front
    //(usuario.documento,  usuario.email),(profesional.matricula, profesional.id_refeps)que no esten ocupados.
    // antes de intentar modificarlos validar que esten disponibles y no generar errores...
    let validarUsuarioDocumento = false;
    let validarUsuarioEmail = false;
    let validarProfesionalMatricula = false;
    //id_refeps
    let validarProfesionalIdRefeps = false;

    const reiniciarVariablesGlobales = () => {
        msjs = [];
        rolesAsignados = [];
        rolesDisponibles = [];
        rolesOriginales = [];
        modificarRoles = false;
        usuarioValidado = '';
        usuario = '';
        profesionalValidado = '';
        datosProfesional = null;
        validarUsuarioDocumento = false;
        validarUsuarioEmail = false;
        validarProfesionalMatricula = false;
        validarProfesionalIdRefeps = false;
    }

    async function fetchJson(url) {
        try {
            const response = await fetch(url);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al buscar el usuario');
            }

            return result;
        } catch (error) {
            throw error; // Lanza el error para que pueda ser manejado en el bloque try-catch de la llamada a fetchJson
        }
    }

    const buscarRolesUsuario = (usuarioId) => fetchJson(`/buscarRolesUsuario/${usuarioId}`);
    const buscarDatosProfesional = (usuarioId) => fetchJson(`/buscarDatosProfesional/${usuarioId}`);
    const obtenerRoles = () => fetchJson('/obtenerRoles');

    //elimina el rol del array rolesAsignados(al usuario) y lo guarda en el array rolesDisponibles(select roles)
    //actualiza las vistas con las modificaciones de los arrays
    const eliminarRol = (event) => {
        const li = event.target.closest('li');
        if (!li) return;

        const rolId = li.value;
        const rol = rolesAsignados.find(rol => rol.rol_id == rolId);
        if (rol) {
            rolesAsignados = rolesAsignados.filter(item => item !== rol);
            if (!rolesDisponibles.find(item => item.id === rol.rol_id)) {
                rolesDisponibles.push(rol);
            }
            cargarSelectRoles();
            if (rol.rol_descripcion === 'PROFESIONAL') {
                limpiarProfesional();
                divDatosModificarRolProfesional.classList.add('displayNone');
            }
            li.remove();
            if (rolesAsignados.length === 0) {
                divRolAsignado.classList.add('displayNone');
            }
        }
    };

    //agrega el rol al array rolesAsignados(al usuario) y lo elimina en el array rolesDisponibles(select roles)
    //actualiza las vistas con las modificaciones de los arrays
    const asignarRol = () => {
        const selectedOption = selectRoles.options[selectRoles.selectedIndex];
        if (selectedOption.value === '-1') {
            mostrarMsjCliente('Dato incorrecto', ['Debe seleccionar un rol antes de asignarlo.']);
            return;
        }

        const rolSeleccionado = {
            rol_id: selectedOption.value,
            rol_descripcion: selectedOption.textContent
        };

        rolesAsignados.push(rolSeleccionado);
        rolesDisponibles = rolesDisponibles.filter(rol => rol.id != rolSeleccionado.rol_id);
        cargarSelectRoles();


        //Tambien se agregan a rolesOriginales: Eliminar rolSeleccionado de rolesOriginales aun no esta agregado en la base
        rolesOriginales = rolesOriginales.filter(rol => rol.rol_id != rolSeleccionado.rol_id);

        const li = document.createElement('li');
        li.value = rolSeleccionado.rol_id;
        li.textContent = rolSeleccionado.rol_descripcion;
        li.classList.add('liRolAsignadoModificarUsuario');

        const iconoEliminar = document.createElement('span');
        iconoEliminar.className = 'fa fa-trash';
        iconoEliminar.addEventListener('click', eliminarRol);
        li.appendChild(iconoEliminar);

        ulRolesAsignados.appendChild(li);
        divRolAsignado.classList.remove('displayNone');

        //Si no es la primera vez que se carga como profesional, esta cargado en tabla profesional con estado 0. Traer datos y mostrarlos.
        //Si es la primera vez que se asigna rol profesional al usuario, mostrar campos en blanco.
        if (rolSeleccionado.rol_descripcion === 'PROFESIONAL') {
            divDatosModificarRolProfesional.classList.remove('displayNone');

            if (datosProfesional.length) {
                mostrarDatosProfesional(datosProfesional);
            }
        }
    };

    //Filtrar array rolesDisponibles con rolesAsignados para no mostrar roles ya asignados y evitar errores
    const filtrarRolesDisponibles = () => rolesDisponibles.filter(rol => !rolesAsignados.some(r => r.rol_id === rol.id));

    // Ejecutra filtrarRolesDisponibles y renderiza el select con los roles o un mensaje si ya estan todos los roles asignados
    const cargarSelectRoles = () => {
        selectRoles.innerHTML = '';
        const rolesFiltrados = filtrarRolesDisponibles();
        const optionDefault = document.createElement('option');
        optionDefault.value = -1;
        optionDefault.textContent = rolesFiltrados.length ? 'SELECCIONAR ROL' : 'NO HAY ROLES SIN ASIGNAR';
        selectRoles.appendChild(optionDefault);
        rolesFiltrados.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol.id;
            option.textContent = rol.rol_descripcion;
            selectRoles.appendChild(option);
        });
    };

    // vaciar inputs form profesional
    const limpiarProfesional = () => {
        profesion.value = '';
        especialidad.value = '';
        matricula.value = '';
        domicilio.value = '';
        id_refeps.value = '';
        caducidad.value = '';
    };
    //vaciar inputs form usuario
    const limpiarUsuario = () => {
        nombre.value = '';
        apellido.value = '';
        documento.value = '';
        email.value = '';
    }
    // vaciar div con roles asignados
    const limpiarDivRoles = () => {
        ulRolesAsignados.innerHTML = '';
        // divRolAsignado.classList.add('displayNone');
    }

    // retorna usuario con los datos del form, muestra msjs de error en front.  
    //si se retorna un usuario del form luego se valida con el usuario encontrado original para validar si hay modificaciones que hacer y cuales. (documento e email son datos unicos en la base)
    const validarUsuario = () => {
        msjs = [];
        // datos usuario
        const nombreInput = document.getElementById('nombre');
        const apellidoInput = document.getElementById('apellido');
        const documentoInput = document.getElementById('documento');
        const emailInput = document.getElementById('email');
        const selectEstado = document.getElementById('estado');

        // const selectRoles = document.querySelector('.selectRolesModificarUsuario');
        // const divRolAsignado = document.querySelector('.divRolesAsignados');
        // const ulRolesAsignados = document.querySelector('.ulRolesAsignados');

        const nombre = nombreInput.value.trim().toUpperCase();
        const apellido = apellidoInput.value.trim().toUpperCase();
        const documento = documentoInput.value.trim();
        const email = emailInput.value.trim().toUpperCase();
        const estado = parseInt(selectEstado.value, 10);



        const nombreApellidoRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{4,54}$/;
        const documentoRegex = /^\d{6,12}$/;
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

        if (!rolesAsignados.length) {
            msjs.push('Rol obligatorio, debe tener minimo un rol o varios.');
        }

        if (msjs.length > 0) {
            mostrarMsjCliente("Verificar datos usuario", msjs);
            return msjs;
        } else {
            //variable para verificar en el controlador si se modifica usuario
            let modificar = false;
            let usuario = {
                nombre,
                apellido,
                documento,
                estado,
                email,
                modificar
            };

            // retornar usuario con los datos validados
            return usuario;
        }
    };

    //retorna profesional con los datos del form profesional, muestra msjs de error en el front para validaciones.
    //si se retorna un profesional del form luego se valida con el profesional encontrado original para validar si hay que modificaciones que hacer y cuales. (matricula e id_refeps son datos unicos en la base)
    //Validar tambien para profesional nuevo.
    const validarProfesional = () => {
        msjs = [];

        //datos profesional(div oculto a menos que asignen profesional)
        const profesionInput = document.getElementById('profesion');
        const especialidadInput = document.getElementById('especialidad');
        const matriculaInput = document.getElementById('matricula');
        const domicilioInput = document.getElementById('domicilio');
        const idRefepsInput = document.getElementById('idRefeps');
        const caducidadInput = document.querySelector('#caducidad');

        const profesion = profesionInput.value.trim().toUpperCase();
        const especialidad = especialidadInput.value.trim().toUpperCase();
        const matricula = matriculaInput.value.trim().toUpperCase();
        const domicilio = domicilioInput.value.trim().toUpperCase();
        let id_refeps = idRefepsInput.value.trim();
        let caducidad = caducidadInput.value.trim();

        msjs = [];
        // // Validación de profesion
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
        if (isNaN(id_refeps) || id_refeps.length < 4 || id_refeps.length > 11) {
            msjs.push('ID-REFEPS incorrecto. Solo permite numeros, dede contener min 4, max 11 numeros.')
        } else {
            id_refeps = Number(id_refeps);
        }


        if (caducidad === '') {
            msjs.push('Caducidad incorrecta. Debe ingresar una fecha.');
        } else {
            // Validar si ingresó una fecha futura
            let currentDate = new Date();
            let selectedDate = new Date(caducidad);

            if (selectedDate <= currentDate) {
                msjs.push("Caducidad incorrecta, debe ser una fecha futura.");
            }

            // Si el usuario ya era profesional, mantener la hora original
            if (datosProfesional[0]?.caducidad && msjs.length === 0) {
                // Asigna horas, minutos y segundos de datosProfesional.caducidad a selectedDate
                let caducidadTime = new Date(datosProfesional[0].caducidad);
                selectedDate.setHours(caducidadTime.getHours());
                selectedDate.setMinutes(caducidadTime.getMinutes());
                selectedDate.setSeconds(caducidadTime.getSeconds());

                //actualizar la hora retrocede un día, sumar uno para ingresar el que eligió el usuario
                selectedDate.setDate(selectedDate.getDate() + 1);

            }
            caducidad = selectedDate.toISOString();
        }

        if (msjs.length > 0) {
            mostrarMsjCliente('Verificar datos profesional', msjs);
            return msjs;
        } else {
            let modificar = false;
            let profesional = {
                profesion,
                especialidad,
                matricula,
                domicilio,
                id_refeps,
                caducidad,
                modificar
            }
            return profesional;
        }
    };


    // resderizar datos de usuario encontrado por numero de documento
    const mostrarDatosUsuario = (usuario) => {

        // Mostrar y asignar los datos
        datosContenedor.classList.remove('displayNone');
        divModificarUsuario.style.width = 'auto';
        divModificarUsuario.style.paddingBottom = '0px';
        btnModificarUsuario.classList.remove('displayNone');

        nombre.value = usuario.nombre;
        apellido.value = usuario.apellido;
        documento.value = usuario.documento;
        email.value = usuario.email;
        selectEstado.value = usuario.estado === 1 ? '1' : '0';
    }

    // renderizar roles del array rolesAsignados
    const mostrarRolesAsignados = (rolesAsignados) => {
        // Limpiar contenido previo
        divRolAsignado.innerHTML = '';
        ulRolesAsignados.innerHTML = '';

        // Crear y añadir el título
        const liTitulo = document.createElement('li');
        liTitulo.value = -1;
        liTitulo.textContent = 'Roles Asignados';
        liTitulo.classList.add('liRolesAsignadosTitulo');
        ulRolesAsignados.appendChild(liTitulo);

        // Añadir los roles asignados
        rolesAsignados.forEach(rol => {
            const li = document.createElement('li');
            li.value = rol.rol_id;
            li.textContent = rol.rol_descripcion;
            li.classList.add('liRolAsignadoModificarUsuario');

            const iconoEliminar = document.createElement('span');
            iconoEliminar.className = 'fa fa-trash';
            iconoEliminar.addEventListener('click', eliminarRol);
            li.appendChild(iconoEliminar);
            ulRolesAsignados.appendChild(li);
        });

        // Añadir la lista de roles al contenedor
        divRolAsignado.appendChild(ulRolesAsignados);
    };

    // Función flecha para mostrar datos profesionales
    const mostrarDatosProfesional = (datosProfesional) => {
        if (datosProfesional.length > 0) {
            // Mostrar el contenedor de datos del profesional
            divDatosModificarRolProfesional.classList.remove('displayNone');

            // Extraer la fecha de caducidad y formatearla
            const caducidadDate = new Date(datosProfesional[0].caducidad);

            // Asignar los valores a los campos correspondientes
            profesion.value = datosProfesional[0].profesion;
            especialidad.value = datosProfesional[0].especialidad;
            matricula.value = datosProfesional[0].matricula;
            domicilio.value = datosProfesional[0].domicilio;
            id_refeps.value = datosProfesional[0].id_refeps;
            caducidad.value = caducidadDate.toISOString().split('T')[0];
        } else {
            console.error('No se encontraron datos del profesional');
        }
    };

    // Validar si hay modificaciones en el form usuario con usuario encontrado y usuarioValidado(generado con el form)
    const booleanModificarUsuario = (usuario, usuarioValidado) => {
        let modificar = false;

        // agregar id de usuario original al buscar documento
        usuarioValidado.id = usuario.id;

        if (usuario.nombre !== usuarioValidado.nombre) {
            modificar = true;
        }
        if (usuario.apellido !== usuarioValidado.apellido) {
            modificar = true;
        }
        if (usuario.documento !== usuarioValidado.documento) {
            validarUsuarioDocumento = true;
            modificar = true;
        }
        if (usuario.email !== usuarioValidado.email) {
            validarUsuarioEmail = true;
            modificar = true;
        }
        if (usuario.estado !== usuarioValidado.estado) {
            modificar = true;
        }

        if (modificar) {
            usuarioValidado.modificar = true;
        }

        return modificar;

    }

    // Validar si hay modificaciones en el form datos profesional con el profesional encontrado original
    const booleanModificarProfesional = (profesional, profesionalValidado) => {

        let modificar = false;
        if (profesional[0].profesion !== profesionalValidado.profesion) {
            modificar = true;
        }
        if (profesional[0].especialidad !== profesionalValidado.especialidad) {
            modificar = true;
        }
        if (profesional[0].matricula !== profesionalValidado.matricula) {
            validarProfesionalMatricula = true;
            modificar = true;
        }
        if (profesional[0].domicilio !== profesionalValidado.domicilio) {
            modificar = true;
        }
        if (profesional[0].id_refeps !== profesionalValidado.id_refeps) {
            validarProfesionalIdRefeps = true;
            modificar = true;
        }
        if (profesional[0].caducidad !== profesionalValidado.caducidad) {
            modificar = true;
        }

        if (modificar) {
            profesionalValidado.modificar = true;
        }
        return modificar;
    }

    function compararRoles(role1, role2) {
        return JSON.stringify(role1) === JSON.stringify(role2);
    }

    function booleanModificarRoles(rolesOriginales, rolesAsignados) {
        let modificar = false;
        let profesionalDeshabilitar = false;

        // Crear sets para los roles originales y asignados
        let setRolesOriginales = new Set(rolesOriginales.map(role => JSON.stringify(role)));
        let setRolesAsignados = new Set(rolesAsignados.map(role => JSON.stringify(role)));

        // Verificar roles nuevos en rolesAsignados
        for (let role of rolesAsignados) {
            if (!setRolesOriginales.has(JSON.stringify(role))) {
                modificar = true;
                break; // Salimos del bucle si encontramos un rol nuevo
            }
        }

        // Verificar roles eliminados en rolesOriginales
        for (let role of rolesOriginales) {
            if (!setRolesAsignados.has(JSON.stringify(role))) {
                modificar = true;
                // Si el rol eliminado es 'PROFESIONAL', deshabilitar en la base de datos
                if (role.rol_descripcion === 'PROFESIONAL') {
                    profesionalDeshabilitar = true;
                }
                break; // Salimos del bucle si encontramos un rol eliminado
            }
        }


        // Si se debe deshabilitar el rol 'PROFESIONAL'
        if (profesionalDeshabilitar) {
            //no es necesario validar profesional ya que se va a deshabilitar, enviar datos anteriores como profesional
            profesionalValidado = datosProfesional;
            profesionalValidado.modificar = 'deshabilitar';
            validarProfesionalIdRefeps = false;
            validarProfesionalMatricula = false;
        }

        return modificar;

    }

    //BUSCAR DOCUMENTO SI ENCUENTRA AL USUARIO TRAE SUS DATOS CON SUS ROLES ASIGNADOS, SI ES PROFESIONAL CARGA DATOS PROFESIONAL
    btnBuscarDocumento.addEventListener('click', async () => {

        const buscarDocumento = documentoInput.value.trim();

        if (!/^\d{6,12}$/.test(buscarDocumento)) {
            mostrarMsjCliente('Dato incorrecto', ['El documento debe tener entre 6 y 12 números y no puede estar vacío.']);
            return;
        }

        try {
            // USUARIO
            usuario = await fetchJson(`/buscarUsuario/${buscarDocumento}`);
            // Si el usuario no es encontrado el try pasa al catch para mostrar un msj al usuario

            // USUARIO ENCONTRADO
            // MOSTRAR DATOS
            mostrarDatosUsuario(usuario);

            // ROLES DEL USUARIO
            // array con roles del usuario en la base de datos
            rolesOriginales = await buscarRolesUsuario(usuario.id);

            rolesAsignados = rolesOriginales;

            // mostrar array con rolesAsignados
            mostrarRolesAsignados(rolesAsignados);

            // ROLES DISPONIBLES EN LA BASE DE datosContenedor(TODOS)
            rolesDisponibles = await obtenerRoles();

            //MOSTRAR ROLES DISPONIBLES EN LA BASE( FILTRA LOS QUE ESTAN ASIGNADOR AL USUARIO PARA NO REPETIRLOS) 
            cargarSelectRoles();

            //VERIFICAR SI EN ROLES ASIGNADOS EXISTE PROFESIONAL, SI ES ASI: TRAER DATOS TABLA PROFESIONAL Y MOSTRARLOS
            datosProfesional = await buscarDatosProfesional(usuario.id);


            if (rolesAsignados.some(rol => rol.rol_descripcion === 'PROFESIONAL')) {

                // BUSCAR DATOS PROFESIONAL 
                // datosProfesional = await buscarDatosProfesional(usuario.id);
                mostrarDatosProfesional(datosProfesional);
                //Cambiar estado a 1 en tabla profesional
                datosProfesional[0].modificar = false;
            } else {
                // ocultar div por si en la busqueda anterior habia rol profesional 
                divDatosModificarRolProfesional.classList.add('displayNone');
            }

        } catch (error) {
            //console.error(error);
            // si el documento no esta registrado(usuario inexistente)
            mostrarMsjCliente('Usuario no encontrado', [error.message]);
            //mostrarMsjCliente('Error', ['Error al buscar el usuario o roles.']);
        }
    });


    // ASIGNAR ROL elimina el rol del array rolesDisponibles y lo carga en rolesAsignados
    btnAsignarRol.addEventListener('click', asignarRol);

    // BOTON MODIFICAR USUARIO: se realizan varias tareas ...
    // validarUsuario crea un usuario con los datos del form, para compararlo con los datos del usuario encontrado por el documento
    // validarProfesional(cuando usuario tiene el rol profesional) crea un profesional con los datos del form, para compararlo con los datos del profesional encontrado
    //validarRoles compara rolAsignados con el array roles que contiene los roles originales en la consulta del usuario en la base de datos
    // si en alguno se encuentran modificaciones, se validan y envian a la base
    btnModificarUsuario.addEventListener('click', async () => {
        // validar datos en datos para usuario
        usuarioValidado = validarUsuario();

        // si tiene lenght: retorno un array con msjs de error,los msjs son mostrados en validarUsuario()
        if (usuarioValidado.length) {
            return
        }
        //Si el usuario es validado: verificar si hay cambios en el form actual con los datos obtenidos del usuario en la base de datos
        let modificarUsuario = booleanModificarUsuario(usuario, usuarioValidado);

        //verificar roles del form con los originales del usuario en la base de datos
        let modificarRoles = booleanModificarRoles(rolesOriginales, rolesAsignados);

        // VALIDAR SI ESTA ASIGNADO EL ROL 'PROFESIONAL' 
        let modificarProfesional;

        rolesAsignados.forEach(element => {
            if (element.rol_descripcion === 'PROFESIONAL') {
                // Si tiene lenght es porque estaba cargado como profesional cuando buscamos el documento
                //verificar si hay modificaciones en los datos del form profesional respecto al original de la base(datosProfesional[0])
                if (datosProfesional.length) {
                    // validar form profesional
                    profesionalValidado = validarProfesional();

                    // Si tiene lenght retorno un array con msjs de error, los msjs son mostrados en validarProfesional()
                    if (profesionalValidado.length) {
                        msjs = profesionalValidado;
                    } else {
                        // verificar cambios entre profesional original y el del form actual
                        modificarProfesional = booleanModificarProfesional(datosProfesional, profesionalValidado);
                    }

                } else {
                    //El rol profesional es nuevo no hay datos anteriores para modificar
                    //Agregar relacion con el rol y datos del profesional en tabla profesional
                    //Validar formulario profesional
                    profesionalValidado = validarProfesional();
                    //En este caso se crea un profesional nuevo , no se habilita uno desactivado.
                    //Agrego propiedad crear : true para el controlador.
                    profesionalValidado.crear = true;

                    // Si tiene lenght retorno un array con msjs de error, los msjs son mostrados en validarProfesional()
                    if (profesionalValidado.length) {
                        msjs = profesionalValidado;
                    }
                }
            }
        });


        // ANTES DE REALIZAR EL FETCH VALIDAR SI HAY ALGUNA MODIFICACION
        // Verificar si hay cambios para enviar al controlador
        if (!modificarUsuario && !modificarRoles && !modificarProfesional) {
            mostrarMsjCliente('Usuario sin modificaciones',['No se encontraron cambios para realizar al usuario.']);
            return;
        }

        // FETCH AL CONTROLADOR
        // si no hay msjs de error realizar fetch al controlador con roles, usuario, profesional y booleanos para indicar que tareas realizar
        // siempre se envia lo mismo con contenido o por ej profesional puede ser undefined para algunos usuarios
        if (!msjs.length) {

            const data = {
                //datos del form usuario
                usuarioValidado,
                //array con roles actuales en la base
                rolesOriginales,
                //array con los roles asignados en el front
                rolesAsignados,
                //boolean para indicar si hay modificaciones para los roles respecto a los originales
                modificarRoles,
                //datos del form profesional
                profesionalValidado,
                //booleanos para validar o no, datos unicos en la base
                validarUsuarioDocumento,
                validarUsuarioEmail,
                validarProfesionalMatricula,
                validarProfesionalIdRefeps
            }

            try {
                const response = await fetch('/modificarUsuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    console.log("error modificar usuario ");
                }

                const responseData = await response.json();
                if (response.ok) {
                    limpiarDivRoles();
                    limpiarUsuario();
                    limpiarProfesional();
                    reiniciarVariablesGlobales();
                    mostrarMsjCliente('Usuario Modificado', [responseData.message]);
                }
                if (responseData.error) {
                    limpiarDivRoles();
                    limpiarUsuario();
                    limpiarProfesional();
                    reiniciarVariablesGlobales();
                    mostrarMsjCliente('Dato incorrecto', [responseData.message]);
                }


            } catch (error) {
                limpiarDivRoles();
                limpiarUsuario();
                limpiarProfesional();
                reiniciarVariablesGlobales();
                console.error('Error:', error);
            }
        } else {
            return;
        }
    });

});