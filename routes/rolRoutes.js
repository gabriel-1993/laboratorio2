import express from 'express';
import rolController from '../controllers/rolController.js';

const router = express.Router();




//utilizo ruta de rolRoutes para cargar Select Roles
router.get('/obtenerRoles', rolController.obtenerTodos);





export default router;