// CONTROLADOR — el intermediario. Recibe la petición, le pide los datos al
// modelo y decide qué vista mostrar. No sabe de dónde salen los datos ni
// cómo se ve el HTML: solo coordina las dos cosas.

import * as modelo from '../modelos/pokedex.js';

// Primera letra en mayúscula: "fuego" -> "Fuego" (lo usaba ficha.js).
function mayus(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// -------- GET /  ->  la lista (reemplaza index.html) --------
export function listar(peticion, respuesta) {
  // Leemos los filtros de la query string (/?nombre=...&tipo=...).
  const filtros = {
    nombre: peticion.query.nombre ?? '',
    tipo: peticion.query.tipo ?? '',
    orden: peticion.query.orden ?? 'numero-asc',
    soloCapturados: peticion.query['solo-capturados'] === 'si',
    etapa: peticion.query.etapa ?? 'todas',
  };

  const pokemones = modelo.filtrarYOrdenar(filtros);

  respuesta.render('lista', {
    titulo: 'Pokédex - Lista de Pokémon',
    pokemones,
    filtros,                              // para dejar el formulario como estaba
    numeroPokedex: modelo.numeroPokedex,  // helper para las tarjetas
  });
}
// -------- GET /pokemon/7  ->  la ficha (reemplaza detalle.html) --------
export function ver(peticion, respuesta) {
  const id = Number(peticion.params.id);   // el :id de la ruta /pokemon/:id
  const pokemon = modelo.buscarPorId(id);

  // Si no existe ese id, mostramos la página 404 (la misma que para cualquier
  // dirección que no exista).
  if (!pokemon) {
    respuesta.status(404).render('404');
    return;
  }

  // Carrusel: 5 vecinos (dos antes, el actual, dos después), circular.
  const todos = modelo.obtenerTodos();
  const n = todos.length;
  const i = todos.findIndex((x) => x.id === id);
  const vecinos = [];
  for (let k = -2; k <= 2; k++) {
    const vecino = todos[(i + k + n) % n];   // el % da la vuelta (circular)
    vecinos.push({ pokemon: vecino, pos: k, activo: k === 0 });
  }

  // Frase de "cómo se leen las estadísticas", armada con los propios datos.
  const etiquetas = { hp: 'Puntos de Salud', ataque: 'Ataque', defensa: 'Defensa',
    ataqueEsp: 'Ataque Especial', defensaEsp: 'Defensa Especial', velocidad: 'Velocidad' };
  const entradas = Object.entries(pokemon.stats);
  const alta = entradas.reduce((a, b) => (b[1] > a[1] ? b : a));
  const baja = entradas.reduce((a, b) => (b[1] < a[1] ? b : a));
  const lectura = `${pokemon.nombre} destaca en ${etiquetas[alta[0]]} (${alta[1]}) y es débil en en ${etiquetas[baja[0]]} (${baja[1]}).`;

  respuesta.render('detalle', {
    titulo: `Pokédex - ${pokemon.nombre}`,
    pokemon, vecinos, lectura,
    contador: n + ' Pokémon',
    mayus,
    numeroPokedex: modelo.numeroPokedex,
    totalStats: modelo.totalStats,
  });
}

// -------- GET /agregar  ->  el formulario, en su propia página --------
export function formularioNuevo(peticion, respuesta) {
  respuesta.render('agregar', { titulo: 'Pokédex - Agregar un Pokémon' });
}

// -------- POST /pokemon  ->  agrega uno y vuelve a la lista --------
export function crear(peticion, respuesta) {
  const nombre = (peticion.body.nombre || '').trim();
  // Armamos el objeto con lo del formulario y valores por defecto para el resto,
  // para que la ficha del nuevo no se rompa (stats en cero, sin habilidades, etc.).
  const nuevo = {
    id: Number(peticion.body.id),
    nombre,
    slug: (peticion.body.slug || nombre).toLowerCase(),
    tipos: (peticion.body.tipos || '').split(',').map((t) => t.trim()).filter(Boolean),
    peso: Number(peticion.body.peso) || 0,
    tamano: Number(peticion.body.tamano) || 0,
    stats: { hp: 0, ataque: 0, defensa: 0, ataqueEsp: 0, defensaEsp: 0, velocidad: 0 },
    habilidades: [],
    evolucion: [nombre],
    etapa: 'inicial',
    capturado: false,
    genus: peticion.body.genus || '',
    descripcion: peticion.body.descripcion || '',
  };
  modelo.agregar(nuevo);
  respuesta.redirect('/');   // patrón "POST y redirigir"
}
