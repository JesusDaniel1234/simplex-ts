import './style.css'
import { construirMatriz, main as simplexMain } from './simplex'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="panel-left">
    <header>
      <h1>Método Simplex</h1>
      <p class="descripcion">Introduce la función objetivo y las restricciones. Pulsa Resolver para ver las iteraciones en el panel derecho.</p>
    </header>
    <main>
      <form id="simplex-form">
        <div class="form-group">
            <label for="objetivo">Función Objetivo:</label>
            <input type="text" id="objetivo" name="objetivo" placeholder="Ej:z = 3x + 2y" required>
        </div>
        <div class="form-group">
            <label for="restricciones-cantidad">Cantidad de restricciones:</label>
            <select id="restricciones-cantidad" name="restricciones-cantidad">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </div>
        <div id="restricciones-container"></div>
        <button type="submit">Resolver</button>
      </form>
    </main>
  </div>
  <div id="panel-right">
    <section id="resultados">
      <h2>Iteraciones</h2>
      <div id="resultados-container"></div>
    </section>
  </div>
`
const restriccionesCantidad = document.getElementById('restricciones-cantidad') as HTMLSelectElement | null;
const restriccionesContainer = document.getElementById('restricciones-container') as HTMLDivElement | null;

function renderRestriccionesInputs(cantidad: number) {
  if (!restriccionesContainer) return;
  restriccionesContainer.innerHTML = '';
  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
                    <label for="restriccion-${i}">Restricción ${i}:</label>
                    <input type="text" id="restriccion-${i}" name="restriccion-${i}" placeholder="Ej: x + y = 5" required>
                `;
    restriccionesContainer.appendChild(div);
  }
}

restriccionesCantidad?.addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement | null;
  if (!target) return;
  renderRestriccionesInputs(Number(target.value));
});

const form = document.getElementById('simplex-form') as HTMLFormElement | null;
form?.addEventListener('submit', function(e) {
  e.preventDefault();
  const objetivoInput = document.getElementById('objetivo') as HTMLInputElement | null;
  const objetivo = objetivoInput?.value ?? '';
  const cantidad = Number(restriccionesCantidad?.value ?? 1);
  const restricciones: string[] = [];
  for (let i = 1; i <= cantidad; i++) {
    const r = document.getElementById(`restriccion-${i}`) as HTMLInputElement | null;
    restricciones.push(r?.value ?? '');
  }
  console.log('Función objetivo:', objetivo);
  console.log('Restricciones:', restricciones);

  const inicial = construirMatriz(objetivo, restricciones);
  const resultadosContainer = document.getElementById('resultados-container') as HTMLDivElement | null;
  if (resultadosContainer) resultadosContainer.innerHTML = '';

  function renderMatrizTabla(payload: { matriz: number[][]; indices?: { columnas: string[]; filas: string[] } }, iter: number) {
    const m = payload.matriz;
    const indices = payload.indices;
    if (!resultadosContainer) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'iteracion';
    const title = document.createElement('h3');
    title.textContent = `Iteración ${iter}`;
    wrapper.appendChild(title);

    const table = document.createElement('table');
    table.className = 'matriz';

    if (indices && indices.columnas && indices.columnas.length > 0) {
      const thead = document.createElement('thead');
      const htr = document.createElement('tr');
      indices.columnas.forEach((h) => {
        const th = document.createElement('th');
        th.textContent = h;
        htr.appendChild(th);
      });
      thead.appendChild(htr);
      table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    m.forEach((fila, rowIndex) => {
      const tr = document.createElement('tr');
      // si hay labels de fila, insertarlos como primera celda
      if (indices && indices.filas && indices.filas[rowIndex]) {
        const labelTd = document.createElement('td');
        labelTd.textContent = indices.filas[rowIndex];
        labelTd.className = 'fila-label';
        tr.appendChild(labelTd);
      }
      fila.forEach((v) => {
        const td = document.createElement('td');
        td.textContent = String(Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v as any);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    resultadosContainer.appendChild(wrapper);
  }
  simplexMain(inicial, (payload, iter) => {
    renderMatrizTabla(payload, iter);
  });
});
renderRestriccionesInputs(Number(restriccionesCantidad?.value ?? 1));