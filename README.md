SISA Sistema integrado de Informacion Sanitaria Argentino
#JAVASCRIPT #NODE #PUG #CSS #MYSQL (MVC / CRUD)
 
usuarios :
 12345780  (rol:profesional)
 36018434  (rol:administrador) 
 12345678  (rol:profesional/administrador)
 123456789 (rol:profesional/administrador) (profesional caducado solo podra ejecutar admin)
 
 passwords: 12345

pacientes: 13721055 , 40000008 , 1234567 , 36018435 , 20456456 

Buenas noches copie algunos datos para poder probar la app, esta exportada la base de datos(MySQL) junto con una captura del diseño.

Usuario puede tener uno o muchos roles , pero ejecutar de a uno. Rol:Profesional tiene varias atributos en su propia tabla como caducidad que es verificada en el login.

Login: Pass con hash, session para evitar forzar rutas sin logearse.

Restablecer contraseña:Envia un enlace solo al correo ingresado en usuario, variables de entorno para ocultar datos del gmail remitente, gmail remitente con verificacion en dos pasos y contraseña para la app para evitar errores con google.
Para el enlace se crea un token en la tabla password_resets con 60 minutos de caducidad, al utilizarla es eliminada.

Validaciones en front/back, estructura con MVC, front para mostrar mensajes de usuario.

Administrador puede realizar CRUD de usuarios, medicamentos, prestaciones(estudios/examenes) y obras sociales.
Profesional puede realizar CRUD de prescripciones(recetas), y pacientes.


 
