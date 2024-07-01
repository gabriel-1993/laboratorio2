import Rol from '../models/rolModel.js';




const obtenerTodos = async (req, res) => {
    try {
        const roles = await Rol.obtenerTodos();
        res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
}




export default {
    obtenerTodos
};



