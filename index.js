// --- 1. SELECCIÓN DE ELEMENTOS ---
const $ = (id) => document.getElementById(id); // Función helper corta

// Variables de la única tarjeta
const tarjetaPokemonEl = $("pokemonCard");
const tituloTarjetaEl = $("cardTitle");
const nombreResultadoEl = $("result_name");
const imagenResultadoEl = $("result_img");
const pokemonIdEl = $("pokemonId");
const pokemonWeightEl = $("pokemonWeight");
const pokemonHeightEl = $("pokemonHeight");
const pokemonAbilitiesEl = $("pokemonAbilities");

// Variables del buscador
const inputBuscar = $("inputPokemon");
const botonBuscar = $("btnBuscar");
const mensajeEstadoEl = $("statusMessage");

// --- 2. FUNCIONES DE PROCESO Y API ---
const obtenerDatosPokemon = async (nameId) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${nameId.toLowerCase()}`;
    const respuesta = await fetch(url);
    
    if (!respuesta.ok) {
        throw new Error("Pokémon no encontrado. ¿Verificaste el nombre?");
    }
    
    return respuesta.json(); // Devuelve los datos en JSON
};

// --- 3. COLOCA EL NOMBRE Y LA IMAGEN EN LA ÚNICA TARJETA ---
const mostrarPokemonEnTarjeta = (datos) => {
    tituloTarjetaEl.textContent = "¡Pokémon Encontrado!";
    nombreResultadoEl.textContent = datos.name;
    
    // Mostrar imagen (priorizando dream_world, con fallback)
    imagenResultadoEl.src = datos.sprites.other?.dream_world?.front_default || 
                           datos.sprites.other?.home?.front_default ||
                           datos.sprites.front_default;
    imagenResultadoEl.alt = `Imagen de ${datos.name}`;
    
    // Mostrar información adicional
    pokemonIdEl.textContent = datos.id;
    pokemonWeightEl.textContent = (datos.weight / 10).toFixed(1); // Convertir a kg
    pokemonHeightEl.textContent = (datos.height / 10).toFixed(1); // Convertir a metros
    
    // Mostrar habilidades
    const habilidades = datos.abilities.map(ability => 
        ability.ability.name.replace('-', ' ')
    ).join(', ');
    pokemonAbilitiesEl.textContent = habilidades;
    
    tarjetaPokemonEl.style.display = 'block';
};

// --- 4. FUNCIÓN DE ESTADO (LOADING/ERROR) ---
const actualizarEstadoUI = (cargando, mensaje = '') => {
    if (cargando) {
        botonBuscar.disabled = true;
        botonBuscar.textContent = "Buscando...";
        mensajeEstadoEl.textContent = "Buscando Pokémon...";
        mensajeEstadoEl.className = "message-box";
        tarjetaPokemonEl.classList.add('loading');
    } else {
        botonBuscar.disabled = false;
        botonBuscar.textContent = "Buscar";
        tarjetaPokemonEl.classList.remove('loading');
        
        if (mensaje) {
            mensajeEstadoEl.textContent = mensaje;
            if (mensaje.includes("error") || mensaje.includes("no encontrado")) {
                mensajeEstadoEl.className = "message-box error";
            } else {
                mensajeEstadoEl.className = "message-box success";
            }
        } else {
            mensajeEstadoEl.textContent = "";
        }
    }
};

// --- 5. CARGAR POKÉMON POR DEFECTO ---
const cargarPokemonPorDefecto = async () => {
    actualizarEstadoUI(true);
    try {
        const datos = await obtenerDatosPokemon("pikachu");
        mostrarPokemonEnTarjeta(datos);
        actualizarEstadoUI(false, `¡${datos.name} cargado!`);
    } catch (error) {
        tituloTarjetaEl.textContent = "Error al cargar";
        nombreResultadoEl.textContent = "Intenta recargar la página";
        actualizarEstadoUI(false, error.message);
    }
};

// --- 6. LÓGICA PRINCIPAL DE BÚSQUEDA ---
const buscarPokemon = async () => {
    const nombre = inputBuscar.value.trim();

    if (!nombre) {
        mensajeEstadoEl.textContent = "Debe escribir un nombre para buscar.";
        mensajeEstadoEl.className = "message-box error";
        return;
    }

    // VALIDACIÓN: Bloquea si es un número (ID)
    if (/^\d+$/.test(nombre)) {
        mensajeEstadoEl.textContent = "Búsqueda por ID no permitida. Use el nombre del Pokémon.";
        mensajeEstadoEl.className = "message-box error";
        return;
    }

    actualizarEstadoUI(true);
    tituloTarjetaEl.textContent = "Buscando Pokémon...";

    try {
        const datos = await obtenerDatosPokemon(nombre);
        mostrarPokemonEnTarjeta(datos);
        actualizarEstadoUI(false, `¡${datos.name} encontrado!`);
        inputBuscar.value = ""; // Limpia el input
    } catch (error) {
        tituloTarjetaEl.textContent = "Pokémon No Encontrado";
        nombreResultadoEl.textContent = "No encontrado";
        imagenResultadoEl.src = "";
        imagenResultadoEl.alt = "Pokémon no encontrado";
        actualizarEstadoUI(false, error.message);
    }
};

// --- 7. EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
    cargarPokemonPorDefecto(); // Carga Pikachu al iniciar

    botonBuscar.addEventListener("click", buscarPokemon); // Click en el botón

    inputBuscar.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            buscarPokemon(); // Enter en el input
        }
    });
});