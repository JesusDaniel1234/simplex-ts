interface IndiceInterface {
  columnas: string[];
  filas: string[];
}

export function construirMatriz(fo: string, restricciones: string[]): { matriz: number[][]; indices: IndiceInterface } {
  const matriz: number[][] = [];
  let indices: IndiceInterface = {
    columnas: [],
    filas: [],
  };
  function limpiarFuncion(f: string) {
    return f
      .trim()
      .split("")
      .filter((value) => value !== " ");
  }

  let foLimpia = limpiarFuncion(fo);

  let foMatriz = foLimpia.reduce(
    (acc, val, i) => {
      if (!isNaN(Number(val))) {
        acc.fo.push(foLimpia[i - 1] !== "-" ? -Number(val) : Number(val));
        acc.indices.push(foLimpia[i + 1]);
      }
      return acc;
    },
    { fo: [1], indices: ["z"] }
  );

  matriz.push(foMatriz.fo.concat(Array(restricciones.length + 1).fill(0)));

  indices.filas.push(...foMatriz.indices);

  function crearIndicesColumna(filas: string[]) {
    filas.unshift("💥");
    for (let index = 0; index < restricciones.length + 1; index++) {
      filas.push(index <= 2 ? `S${index + 1}` : "R");
    }
    indices.columnas.push(...filas);
  }
  crearIndicesColumna(foMatriz.indices);

  restricciones.forEach((val, i) => {

    let igualdad = val.indexOf("=");

    let miembroIzquierdo = val.slice(0, igualdad);

    let miebroDerecho = val.slice(
      igualdad + 1,
      val.length
    ).trim();

    let restriccionLimpia = limpiarFuncion(miembroIzquierdo);


    let nuevaRestriccion = restriccionLimpia.reduce(
      (acc, val, j) => {
        if (!isNaN(Number(val))) {
          acc.push(foLimpia[j - 1] !== "-" ? Number(val) : -Number(val));
        }
        return acc;
      },
      [0]
    );


    for (let index = 0; index < restricciones.length; index++) {
      nuevaRestriccion.push(index===i ? 1 : 0)
    }

    nuevaRestriccion.push(Number(miebroDerecho))

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
  onIteration?: (payload: { matriz: number[][]; indices?: IndiceInterface }, iterIndex: number) => void
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

    let aux = indices?.columnas[columnaPivoteI-1];

    if (indices) {
      indices.columnas[columnaPivoteI] = indices.filas[filaPivoteI];
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
