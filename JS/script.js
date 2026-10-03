document.addEventListener('DOMContentLoaded', () => {
  const hmbButton = document.querySelector('header .hmb-button');
  const nav = document.querySelector('header nav');
  const filtros = document.getElementById('filtros');
  const btnLimpiar = document.getElementById('limpiar');
  const buscador = document.getElementById('buscador');
  const contador = document.getElementById('contador');
  const resultados = document.getElementById('resultados');

  // Grupos de checks del menú. Cada uno usa un campo del JSON.
  // Para agregar otro grupo: { campo: 'organismo', titulo: 'Organismo' }
  const GRUPOS = [
    { campo: 'tipoEstudio', titulo: 'Temas' }
  ];

  let estudios = [];
  const seleccion = {}; // { tipoEstudio: Set('Salud humana', ...) }
  GRUPOS.forEach((g) => (seleccion[g.campo] = new Set()));

  // ----- Menú hamburguesa (el contenido se acomoda con la clase del body) -----
  hmbButton.addEventListener('click', () => {
    const abierto = !nav.classList.contains('active');
    nav.classList.toggle('active', abierto);
    document.body.classList.toggle('menu-abierto', abierto);
    hmbButton.setAttribute('aria-expanded', abierto);
  });

  // ----- Utilidades -----
  // Quita tildes y pasa a minúsculas ("radiacion" encuentra "radiación")
  function normalizar(texto) {
    return String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // ----- Carga de datos -----
  fetch('data/estudios.json')
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      return respuesta.json();
    })
    .then((datos) => {
      estudios = datos;
      crearFiltros();
      pintar([]);
    })
    .catch((error) => {
      console.error('No se pudo cargar estudios.json:', error);
      contador.textContent = 'No se pudieron cargar los datos.';
    });

  // ----- Checks generados desde el JSON -----
  function crearFiltros() {
    filtros.innerHTML = '';

    GRUPOS.forEach(({ campo, titulo }) => {
      const conteo = {};
      estudios.forEach((e) => {
        conteo[e[campo]] = (conteo[e[campo]] || 0) + 1;
      });

      const grupo = document.createElement('fieldset');
      grupo.className = 'filtro-grupo';

      const leyenda = document.createElement('legend');
      leyenda.className = 'nav-titulo';
      leyenda.textContent = titulo;
      grupo.appendChild(leyenda);

      Object.keys(conteo)
        .sort((a, b) => a.localeCompare(b, 'es'))
        .forEach((valor) => {
          const label = document.createElement('label');
          label.className = 'filtro-opcion';

          const check = document.createElement('input');
          check.type = 'checkbox';
          check.dataset.campo = campo;
          check.value = valor;

          const texto = document.createElement('span');
          texto.className = 'filtro-texto';
          texto.textContent = valor;

          const cantidad = document.createElement('span');
          cantidad.className = 'nav-cantidad';
          cantidad.textContent = `(${conteo[valor]})`;

          label.append(check, texto, cantidad);
          grupo.appendChild(label);
        });

      filtros.appendChild(grupo);
    });
  }

  filtros.addEventListener('change', (e) => {
    const check = e.target;
    if (check.type !== 'checkbox') return;

    const set = seleccion[check.dataset.campo];
    if (check.checked) set.add(check.value);
    else set.delete(check.value);

    filtrar();
  });

  btnLimpiar.addEventListener('click', () => {
    GRUPOS.forEach((g) => seleccion[g.campo].clear());
    filtros.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
    buscador.value = '';
    filtrar();
  });

  // ----- Resultados -----
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

  function pintar(lista, mensaje = '') {
    resultados.innerHTML = lista.map(crearHTML).join('');
    contador.textContent = mensaje;
  }

  // ----- Filtro: checks + buscador trabajan juntos -----
  function filtrar() {
    const texto = buscador.value.trim();
    const terminos = normalizar(texto).split(/\s+/).filter(Boolean);
    const hayChecks = GRUPOS.some((g) => seleccion[g.campo].size > 0);

    // Sin búsqueda ni checks no se muestra nada
    if (terminos.length === 0 && !hayChecks) {
      pintar([]);
      return;
    }

    const lista = estudios.filter((estudio) => {
      // Dentro de un grupo basta con cumplir uno de los marcados
      const cumpleChecks = GRUPOS.every(
        (g) => seleccion[g.campo].size === 0 || seleccion[g.campo].has(estudio[g.campo])
      );

      // Cada palabra escrita debe coincidir con alguna palabra clave
      const cumpleTexto = terminos.every((t) =>
        estudio.palabrasClave.some((palabra) => normalizar(palabra).includes(t))
      );

      return cumpleChecks && cumpleTexto;
    });

    const mensaje = lista.length === 0
      ? 'No se encontraron estudios con esos filtros.'
      : `${lista.length} estudios encontrados`;

    pintar(lista, mensaje);
  }

  buscador.addEventListener('input', filtrar);
});