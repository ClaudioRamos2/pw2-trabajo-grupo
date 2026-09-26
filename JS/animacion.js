
const buscador = document.getElementById('buscador');
const contador = document.getElementById('contador');
const resultados = document.getElementById('resultados');

let estudios = [];


fetch('data/estudios.json')
  .then((respuesta) => respuesta.json())
  .then((datos) => {
    estudios = datos;
    pintar([]);
  })
  .catch((error) => {
    console.error('No se pudo cargar estudios.json:', error);
  });


function crearHTML(estudio) {
  return `
    <section class="estudio">
      <h3 class="estudio-titulo">${estudio.titulo}</h3>
      <p class="estudio-tags">${estudio.organismo} · ${estudio.factorEspacial} · ${estudio.mision} · ${estudio.anio}</p>
      <p class="estudio-resumen">${estudio.resumen}</p>
      <p class="estudio-hallazgo"><strong>Hallazgo:</strong> ${estudio.hallazgoPrincipal}</p>
      <a class="estudio-link" href="${estudio.urlFuente}" target="_blank">Ver estudio →</a>
      <img class="estudio-imagen" src="${estudio.imagen}" alt="${estudio.titulo}">
    </section>
  `;
}

function pintar(lista) {
  resultados.innerHTML = lista.map(crearHTML).join('');

  if (lista.length === 0) {
    contador.textContent = '';
  } else {
    contador.textContent = `${lista.length} estudios encontrados`;
  }
}

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

buscador.addEventListener('input', filtrar);