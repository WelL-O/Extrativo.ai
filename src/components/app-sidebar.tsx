"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { SidebarLogo } from "@/components/sidebar-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { PaperPlaneIcon } from "@radix-ui/react-icons"
import { useCurrentUser } from "@/lib/supabase-front"
import { useTranslation } from "@/lib/i18n"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, loading } = useCurrentUser()
  const { t } = useTranslation('sidebar')

  // Dados do usuário vindos do Supabase
  const userData = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Usuário',
    email: user?.email || '',
    avatar: profile?.avatar_url || '',
  }

  // Dados da navegação com i18n
  const data = {
    navMain: [
      {
        title: t('playground'),
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: t('history'),
            url: "#",
          },
          {
            title: t('starred'),
            url: "#",
          },
          {
            title: t('settings'),
            url: "#",
          },
        ],
      },
      {
        title: t('models'),
        url: "#",
        icon: Bot,
        items: [
          {
            title: t('genesis'),
            url: "#",
          },
          {
            title: t('explorer'),
            url: "#",
          },
          {
            title: t('quantum'),
            url: "#",
          },
        ],
      },
      {
        title: t('documentation'),
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: t('introduction'),
            url: "#",
          },
          {
            title: t('get_started'),
            url: "#",
          },
          {
            title: t('tutorials'),
            url: "#",
          },
          {
            title: t('changelog'),
            url: "#",
          },
        ],
      },
      {
        title: t('settings'),
        url: "#",
        icon: Settings2,
        items: [
          {
            title: t('general'),
            url: "#",
          },
          {
            title: t('team'),
            url: "#",
          },
          {
            title: t('billing'),
            url: "#",
          },
          {
            title: t('limits'),
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: t('support'),
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: t('feedback'),
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: t('design_engineering'),
        url: "#",
        icon: Frame,
      },
      {
        name: t('sales_marketing'),
        url: "#",
        icon: PieChart,
      },
      {
        name: t('travel'),
        url: "#",
        icon: Map,
      },
    ],
  }

  if (loading) {
    return (
      <Sidebar variant="inset" {...props}>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center justify-center">
                <SidebarLogo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
