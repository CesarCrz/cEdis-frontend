"use client"

import { useRef, useState } from "react"
import Papa from "papaparse"
import { toast } from "sonner"
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChefHat,
} from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useImportRecetasCsv } from "@/hooks/use-recetas"

interface RecetaCsvImportSheetProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

const REQUIRED_COLS = ["receta", "cantidad", "unidad"]
const OPTIONAL_COLS = [
  "categoria",
  "rendimiento",
  "rendimiento_unidad",
  "variacion",
  "tipo",
  "ingrediente_sku",
  "ingrediente_nombre",
]
const ALL_COLS = [
  "receta",
  "categoria",
  "rendimiento",
  "rendimiento_unidad",
  "variacion",
  "tipo",
  "ingrediente_sku",
  "ingrediente_nombre",
  "cantidad",
  "unidad",
]

const COLUMN_DOCS = [
  {
    col: "receta",
    req: true,
    desc: "Nombre de la receta. Se repite en cada ingrediente",
    ejemplo: "Yakimeshi Crispy",
  },
  {
    col: "cantidad",
    req: true,
    desc: "Cuánto se usa de ese ingrediente",
    ejemplo: "200",
  },
  {
    col: "unidad",
    req: true,
    desc: "Unidad de la cantidad: g, kg, mL, L, pza",
    ejemplo: "g",
  },
  {
    col: "ingrediente_sku",
    req: false,
    desc: "SKU del insumo. Es la forma precisa de referenciarlo",
    ejemplo: "ARRO-001",
  },
  {
    col: "ingrediente_nombre",
    req: false,
    desc: "Alternativa al SKU: nombre exacto del insumo o sub-receta",
    ejemplo: "Arroz",
  },
  {
    col: "tipo",
    req: false,
    desc: "insumo (default) o receta para usar otra receta como ingrediente",
    ejemplo: "insumo",
  },
  {
    col: "categoria",
    req: false,
    desc: "Categoría de la receta. Se crea si no existe",
    ejemplo: "Platillos",
  },
  {
    col: "rendimiento",
    req: false,
    desc: "Cuántas porciones/unidades rinde la receta (default 1)",
    ejemplo: "1",
  },
  {
    col: "rendimiento_unidad",
    req: false,
    desc: "Unidad del rendimiento",
    ejemplo: "pza",
  },
  {
    col: "variacion",
    req: false,
    desc: "Tamaño o versión: chico, grande... (default Normal)",
    ejemplo: "Normal",
  },
]

