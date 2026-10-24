// =============================================================
//  RUTAS — el mapa: cada método + dirección va a una función del controlador.
//  Se montan en "/" (ver servidor.js), así estas direcciones son las del sitio.
// =============================================================
import express from 'express';
import * as controlador from '../controladores/pokemonControlador.js';

const router = express.Router();

router.get('/', controlador.listar);                 // la lista
router.get('/pokemon/:id', controlador.ver);         // la ficha, con URL limpia: /pokemon/7
router.get('/agregar', controlador.formularioNuevo); // el formulario, en página aparte
router.post('/pokemon', controlador.crear);          // crea y redirige a la lista

// El perfil ahora también es una plantilla. No tiene datos del servidor
// (lo capturado lo llena perfil-entrenador.js en el navegador), así que
// solo se renderiza la vista.
router.get('/perfil-entrenador', (peticion, respuesta) => respuesta.render('perfil-entrenador'));

export default router;
