interface IndiceInterface {
  columnas: string[];
  filas: string[];
}

export function construirMatriz(
  fo: string,
  restricciones: string[]
): { matriz: number[][]; indices: IndiceInterface } {
  const matriz: number[][] = [];
  let indices: IndiceInterface = {
    columnas: [],
    filas: [],
  };

  let foMatriz: { fo: number[]; indices: string[] } = {
    fo: [1],
    indices: [],
  };

  function limpiarFuncion(f: string) {
    return f.replace(/\s+/g, "");
  }

  let foLimpia = limpiarFuncion(fo);

  const matchNumbersRegex = /[0-9]+/g;
  let numbers = [...foLimpia.matchAll(matchNumbersRegex)].map(
    (n) => -Number(n[0])
  );
  foMatriz.fo.push(...numbers);

  const matchVariablesRegex = /[a-zA-Z]+/g;
  let variables = [...foLimpia.matchAll(matchVariablesRegex)].map((v) => v[0]);
  foMatriz.indices.push(...variables);

  matriz.push(foMatriz.fo.concat(Array(restricciones.length + 1).fill(0)));
  console.log(matriz);

  function crearIndicesColumna(filas: string[]) {
    filas.unshift("💥");
    for (let index = 0; index < restricciones.length + 1; index++) {
      filas.push(index <= 2 ? `S${index + 1}` : "R");
      indices.filas.push(index === 0 ? "z" : `S${index}`);
    }
    indices.columnas.push(...filas);
  }
  crearIndicesColumna(foMatriz.indices);

  restricciones.forEach((val, i) => {
    let igualdad = val.indexOf("=");

    let miembroIzquierdo = val.slice(0, igualdad);

    let miebroDerecho = val.slice(igualdad + 1, val.length).trim();

    let restriccionLimpia = limpiarFuncion(miembroIzquierdo);

    let nuevaRestriccion = [
      ...restriccionLimpia.matchAll(matchNumbersRegex),
    ].map((n) => Number(n[0]));
    nuevaRestriccion.unshift(0);

    for (let index = 0; index < restricciones.length; index++) {
      nuevaRestriccion.push(index === i ? 1 : 0);
    }

    nuevaRestriccion.push(Number(miebroDerecho));

    matriz.push(nuevaRestriccion);
  });

  return { matriz, indices };
}

// Función para encontrar la columna pivote
function columnaPivoteIndice(matriz: number[][]): number {
  let max = Infinity;
  let indice = 0;
  const fo = matriz[0];
  fo.forEach((val, i) => {
    if (val < max) {
      max = val;
      indice = i;
    }
  });
  return indice;
}

function filaPivoteIndice(columnaPivote: number[], columnaSolucion: number[]) {
  // Calcular ratios seguros (ignorar divisiones por 0 o valores no numéricos)
  const ratios: (number | undefined)[] = columnaSolucion.map((val, i) => {
    if (i === 0) return undefined; // normalmente la fila 0 es la FO
    const denom = columnaPivote[i];
    if (!denom || denom === 0) return undefined;
    const ratio = val / denom;
    return Number.isFinite(ratio) && ratio >= 0 ? ratio : undefined;
  });

  let best = { value: Infinity, indice: 0 };
  ratios.forEach((r, i) => {
    if (r !== undefined && r < best.value) {
      best.value = r;
      best.indice = i;
    }
  });
  return best.indice;
}

function volerUnoElementoPivote(
  matriz: number[][],
  elementoPivote: number,
  filaPivoteI: number
) {
  matriz[filaPivoteI] = matriz[filaPivoteI].map((val) => {
    if (val === 0) return 0;
    return val / elementoPivote;
  });
  return matriz;
}

function volverCeroValoresSupInf(
  matriz: number[][],
  columnaPivote: number[],
  filaPivoteI: number,
  filaPivote: number[]
) {
  return matriz.map((vali, i) => {
    if (i === filaPivoteI) return vali;
    if (columnaPivote[i] === 0) return vali;
    return vali.map((valj, j) => {
      return -columnaPivote[i] * filaPivote[j] + valj;
    });
  });
}

export function main(
  initial: { matriz: number[][]; indices?: IndiceInterface },
  onIteration?: (
    payload: { matriz: number[][]; indices?: IndiceInterface },
    iterIndex: number
  ) => void
) {
  let iter = 0;
  let matriz = initial.matriz;
  let indices = initial.indices;
  // Report initial matrix as iteration 0
  onIteration?.({ matriz: matriz.map((r) => r.slice()), indices }, iter);

  while (matriz[0].some((val) => val < 0)) {
    let columnaPivoteI = columnaPivoteIndice(matriz);

    let columnaPivote = matriz.map((val) => val[columnaPivoteI]);

    let columnaSolucion = matriz.map((val) => val[matriz[0].length - 1]);

    let filaPivoteI = filaPivoteIndice(columnaPivote, columnaSolucion);

    let aux = indices?.columnas[columnaPivoteI + 1];
    if (indices) {
      indices.columnas[columnaPivoteI + 1] = indices.filas[filaPivoteI];
      indices.filas[filaPivoteI] = aux ?? "";
    }

    let elementoPivote = matriz[filaPivoteI][columnaPivoteI];

    matriz = volerUnoElementoPivote(matriz, elementoPivote, filaPivoteI);

    let filaPivote = matriz[filaPivoteI];

    matriz = volverCeroValoresSupInf(
      matriz,
      columnaPivote,
      filaPivoteI,
      filaPivote
    );

    iter += 1;
    onIteration?.({ matriz: matriz.map((r) => r.slice()), indices }, iter);
    console.table(matriz);
  }
}
