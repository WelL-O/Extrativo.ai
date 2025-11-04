'use client'

import { UseFormReturn } from 'react-hook-form'
import { ExtractionFormData } from '@/lib/schemas/extraction'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CreditCard, Check } from 'lucide-react'

interface ReviewStepProps {
  form: UseFormReturn<ExtractionFormData>
}

export function ReviewStep({ form }: ReviewStepProps) {
  const data = form.watch()

  // Estimativas (mock - calcular com base nos parâmetros)
  const estimatedTime = Math.ceil(data.max_results / 10) // ~1 min para cada 10 resultados
  const searchCost = 1 // custo em buscas

  const depthLabels = {
    1: 'Básica',
    2: 'Média',
    3: 'Completa',
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo da Extração</CardTitle>
          <CardDescription>Revise as configurações antes de iniciar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-sm">{data.name || '-'}</p>
            </div>

            {data.description && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p className="text-sm">{data.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Palavras-chave</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">País</p>
              <p className="text-sm">{data.country_code === 'BR' ? 'Brasil' : data.country_code}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Raio</p>
              <p className="text-sm">{data.radius}km</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Max resultados</p>
              <p className="text-sm">{data.max_results}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Profundidade</p>
              <p className="text-sm">{depthLabels[data.depth as keyof typeof depthLabels]}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Opções</p>
              <div className="flex flex-col gap-1 mt-1">
                {data.extract_emails && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Emails</span>
                  </div>
                )}
                {data.extract_reviews && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Avaliações</span>
                  </div>
                )}
                {data.fast_mode && (
                  <div className="flex items-center gap-1 text-xs">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Modo rápido</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimativa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estimativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tempo estimado</p>
              <p className="text-sm text-muted-foreground">~{estimatedTime} minutos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Custo</p>
              <p className="text-sm text-muted-foreground">
                {searchCost} busca (resta 9/10)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
