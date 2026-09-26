// ===== 1) Referencias a elementos del HTML =====
const buscador = document.getElementById('buscador');
const contador = document.getElementById('contador');
const resultados = document.getElementById('resultados');

// ===== 2) Aquí van a vivir los datos una vez que lleguen del JSON =====
let estudios = [];

// ===== 3) Traer los datos de estudios.json =====
fetch('estudios.json')
  .then((respuesta) => respuesta.json())
  .then((datos) => {
    estudios = datos;   // ya tenemos los 10 estudios guardados
    pintar([]);         // arranca vacío, esperando que el usuario busque algo
  })
  .catch((error) => {
    console.error('No se pudo cargar estudios.json:', error);
  });

// ===== 4) Construye el HTML de UN estudio =====
function crearHTML(estudio) {
  return `
    <section class="estudio">
      <h3 class="estudio-titulo">${estudio.titulo}</h3>
      <p class="estudio-tags">${estudio.organismo} · ${estudio.factorEspacial} · ${estudio.mision} · ${estudio.anio}</p>
      <p class="estudio-resumen">${estudio.resumen}</p>
      <p class="estudio-hallazgo"><strong>Hallazgo:</strong> ${estudio.hallazgoPrincipal}</p>
      <a class="estudio-link" href="${estudio.urlFuente}" target="_blank">Ver estudio →</a>
    </section>
  `;
}

// ===== 5) Pinta una lista de estudios dentro del contenedor =====
function pintar(lista) {
  resultados.innerHTML = lista.map(crearHTML).join('');

  if (lista.length === 0) {
    contador.textContent = '';
  } else {
    contador.textContent = `${lista.length} estudios encontrados`;
  }
}

// ===== 6) Filtra según lo que se escribe, buscando en palabrasClave =====
function filtrar() {
  const texto = buscador.value.toLowerCase().trim();

  if (texto === '') {
    pintar([]);
    return;
  }

  const coincidencias = estudios.filter((estudio) =>
    estudio.palabrasClave.some((palabra) => palabra.toLowerCase().includes(texto))
  );

  pintar(coincidencias);
}

// ===== 7) Conectar el evento del buscador =====
buscador.addEventListener('input', filtrar);