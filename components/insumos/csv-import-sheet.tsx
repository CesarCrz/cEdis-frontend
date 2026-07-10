"use client"

import { useRef, useState } from "react"
import Papa from "papaparse"
import { toast } from "sonner"
import { Upload, Download, CheckCircle2, XCircle } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useImportInsumosCsv } from "@/hooks/use-insumos"

interface CsvImportSheetProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

const CSV_HEADERS = ["nombre", "sku", "unidad", "costo_unitario", "stock_minimo", "stock_inicial", "categoria", "proveedor"]

const COLUMN_DOCS = [
  { col: "nombre", req: true, desc: "Nombre del insumo", ejemplo: "Harina de trigo" },
  { col: "unidad", req: true, desc: "Símbolo o nombre: g, kg, mL, L, pza", ejemplo: "kg" },
  { col: "costo_unitario", req: true, desc: "Número positivo (precio por unidad)", ejemplo: "25.50" },
  { col: "sku", req: false, desc: "Código único. Se genera automáticamente si se omite", ejemplo: "HARI-001" },
  { col: "stock_minimo", req: false, desc: "Cantidad mínima de alerta (default 0)", ejemplo: "10" },
  { col: "stock_inicial", req: false, desc: "Stock con el que se crea el insumo (default 0)", ejemplo: "50" },
  { col: "categoria", req: false, desc: "Se crea automáticamente si no existe", ejemplo: "Harinas" },
  { col: "proveedor", req: false, desc: "Se crea automáticamente si no existe", ejemplo: "Distribuidora XYZ" },
]

function downloadTemplate() {
  const rows = [
    CSV_HEADERS.join(","),
    '"Harina de trigo","HARI-001","kg","25.50","10","50","Harinas","Distribuidora XYZ"',
    '"Azucar","AZUC-001","kg","18.00","5","25","Abarrotes",""',
    '"Aceite vegetal","","L","32.00","2","10","Aceites",""',
  ]
  const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "plantilla_insumos.csv"
  a.click()
  URL.revokeObjectURL(url)
}

interface ImportError { row: number; message: string }

export function CsvImportSheet({ open, onClose, cedisId }: CsvImportSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{
    imported: number
    errors: ImportError[]
  } | null>(null)
  const importMutation = useImportInsumosCsv(cedisId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setImportResult(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5))
      },
    })
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Solo se aceptan archivos .csv")
      return
    }
    setSelectedFile(file)
    setImportResult(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5))
      },
    })
  }

  async function handleImport() {
    if (!selectedFile) return
    const res = await importMutation.mutateAsync(selectedFile)
    if (res.error) {
      toast.error("Error al importar: " + res.error)
      return
    }
    if (res.data) {
      setImportResult(res.data as unknown as { imported: number; errors: ImportError[] })
      toast.success(`${res.data.imported} insumos importados exitosamente`)
    }
  }

  function handleReset() {
    setSelectedFile(null)
    setPreview([])
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const previewHeaders = preview.length > 0 ? Object.keys(preview[0]) : []

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Importar insumos desde CSV</SheetTitle>
          <SheetDescription>
            Descarga la plantilla, llena los datos y sube el archivo.
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
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Columna</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Req.</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Descripción</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUMN_DOCS.map((d) => (
                    <tr key={d.col} className="border-t border-border">
                      <td className="px-2 py-1.5 font-mono text-foreground">{d.col}</td>
                      <td className="px-2 py-1.5 text-center">{d.req ? <span className="text-destructive font-semibold">✱</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{d.desc}</td>
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">{d.ejemplo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Límite: 1,000 filas · 5 MB · solo .csv</p>
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
                Limpiar seleccion
              </button>
            )}
          </section>

          {/* Preview */}
          {preview.length > 0 && !importResult && (
            <section>
              <h3 className="text-sm font-semibold mb-2">
                Vista previa (primeras 5 filas)
              </h3>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="text-xs w-full">
                  <caption className="sr-only">
                    Vista previa del archivo CSV
                  </caption>
                  <thead className="bg-muted/40">
                    <tr>
                      {previewHeaders.map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-2 py-1.5 text-left font-semibold text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {previewHeaders.map((h) => (
                          <td key={h} className="px-2 py-1.5 font-mono">
                            {row[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending
                    ? "Importando..."
                    : "Confirmar importacion"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
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
                  {importResult.imported} insumos importados exitosamente
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    {importResult.errors.length} errores
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 max-h-40 overflow-y-auto">
                    {importResult.errors.map((e, i) => (
                      <li key={i} className="font-mono">
                        Fila {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
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
