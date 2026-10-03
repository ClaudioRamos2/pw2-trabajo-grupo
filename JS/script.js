document.addEventListener('DOMContentLoaded', () => {
  // ----- Menú hamburguesa -----
  const hmbButton = document.querySelector('header .hmb-button');
  const nav = document.querySelector('header nav');

  if (hmbButton && nav) {
    hmbButton.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    // Cierra el menú al tocar un enlace
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) nav.classList.remove('active');
    });
  }

  // ----- Buscador -----
  const buscador = document.getElementById('buscador');
  const contador = document.getElementById('contador');
  const resultados = document.getElementById('resultados');

  let estudios = [];

  // Quita tildes y pasa a minúsculas ("radiacion" encuentra "radiación")
  function normalizar(texto) {
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  fetch('data/estudios.json')
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      return respuesta.json();
    })
    .then((datos) => {
      estudios = datos;
      pintar([]);
    })
    .catch((error) => {
      console.error('No se pudo cargar estudios.json:', error);
      contador.textContent = 'No se pudieron cargar los datos.';
    });

  function crearHTML(estudio) {
    return `
      <section class="estudio">
        <h3 class="estudio-titulo">${estudio.titulo}</h3>
        <p class="estudio-tags">${estudio.organismo} · ${estudio.factorEspacial} · ${estudio.mision} · ${estudio.anio}</p>
        <p class="estudio-resumen">${estudio.resumen}</p>
        <p class="estudio-hallazgo"><strong>Hallazgo:</strong> ${estudio.hallazgoPrincipal}</p>
        <a class="estudio-link" href="${estudio.urlFuente}" target="_blank" rel="noopener">Ver estudio →</a>
        <img class="estudio-imagen" src="${estudio.imagen}" alt="${estudio.titulo}"
             loading="lazy" onerror="this.style.display='none'">
      </section>
    `;
  }

  function pintar(lista, texto = '') {
    resultados.innerHTML = lista.map(crearHTML).join('');

    if (texto === '') {
      contador.textContent = '';
    } else if (lista.length === 0) {
      contador.textContent = `No se encontraron estudios para "${texto}".`;
    } else {
      contador.textContent = `${lista.length} estudios encontrados`;
    }
  }

  function filtrar() {
    const texto = buscador.value.trim();

    if (texto === '') {
      pintar([]);
      return;
    }

    const terminos = normalizar(texto).split(/\s+/).filter(Boolean);

    // Cada palabra escrita debe coincidir con alguna palabra clave
    const coincidencias = estudios.filter((estudio) =>
      terminos.every((t) =>
        estudio.palabrasClave.some((palabra) => normalizar(palabra).includes(t))
      )
    );

    pintar(coincidencias, texto);
  }

  buscador.addEventListener('input', filtrar);
});