// MODELO — es el dueño de los datos. Nadie más toca el arreglo directamente:
// si mañana esto fuera una base de datos, solo cambiaría este archivo y el
// resto de la app (controlador, vistas) ni se enteraría.
import { pokedex, buscarPorId, numeroPokedex, totalStats } from '../public/js/datos.js';
// Re-exportamos lo que las vistas van a necesitar, para pedirlo todo al modelo.
export { pokedex, buscarPorId, numeroPokedex, totalStats };

export function obtenerTodos() {
  return pokedex;
}

// Quita acentos y pasa a minúscula (igual que hacía lista.js en el navegador).
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Filtrar y ordenar con los criterios del formulario de búsqueda.
// Antes esto lo hacía el navegador (lista.js); ahora lo hace el servidor
// leyendo la query string (?nombre=...&tipo=...).
export function filtrarYOrdenar({ nombre = '', tipo = '', orden = 'numero-asc', soloCapturados = false, etapa = 'todas' } = {}) {
  let resultado = pokedex.filter((p) => {
    if (nombre && !normalizar(p.nombre).includes(normalizar(nombre))) return false;
    if (tipo && !p.tipos.map(normalizar).includes(normalizar(tipo))) return false;
    if (soloCapturados && !p.capturado) return false;
    if (etapa !== 'todas' && p.etapa !== etapa) return false;
    return true;
  });

  const ordenadores = {
    'numero-asc': (a, b) => a.id - b.id,
    'numero-desc': (a, b) => b.id - a.id,
    'nombre-asc': (a, b) => a.nombre.localeCompare(b.nombre),
    'nombre-desc': (a, b) => b.nombre.localeCompare(a.nombre),
    'tamano-desc': (a, b) => b.tamano - a.tamano,
    'tamano-asc': (a, b) => a.tamano - b.tamano,
  };
  return [...resultado].sort(ordenadores[orden] ?? ordenadores['numero-asc']);
}

export function agregar(pokemon) {
  pokedex.push(pokemon);
  return pokemon;
}

