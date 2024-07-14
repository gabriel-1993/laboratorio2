// routes/taskRoutes.js
import express from 'express';
import usuarioController from '../controllers/usuarioController.js';
import rolController from '../controllers/rolController.js';
import profesionalController from '../controllers/profesionalController.js';
const router = express.Router();

router.get("/", usuarioController.mostrarFormLogin);


// Ruta para iniciar sesión (POST) user y pass servidor
router.post('/login', usuarioController.login);
// Ruta para cerrar sesión
router.get('/logout', usuarioController.cerrarSesion);
// Rutas para Renerizar distintos roles
router.get('/indexAdmin', usuarioController.mostrarIndexAdmin);
router.get('/indexProf', usuarioController.mostrarIndexProf);
router.get('/selectRol', usuarioController.mostrarSelectRol);




// RESTABLECER CONTRASEÑA
// Ruta para mostrar el formulario de restablecimiento de contraseña
router.get('/restablecer-password', usuarioController.mostrarFormRestablecerPass);
// Ruta para enviar el enlace de recuperación de contraseña
router.post('/restablecer-password', usuarioController.enviarEnlaceRecuperacion);
// Ruta para renderizar el formulario de actualización de contraseña
router.get('/restablecer-password/:token', usuarioController.renderRestablecerPassword);
// Ruta para actualizar la contraseña
router.post('/restablecer-password/:token', usuarioController.actualizarPassword);

// CRUD USUARIO
// CREAR: Mostrar form para user nuevo
router.get('/crearUsuario', usuarioController.mostrarFormCrearUsuario);
//ruta de rolRoutes para cargar Select en el form con los Roles disponibles
router.get('/obtenerRoles', rolController.obtenerTodos);
// Crear usuario mediante Transacciones: asigna tambien su rol/es. Si es asignado rol profesional: carga datos profesional 
 router.post('/crearUsuario', usuarioController.crearUsuarioCompleto);

//MODIFICAR:
 router.get('/modificarUsuario', usuarioController.mostrarFormModificarUsuario);
 router.get('/buscarUsuario/:documento', usuarioController.buscarUsuarioDocumento);
 router.get('/buscarRolesUsuario/:usuario_id', usuarioController.buscarRolesUsuario);
 router.get('/buscarDatosProfesional/:usuario_id', profesionalController.obtenerDatosProfesional);
 //enviar datos del usuario en el front al controlador
 router.post('/modificarUsuario', usuarioController.modificarUsuarioCompleto);

//BUSCAR/VISUALIZAR USUARIOS
router.get('/mostrarFormBuscarUsuarios', usuarioController.mostrarFormBuscarUsuarios);
router.get('/buscarUsuarios', usuarioController.buscarUsuarios);
//reutilizo las rutas de modificar usuario para obtener datos para los roles (profesional)
router.get('/buscarRolesUsuario/:usuario_id', usuarioController.buscarRolesUsuario);
router.get('/buscarDatosProfesional/:usuario_id', profesionalController.obtenerDatosProfesional);




export default router;