function downloadTemplate() {
  const rows = [
    ALL_COLS.join(","),
    '"Salsa Tare","Salsas","500","mL","Normal","insumo","SOYA-001","",300,"mL"',
    '"Salsa Tare","Salsas","500","mL","Normal","insumo","AZUC-001","",200,"g"',
    '"Yakimeshi Crispy","Platillos","1","pza","Normal","insumo","ARRO-001","",200,"g"',
    '"Yakimeshi Crispy","Platillos","1","pza","Normal","insumo","","Philadelphia",50,"g"',
    '"Yakimeshi Crispy","Platillos","1","pza","Normal","receta","","Salsa Tare",30,"mL"',
  ]
  const blob = new Blob(["﻿" + rows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "plantilla_recetas.csv"
  a.click()
  URL.revokeObjectURL(url)
}

interface ImportError {
  row: number
  message: string
}

interface ColStatus {
  found: string[]
  missing: string[]
  extra: string[]
  missingIngredientRef: boolean
}

function checkColumns(headers: string[]): ColStatus {
  const lc = headers.map((h) => h.toLowerCase().trim())
  const found = REQUIRED_COLS.filter((c) => lc.includes(c))
  const missing = REQUIRED_COLS.filter((c) => !lc.includes(c))
  const known = new Set([...REQUIRED_COLS, ...OPTIONAL_COLS])
  const extra = lc.filter((h) => !known.has(h))
  const missingIngredientRef =
    !lc.includes("ingrediente_sku") && !lc.includes("ingrediente_nombre")
  return { found, missing, extra, missingIngredientRef }
}

interface GroupedReceta {
  nombre: string
  categoria: string
  ingredientes: {
    tipo: string
    ref: string
    cantidad: string
    unidad: string
    variacion: string
  }[]
}

/** Group flat CSV rows into recipes, the way the importer will read them. */
function groupRows(rows: Record<string, string>[]): GroupedReceta[] {
  const map = new Map<string, GroupedReceta>()
  for (const row of rows) {
    const nombre = (row["receta"] ?? "").trim()
    if (!nombre) continue
    const k = nombre.toLowerCase()
    let group = map.get(k)
    if (!group) {
      group = {
        nombre,
        categoria: (row["categoria"] ?? "").trim(),
        ingredientes: [],
      }
      map.set(k, group)
    }
    group.ingredientes.push({
      tipo: (row["tipo"] ?? "insumo").trim() || "insumo",
      ref:
        (row["ingrediente_sku"] ?? "").trim() ||
        (row["ingrediente_nombre"] ?? "").trim(),
      cantidad: (row["cantidad"] ?? "").trim(),
      unidad: (row["unidad"] ?? "").trim(),
      variacion: (row["variacion"] ?? "").trim() || "Normal",
    })
  }
  return [...map.values()]
}

export function RecetaCsvImportSheet({
  open,
  onClose,
  cedisId,
}: RecetaCsvImportSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [groups, setGroups] = useState<GroupedReceta[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [colStatus, setColStatus] = useState<ColStatus | null>(null)
  const [importResult, setImportResult] = useState<{
    imported: number
    errors: ImportError[]
  } | null>(null)
  const importMutation = useImportRecetasCsv(cedisId)

  function processFile(file: File) {
    setSelectedFile(file)
    setImportResult(null)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        setRowCount(results.data.length)
        setGroups(groupRows(results.data))
        setColStatus(checkColumns(results.meta.fields ?? []))
      },
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Solo se aceptan archivos .csv")
      return
    }
    processFile(file)
  }

  async function handleImport() {
    if (!selectedFile || !canImport) return
    const res = await importMutation.mutateAsync(selectedFile)
    if (res.error) {
      toast.error("Error al importar: " + res.error)
      return
    }
    if (res.data) {
      setImportResult(res.data)
      if (res.data.imported > 0) {
        toast.success(
          res.data.imported === 1
            ? "1 receta importada"
            : `${res.data.imported} recetas importadas`
        )
      }
    }
  }

  function handleReset() {
    setSelectedFile(null)
    setGroups([])
    setRowCount(0)
    setColStatus(null)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const canImport =
    !!selectedFile &&
    !!colStatus &&
    colStatus.missing.length === 0 &&
    !colStatus.missingIngredientRef

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Importar recetas desde CSV</SheetTitle>
          <SheetDescription>
            Una fila por ingrediente. Repite el nombre de la receta en cada una
            de sus filas.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Paso 1: Plantilla */}
          <section>
            <h3 className="text-sm font-semibold mb-2">
              Paso 1 — Descargar plantilla
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              type="button"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Descargar plantilla.csv
            </Button>

            <div className="mt-3 rounded-md border border-border overflow-hidden">
              <table className="text-xs w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">
                      Columna
                    </th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">
                      Req.
                    </th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">
                      Descripción
                    </th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">
                      Ejemplo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMN_DOCS.map((d) => (
                    <tr key={d.col} className="border-t border-border">
                      <td className="px-2 py-1.5 font-mono text-foreground">
                        {d.col}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {d.req ? (
                          <span className="text-destructive font-semibold">
                            ✱
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {d.desc}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">
                        {d.ejemplo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>
                Se requiere <span className="font-mono">ingrediente_sku</span> o{" "}
                <span className="font-mono">ingrediente_nombre</span> (al menos
                una de las dos).
              </p>
              <p>
                Si un ingrediente no existe en el catálogo,{" "}
                <span className="text-foreground">
                  se omite la receta completa
                </span>{" "}
                — nunca se importa a medias.
              </p>
              <p>Límite: 2,000 filas · 5 MB · solo .csv</p>
            </div>
          </section>

          {/* Paso 2: Upload */}
          <section>
            <h3 className="text-sm font-semibold mb-2">
              Paso 2 — Subir archivo
            </h3>
            <div
              role="region"
              aria-label="Zona de carga de archivo CSV"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground text-center">
                {selectedFile
                  ? selectedFile.name
                  : "Arrastra un archivo .csv o haz clic para seleccionar"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="sr-only"
                aria-label="Seleccionar archivo CSV"
                onChange={handleFileChange}
              />
            </div>
            {selectedFile && (
              <button
                type="button"
                className="mt-1 text-xs text-muted-foreground underline"
                onClick={handleReset}
              >
                Limpiar selección
              </button>
            )}
          </section>

          {/* Validación de columnas */}
          {colStatus && !importResult && (
            <section>
              <h3 className="text-sm font-semibold mb-2">
                Validación de columnas
              </h3>
              <div className="space-y-1.5">
                {REQUIRED_COLS.map((col) => {
                  const found = colStatus.found.includes(col)
                  return (
                    <div
                      key={col}
                      className={cn(
                        "flex items-center gap-2 text-xs rounded-md px-2 py-1.5",
                        found
                          ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {found ? (
                        <CheckCircle2
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      )}
                      <span className="font-mono font-semibold">{col}</span>
                      <span className="text-current/70">
                        {found ? "— encontrada" : "— FALTANTE (requerida)"}
                      </span>
                    </div>
                  )
                })}
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs rounded-md px-2 py-1.5",
                    colStatus.missingIngredientRef
                      ? "bg-destructive/10 text-destructive"
                      : "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                  )}
                >
                  {colStatus.missingIngredientRef ? (
                    <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  )}
                  <span className="font-mono font-semibold">
                    ingrediente_sku / ingrediente_nombre
                  </span>
                  <span className="text-current/70">
                    {colStatus.missingIngredientRef
                      ? "— FALTANTE (se necesita una)"
                      : "— encontrada"}
                  </span>
                </div>
                {colStatus.extra.length > 0 && (
                  <div className="flex items-start gap-2 text-xs rounded-md px-2 py-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle
                      className="h-3.5 w-3.5 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span>
                      Columnas desconocidas (se ignorarán):{" "}
                      <span className="font-mono">
                        {colStatus.extra.join(", ")}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Preview agrupado */}
          {groups.length > 0 && !importResult && (
            <section>
              <h3 className="text-sm font-semibold mb-1">
                Vista previa — {groups.length}{" "}
                {groups.length === 1 ? "receta" : "recetas"}, {rowCount}{" "}
                {rowCount === 1 ? "ingrediente" : "ingredientes"}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Así quedarán agrupadas las filas del archivo.
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {groups.slice(0, 10).map((g) => (
                  <div
                    key={g.nombre}
                    className="rounded-md border border-border overflow-hidden"
                  >
                    <div className="flex items-center gap-2 bg-muted/40 px-2 py-1.5">
                      <ChefHat
                        className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                        aria-hidden
                      />
                      <span className="text-xs font-semibold">{g.nombre}</span>
                      {g.categoria && (
                        <span className="text-[11px] text-muted-foreground">
                          · {g.categoria}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {g.ingredientes.length}{" "}
                        {g.ingredientes.length === 1 ? "ingr." : "ingrs."}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <caption className="sr-only">
                        Ingredientes de {g.nombre}
                      </caption>
                      <tbody>
                        {g.ingredientes.map((ing, i) => {
                          const incomplete =
                            !ing.ref || !ing.cantidad || !ing.unidad
                          return (
                            <tr
                              key={i}
                              className={cn(
                                "border-t border-border",
                                incomplete && "bg-destructive/10"
                              )}
                            >
                              <td className="px-2 py-1 font-mono">
                                {ing.ref || (
                                  <span className="text-destructive font-semibold">
                                    vacío
                                  </span>
                                )}
                              </td>
                              <td className="px-2 py-1 text-muted-foreground">
                                {ing.tipo === "receta" ? "sub-receta" : "insumo"}
                              </td>
                              <td className="px-2 py-1 font-mono text-right">
                                {ing.cantidad || "—"} {ing.unidad}
                              </td>
                              <td className="px-2 py-1 text-muted-foreground text-right">
                                {ing.variacion}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
                {groups.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    …y {groups.length - 10} recetas más en el archivo.
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={importMutation.isPending || !canImport}
                  title={
                    !canImport
                      ? "Faltan columnas requeridas en el archivo"
                      : undefined
                  }
                >
                  {importMutation.isPending
                    ? "Importando..."
                    : "Confirmar importación"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancelar
                </Button>
              </div>
            </section>
          )}

          {/* Resultado */}
          {importResult && (
            <section>
              <h3 className="text-sm font-semibold mb-3">Resultado</h3>
              <div className="flex items-center gap-2 text-sm text-stock-ok">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                <span className="font-mono">
                  {importResult.imported}{" "}
                  {importResult.imported === 1
                    ? "receta importada"
                    : "recetas importadas"}
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    {importResult.errors.length}{" "}
                    {importResult.errors.length === 1
                      ? "receta omitida"
                      : "recetas omitidas"}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 max-h-56 overflow-y-auto rounded-md border border-border p-2">
                    {importResult.errors.map((e, i) => (
                      <li key={i}>
                        <span className="text-foreground font-semibold font-mono">
                          Fila {e.row}:
                        </span>{" "}
                        {e.message}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Corrige esas recetas y vuelve a importar solo sus filas.
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  handleReset()
                  onClose()
                }}
              >
                Cerrar
              </Button>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
