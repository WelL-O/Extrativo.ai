'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/lib/i18n/components/LanguageSwitcher"
import { ExtractionWizard } from "@/components/extractions/ExtractionWizard"
import { TabsExtractionForm } from "@/components/extractions/TabsExtractionForm"
import { useCreateExtraction } from "@/lib/supabase-front/hooks/useCreateExtraction"
import { useCurrentUser } from "@/lib/supabase-front/hooks"
import { ExtractionFormData } from "@/lib/schemas/extraction"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function NewExtractionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const layout = searchParams.get('layout') || 'tabs' // Default to tabs
  const { user } = useCurrentUser()
  const { createExtraction } = useCreateExtraction()

  const handleSubmit = async (data: ExtractionFormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar uma extração')
      return
    }

    const { data: extraction, error } = await createExtraction(data, user.id)

    if (error) {
      toast.error('Erro ao criar extração', {
        description: error.message,
      })
      return
    }

    toast.success('Extração criada com sucesso!', {
      description: 'Você será redirecionado para acompanhar o progresso',
    })

    // Redirecionar para a página de detalhes
    router.push(`/dashboard/extractions/${extraction?.id}`)
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between px-4 border-b bg-background rounded-lg">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/extractions">Extrações</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nova Extração</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          {layout === 'wizard' ? (
            <ExtractionWizard onSubmit={handleSubmit} onCancel={handleCancel} />
          ) : (
            <TabsExtractionForm onSubmit={handleSubmit} onCancel={handleCancel} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
