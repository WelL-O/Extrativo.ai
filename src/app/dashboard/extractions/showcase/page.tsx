'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Layers,
  FileText,
  LayoutGrid,
  ArrowRight,
  Check,
  Search,
  Settings,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function ShowcasePage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Modelos de Layout</h2>
          <p className="text-muted-foreground mt-2">
            Escolha o estilo de interface para criar extrações
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/extractions">Voltar</Link>
        </Button>
      </div>

      {/* Models Grid */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Model 1: Wizard (Current) */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge>Atual</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle>Wizard Multi-Etapas</CardTitle>
            </div>
            <CardDescription>
              Interface guiada passo a passo com barra de progresso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span>Etapa 1 de 4</span>
                <span>25%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/4 bg-primary" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-primary font-medium">Info Básica</span>
                <span>Busca</span>
                <span>Avançado</span>
                <span>Revisar</span>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 rounded bg-muted w-24" />
                <div className="h-8 rounded bg-muted" />
                <div className="h-3 rounded bg-muted w-20" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-8 rounded bg-muted w-20" />
                <div className="h-8 rounded bg-primary/20 w-20" />
              </div>
            </div>

            {/* Pros/Cons */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Fácil de seguir, passo a passo</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Menos sobrecarga visual</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Validação por etapa</span>
              </div>
            </div>

            <Button className="w-full" asChild>
              <Link href="/dashboard/extractions/new">
                Ver Implementação <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Model 2: Single Page Form */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle>Formulário Único</CardTitle>
            </div>
            <CardDescription>
              Todas as opções visíveis em uma única página com scroll
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 max-h-64 overflow-hidden">
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-32" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-28" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-36" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-24" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-32" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-muted w-28" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="h-10 rounded bg-blue-500/20 w-full" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/30 to-transparent" />
            </div>

            {/* Pros/Cons */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Visão completa de todas opções</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Ideal para usuários avançados</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Preenchimento mais rápido</span>
              </div>
            </div>

            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/extractions/new?layout=single">
                Ver Implementação <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Model 3: Tabs Layout */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              <CardTitle>Abas com Seções</CardTitle>
            </div>
            <CardDescription>
              Navegação por abas entre diferentes seções do formulário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex gap-2 border-b pb-2">
                <div className="h-8 rounded-t bg-primary/20 w-20 text-xs flex items-center justify-center">
                  Info
                </div>
                <div className="h-8 rounded-t bg-muted w-20 text-xs flex items-center justify-center">
                  Busca
                </div>
                <div className="h-8 rounded-t bg-muted w-20 text-xs flex items-center justify-center">
                  Opções
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 rounded bg-muted w-24" />
                <div className="h-8 rounded bg-muted" />
                <div className="h-3 rounded bg-muted w-28" />
                <div className="h-8 rounded bg-muted" />
                <div className="h-3 rounded bg-muted w-20" />
                <div className="h-8 rounded bg-muted" />
              </div>
            </div>

            {/* Pros/Cons */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Navegação flexível entre seções</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Interface familiar e intuitiva</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Equilibra organização e acesso</span>
              </div>
            </div>

            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/extractions/new?layout=tabs">
                Ver Implementação <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Model 4: Card Grid Layout */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary">Recomendado</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-orange-500" />
              <CardTitle>Grid de Cards</CardTitle>
            </div>
            <CardDescription>
              Layout visual em cards agrupados por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border bg-background p-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    <div className="h-2 rounded bg-muted w-12 text-[8px]" />
                  </div>
                  <div className="h-6 rounded bg-muted" />
                  <div className="h-6 rounded bg-muted" />
                </div>
                <div className="rounded border bg-background p-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    <div className="h-2 rounded bg-muted w-12" />
                  </div>
                  <div className="h-6 rounded bg-muted" />
                  <div className="h-6 rounded bg-muted" />
                </div>
                <div className="rounded border bg-background p-2 space-y-1 col-span-2">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <div className="h-2 rounded bg-muted w-16" />
                  </div>
                  <div className="h-6 rounded bg-muted" />
                </div>
              </div>
              <div className="h-10 rounded bg-orange-500/20 w-full" />
            </div>

            {/* Pros/Cons */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Visual moderno e organizado</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Agrupamento lógico de campos</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Boa para diferentes tamanhos de tela</span>
              </div>
            </div>

            <Button className="w-full" variant="outline" asChild>
              <Link href="/dashboard/extractions/new?layout=cards">
                Ver Implementação <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Modelos</CardTitle>
          <CardDescription>
            Características principais de cada layout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Característica</th>
                  <th className="text-center p-2 font-medium">Wizard</th>
                  <th className="text-center p-2 font-medium">Single Page</th>
                  <th className="text-center p-2 font-medium">Tabs</th>
                  <th className="text-center p-2 font-medium">Cards</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Facilidade de uso</td>
                  <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Velocidade</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Visão geral</td>
                  <td className="text-center p-2">⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Mobile friendly</td>
                  <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐</td>
                  <td className="text-center p-2">⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td className="p-2">Melhor para</td>
                  <td className="text-center p-2 text-xs text-muted-foreground">Iniciantes</td>
                  <td className="text-center p-2 text-xs text-muted-foreground">Avançados</td>
                  <td className="text-center p-2 text-xs text-muted-foreground">Intermediário</td>
                  <td className="text-center p-2 text-xs text-muted-foreground">Todos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
