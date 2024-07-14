import { mostrarMsjCliente } from './mostrarMsjCliente.js';

document.addEventListener("DOMContentLoaded", async function () {

  // input para buscar usuario
  const buscarDocumento = document.querySelector('#buscarDocumento');
  //btn lupa buscar
  const btnBuscarDocumento = document.querySelector('.btnBuscarDocumento');

  // contenedor de buscar usuario especifico
  const divBuscarUsuarios = document.querySelector('.divBuscarUsuarios');
  //div contenedor oculto (.displayNone) para mostrar datos de un usuario especifico con roles y si existen datos profesional
  const divFlexRow = document.querySelector('.divFlexRow');

  //inputs datos usuario 
  const nombre = document.querySelector('#nombre');
  const apellido = document.querySelector('#apellido');
  const documento = document.querySelector('#documento');
  const email = document.querySelector('#email');
  const estado = document.querySelector('#estado');


  //div contenedor para mostrar los roles de un usuario especifico
  const divRolAsignado = document.querySelector('.divRolesAsignados');
  const ulRolesAsignados = document.querySelector('.ulRolesAsignados');

  //datos profesional
  const divBuscarDatosRolProfesional = document.querySelector('.divBuscarDatosRolProfesional');
  const profesion = document.querySelector('#profesion');
  const especialidad = document.querySelector('#especialidad');
  const matricula = document.querySelector('#matricula');
  const idRefeps = document.querySelector('#idRefeps');
  const caducidad = document.querySelector('#caducidad');
  const domicilio = document.querySelector('#domicilio');

  async function obtenerUsuarios() {
    try {
      const response = await fetch('/buscarUsuarios');

      if (!response.ok) {
        throw new Error(`Error al buscar usuarios: ${response.statusText}`);
      }

      const usuarios = await response.json();

      // Agregar roles y datos profesionales a cada usuario
      await Promise.all(usuarios.map(async usuario => {
        usuario.roles = await obtenerRolesUsuario(usuario.id);
        const profesionalRol = usuario.roles.find(rol => rol.rol_descripcion === 'PROFESIONAL');
        if (profesionalRol) {
          usuario.datosProfesional = await obtenerDatosProfesional(usuario.id);
        }
      }));

      return usuarios;
      // Aquí puedes hacer algo con los datos de los usuarios, como mostrarlos en el DOM
    } catch (error) {
      console.error('Error:', error);
      // Maneja el error adecuadamente, como mostrar un mensaje de error en el DOM
    }
  }

  async function obtenerRolesUsuario(usuarioId) {
    try {
      const response = await fetch(`/buscarRolesUsuario/${usuarioId}`);

      if (!response.ok) {
        throw new Error(`Error al buscar roles del usuario: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      // Maneja el error adecuadamente
      return [];
    }
  }

  async function obtenerDatosProfesional(usuarioId) {
    try {
      const response = await fetch(`/buscarDatosProfesional/${usuarioId}`);

      if (!response.ok) {
        throw new Error(`Error al obtener datos profesionales: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      // Maneja el error adecuadamente
      return null;
    }
  }

  function mostrarUsuarios(usuarios) {
    const divMostrarUsuariosTodos = document.querySelector('.divMostrarUsuariosTodos');
    const divContenedorCardsUsuarios = document.querySelector('.divContenedorCardsUsuarios');

    usuarios.forEach(usuario => {
      const cardUsuario = document.createElement('div');
      cardUsuario.classList.add('cardUsuario');
      const h4Usuario = document.createElement('h4');
      h4Usuario.classList.add('text-fondoAzul');
      h4Usuario.classList.add('borderRadiusTop5px');
      h4Usuario.innerHTML = 'Datos Usuario';
      cardUsuario.appendChild(h4Usuario);

      // Primera fila: Datos del usuario
      const divDatosUsuario = document.createElement('div');
      divDatosUsuario.classList.add('datosUsuario');
      divDatosUsuario.style.display = 'flex';
      divDatosUsuario.style.flexDirection = 'row';

      const nombreDiv = crearCampoUsuario('Nombre', usuario.nombre);
      const apellidoDiv = crearCampoUsuario('Apellido', usuario.apellido);
      const documentoDiv = crearCampoUsuario('Documento', usuario.documento);
      const emailDiv = crearCampoUsuario('Email', usuario.email);

      divDatosUsuario.appendChild(nombreDiv);
      divDatosUsuario.appendChild(apellidoDiv);
      divDatosUsuario.appendChild(documentoDiv);
      divDatosUsuario.appendChild(emailDiv);

      cardUsuario.appendChild(divDatosUsuario);

      // Segunda fila: Roles del usuario
      const divRolesUsuario = document.createElement('div');
      divRolesUsuario.classList.add('rolesUsuario');

      const rolesLabel = document.createElement('label');
      rolesLabel.classList.add('labelCenter');
      rolesLabel.classList.add('labelCenter90px');
      rolesLabel.textContent = 'Roles: ';
      divRolesUsuario.appendChild(rolesLabel);

      const rolesInput = document.createElement('input');
      rolesInput.type = 'text';
      rolesInput.value = usuario.roles.map(rol => rol.rol_descripcion).join(', ');
      rolesInput.readOnly = true;
      rolesInput.style.width = 'auto';
      divRolesUsuario.appendChild(rolesInput);

      cardUsuario.appendChild(divRolesUsuario);

      // Tercera fila: Datos profesionales (si aplica)
      if (usuario.roles.some(rol => rol.rol_descripcion === 'PROFESIONAL') && usuario.datosProfesional) {
        const divDatosProfesional = document.createElement('div');
        divDatosProfesional.classList.add('datosProfesional');

        usuario.datosProfesional.forEach(dato => {
          const profesionDiv = crearCampoUsuario('Profesión', dato.profesion);
          const especialidadDiv = crearCampoUsuario('Especialidad', dato.especialidad);
          const matriculaDiv = crearCampoUsuario('Matrícula', dato.matricula);
          const domicilioDiv = crearCampoUsuario('Domicilio', dato.domicilio);

          divDatosProfesional.appendChild(profesionDiv);
          divDatosProfesional.appendChild(especialidadDiv);
          divDatosProfesional.appendChild(matriculaDiv);
          divDatosProfesional.appendChild(domicilioDiv);
        });

        cardUsuario.appendChild(divDatosProfesional);
      }

      divContenedorCardsUsuarios.appendChild(cardUsuario);
    });

    divMostrarUsuariosTodos.appendChild(divContenedorCardsUsuarios);
  }

  function crearCampoUsuario(labelText, inputValue) {
    const divCampo = document.createElement('div');
    divCampo.style.display = 'flex';
    divCampo.style.flexDirection = 'row';

    const label = document.createElement('label');
    label.classList.add('labelCenter');
    label.classList.add('labelCenter90px');

    const input = document.createElement('input');
    if (labelText === 'Email') {
      input.classList.add('inputEmail');
    }

    if (labelText === 'Domicilio') {
      input.classList.add('inputDomicilio');
    }
    label.textContent = labelText + ' ';
    input.value = inputValue;
    input.readOnly = true;  // Opcional, si no quieres que los campos sean editables

    divCampo.appendChild(label);
    divCampo.appendChild(input);

    return divCampo;
  }






  // Llama a la función para obtener los usuarios con sus datos de la base de datos
  const usuarios = await obtenerUsuarios();
  // RENDERIZAR ARRAY DE USUARIOS en lista de usuarios
  mostrarUsuarios(usuarios);


// BUSCAR DOCUMENTO EN LISTA USUARIOS Y MOSTRAR SUS DATOS
  function filtrarUsuario() {

    const Buscardocumento = buscarDocumento.value.trim();

    if (!/^\d{6,12}$/.test(Buscardocumento)) {
      mostrarMsjCliente('Dato incorrecto', ['El documento debe tener entre 6 y 12 números y no puede estar vacío.']);
      return;
  }

    // Encuentra el usuario cuyo documento coincide con el valor ingresado
    const usuarioEncontrado = usuarios.find(usuario => usuario.documento === Buscardocumento);


    // Si se encuentra el usuario, mostrar sus datos
    if (usuarioEncontrado) {
      divFlexRow.classList.remove('displayNone');
      nombre.value = '';
      nombre.value = usuarioEncontrado.nombre;

      apellido.value = '';
      apellido.value = usuarioEncontrado.apellido;

      documento.value = '';
      documento.value = usuarioEncontrado.documento;

      email.value = '';
      email.value = usuarioEncontrado.email;

      estado.value = '';
      if (usuarioEncontrado.estado === 1) {
        estado.value = 'ACTIVO'
      } else if (usuarioEncontrado.estado === 0) {
        estado.value = 'INACTIVO'
      }


      const rolesAsignados = usuarioEncontrado.roles;
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

        ulRolesAsignados.appendChild(li);

        if (rol.rol_descripcion === 'PROFESIONAL') {
          divBuscarDatosRolProfesional.classList.remove('displayNone');
          divBuscarUsuarios.style.width = "auto";
          profesion.value = usuarioEncontrado.datosProfesional[0].profesion;
          especialidad.value = usuarioEncontrado.datosProfesional[0].especialidad;
          matricula.value = usuarioEncontrado.datosProfesional[0].matricula;
          idRefeps.value = usuarioEncontrado.datosProfesional[0].id_refeps;
          domicilio.value = usuarioEncontrado.datosProfesional[0].domicilio;

          // Parsear caducidad para el input date
          const fechaCaducidad = new Date(usuarioEncontrado.datosProfesional[0].caducidad);
          // Convertir la fecha al formato 'YYYY-MM-DD'
          const fechaCaducidadFormato = fechaCaducidad.toISOString().split('T')[0];
          // Asignar la fecha al input de tipo date
          caducidad.value = fechaCaducidadFormato;
        }
      });

      // Añadir la lista de roles al contenedor
      divRolAsignado.appendChild(ulRolesAsignados);





    }
  }
  btnBuscarDocumento.addEventListener('click', filtrarUsuario);

});
