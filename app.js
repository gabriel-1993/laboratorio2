//  averiguar en la guia de npm cada uno :
//  express: es un framework para construir aplicaciones web y APIs en Node.js. Creacion y gestion de servidores web.
import express from "express";

//  path: módulo nativo de Node.js. Ayuda a manejar y transformar rutas de archivos y 
//directorios. Es útil para trabajar con rutas de archivos de manera más sencilla y segura.(routes)
import path from "path";
import { fileURLToPath } from 'url';

//Cuando usas el middleware cors, lo que haces es configurar tu servidor para que permita o restrinja 
//solicitudes de diferentes orígenes. 
import cors from "cors";

//middleware helmet, que se utiliza para mejorar la seguridad de la aplicación web. helmet añade varios 
//encabezados HTTP que protegen tu aplicación de algunas vulnerabilidades comunes en la web.
import helmet from "helmet";

//middleware morgan, que se utiliza para el registro de solicitudes HTTP. morgan te permite ver en la consola 
//detalles de cada petición que llega a tu servidor, como el método, la URL, el estado de la respuesta, etc.
import morgan from "morgan";

//session-rol(login)
import session from 'express-session';
import pool from './database.js';

//variables de entorno para restablecer contraseña : datos del correo que envia el email
import dotenv from 'dotenv';
dotenv.config();

//ADMINISTRADOR
import errorRoutes from "./routes/errorRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import medicamentoRoutes from "./routes/medicamentoRoutes.js";
import prestacionRoutes from "./routes/prestacionRoutes.js";
import obraSocialRoutes from "./routes/obraSocialRoutes.js";
//PROFESIONAL
import pacienteRoutes from "./routes/pacienteRoutes.js";
import prescripcionRoutes from "./routes/prescripcionRoutes.js";


//fileURLToPath convierte una URL de archivo (file://) en una ruta de archivo del sistema de archivos que puede ser utilizada por Node.js.
//convierte la URL file:///C:/Users/Gabriel/Desktop/proyecto/app.js en una ruta del sistema de archivos, C:\Users\Gabriel\Desktop\proyecto\app.js
const __filename = fileURLToPath(import.meta.url);
// Obtiene el directorio del archivo actual
const __dirname = path.dirname(__filename);




const app = express();
const port = 3000;

// Configuración de la sesión con MySQL
// Importar `express-mysql-session` dinámicamente
let MySQLStore;
(async () => {
  const module = await import('express-mysql-session');
  MySQLStore = module.default(session);

  // Configuración de la sesión con MySQL
  const sessionStore = new MySQLStore({}, pool);

  app.use(session({
    key: 'session_cookie_name',
    secret: 'your_session_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hora
  }));




  // Middlewars :
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));

  // Configurar PUG
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // configurar carpeta Public y archivos staticos: CSS, imagenes, etc
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));


  // Manejo de rutas
  //ADMINISTRADOR
  app.use("/", usuarioRoutes);
  app.use("/", medicamentoRoutes);
  app.use("/", prestacionRoutes);
  app.use("/", obraSocialRoutes)
  //PROFESIONAL
  app.use("/", pacienteRoutes);
  //PRESCRIPCION
  app.use("/", prescripcionRoutes);



  app.use(errorRoutes);




  app.listen(port, () => {
    console.log(`Servidor escuchando el puerto ${port}`);
  });


})(); // Fin de (async () => {

export default app;
