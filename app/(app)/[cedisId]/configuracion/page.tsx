"use client"

import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import {
  PlusCircle,
  Pencil,
  Trash2,
  Download,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useCanales, useCreateCanal, useUpdateCanal, useDeleteCanal } from "@/hooks/use-canales"
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from "@/hooks/use-categorias"
import { apiClient } from "@/lib/api/client"
import type { CanalVenta, Categoria } from "@/types/app.types"

export default function ConfiguracionPage() {
  const { cedisId } = useParams<{ cedisId: string }>()

  return (
    <div className="p-6">
      <PageHeader
        title="Configuracion"
        description="Administra canales de venta, categorias y ajustes del CEDIS"
      />

      <Tabs defaultValue="canales">
        <TabsList className="mb-6">
          <TabsTrigger value="canales">Canales de venta</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="cedis">CEDIS</TabsTrigger>
        </TabsList>

        <TabsContent value="canales">
          <CanalesTab cedisId={cedisId} />
        </TabsContent>
        <TabsContent value="categorias">
          <CategoriasTab cedisId={cedisId} />
        </TabsContent>
        <TabsContent value="cedis">
          <CedisTab cedisId={cedisId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CanalesTab({ cedisId }: { cedisId: string }) {
  const [editCanal, setEditCanal] = useState<CanalVenta | null>(null)
  const [newNombre, setNewNombre] = useState("")
  const [newComision, setNewComision] = useState("")
  const [deleteCanal, setDeleteCanal] = useState<CanalVenta | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createNombre, setCreateNombre] = useState("")
  const [createComision, setCreateComision] = useState("")

  const { data: res, isLoading } = useCanales(cedisId)
  const createCanal = useCreateCanal(cedisId)
  const updateCanal = useUpdateCanal(cedisId)
  const deleteC = useDeleteCanal(cedisId)

  const canales = res?.data ?? []

  async function handleCreate() {
    if (!createNombre.trim()) return
    const comision = parseFloat(createComision)
    const r = await createCanal.mutateAsync({
      nombre: createNombre.trim(),
      comision_pct: isNaN(comision) ? 0 : comision,
    })
    if (r.error) { toast.error(r.error); return }
    toast.success("Canal creado")
    setCreateNombre("")
    setCreateComision("")
    setCreateOpen(false)
  }

  async function handleEdit() {
    if (!editCanal || !newNombre.trim()) return
    const comision = parseFloat(newComision)
    const r = await updateCanal.mutateAsync({
      id: editCanal.id,
      data: { nombre: newNombre.trim(), comision_pct: isNaN(comision) ? 0 : comision },
    })
    if (r.error) { toast.error(r.error); return }
    toast.success("Canal actualizado")
    setEditCanal(null)
  }

  async function handleDelete() {
    if (!deleteCanal) return
    const r = await deleteC.mutateAsync(deleteCanal.id)
    if (r.error) { toast.error(r.error); return }
    toast.success("Canal eliminado")
    setDeleteCanal(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
          Nuevo canal
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nombre</TableHead>
                <TableHead>Comisión %</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {canales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Sin canales de venta
                  </TableCell>
                </TableRow>
              ) : (
                canales.map((canal: CanalVenta) => (
                  <TableRow key={canal.id}>
                    <TableCell className="font-medium">{canal.nombre}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {canal.comision_pct > 0 ? `${canal.comision_pct}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditCanal(canal)
                            setNewNombre(canal.nombre)
                            setNewComision(String(canal.comision_pct ?? 0))
                          }}
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteCanal(canal)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setCreateNombre(""); setCreateComision("") } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo canal de venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre del canal"
              value={createNombre}
              onChange={(e) => setCreateNombre(e.target.value)}
            />
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="Comisión % (opcional)"
                value={createComision}
                onChange={(e) => setCreateComision(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setCreateNombre(""); setCreateComision("") }}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createCanal.isPending}>
              {createCanal.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCanal} onOpenChange={(o) => !o && setEditCanal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar canal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nombre"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
            />
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="Comisión %"
                value={newComision}
                onChange={(e) => setNewComision(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCanal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateCanal.isPending}>
              {updateCanal.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCanal}
        onClose={() => setDeleteCanal(null)}
        onConfirm={handleDelete}
        title="Eliminar canal"
        description={`Se eliminara el canal "${deleteCanal?.nombre}".`}
        confirmLabel="Eliminar"
        loading={deleteC.isPending}
      />
    </div>
  )
}

function CategoriasTab({ cedisId }: { cedisId: string }) {
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null)
  const [newNombre, setNewNombre] = useState("")
  const [deleteCategoria, setDeleteCategoria] = useState<Categoria | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createNombre, setCreateNombre] = useState("")

  const { data: res, isLoading } = useCategorias(cedisId)
  const createCat = useCreateCategoria(cedisId)
  const updateCat = useUpdateCategoria(cedisId)
  const deleteCat = useDeleteCategoria(cedisId)

  const categorias = res?.data ?? []

  async function handleCreate() {
    if (!createNombre.trim()) return
    const r = await createCat.mutateAsync(createNombre.trim())
    if (r.error) { toast.error(r.error); return }
    toast.success("Categoria creada")
    setCreateNombre("")
    setCreateOpen(false)
  }

  async function handleEdit() {
    if (!editCategoria || !newNombre.trim()) return
    const r = await updateCat.mutateAsync({
      id: editCategoria.id,
      nombre: newNombre.trim(),
    })
    if (r.error) { toast.error(r.error); return }
    toast.success("Categoria actualizada")
    setEditCategoria(null)
  }

  async function handleDelete() {
    if (!deleteCategoria) return
    const r = await deleteCat.mutateAsync(deleteCategoria.id)
    if (r.error) { toast.error(r.error); return }
    toast.success("Categoria eliminada")
    setDeleteCategoria(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
          Nueva categoria
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    Sin categorias
                  </TableCell>
                </TableRow>
              ) : (
                categorias.map((cat: Categoria) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditCategoria(cat)
                            setNewNombre(cat.nombre)
                          }}
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteCategoria(cat)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva categoria</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre de la categoria"
            value={createNombre}
            onChange={(e) => setCreateNombre(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createCat.isPending}>
              {createCat.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCategoria} onOpenChange={(o) => !o && setEditCategoria(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre"
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategoria(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateCat?.isPending}
            >
              {updateCat?.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCategoria}
        onClose={() => setDeleteCategoria(null)}
        onConfirm={handleDelete}
        title="Eliminar categoria"
        description={`Se eliminara la categoria "${deleteCategoria?.nombre}".`}
        confirmLabel="Eliminar"
        loading={deleteCat?.isPending ?? false}
      />
    </div>
  )
}

function CedisTab({ cedisId }: { cedisId: string }) {
  const importRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const r = await apiClient<Blob>(`/api/${cedisId}/export`)
    if (r.error) { toast.error(r.error); return }
    toast.success("Exportacion solicitada")
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      toast.error("Archivo JSON invalido")
      return
    }
    const r = await apiClient(`/api/${cedisId}/import`, {
      method: "POST",
      body: JSON.stringify(parsed),
    })
    if (r.error) { toast.error(r.error); return }
    toast.success("Datos importados")
    if (importRef.current) importRef.current.value = ""
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold">Exportar / Importar datos</h3>
        <p className="text-sm text-muted-foreground">
          Exporta todos los datos del CEDIS en formato JSON, o importa datos desde un archivo JSON.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" aria-hidden />
            Exportar datos
          </Button>
          <Button
            variant="outline"
            onClick={() => importRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" aria-hidden />
            Importar datos
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
            aria-label="Importar datos JSON"
          />
        </div>
      </div>
    </div>
  )
}
