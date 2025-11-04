'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExtractionFormData, extractionSchema } from '@/lib/schemas/extraction'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { SearchConfigStep } from './steps/SearchConfigStep'
import { AdvancedOptionsStep } from './steps/AdvancedOptionsStep'
import { ReviewStep } from './steps/ReviewStep'

interface ExtractionWizardProps {
  onSubmit: (data: ExtractionFormData) => Promise<void>
  onCancel: () => void
}

const STEPS = [
  { id: 1, title: 'Informações Básicas', description: 'Nome e projeto' },
  { id: 2, title: 'Configuração de Busca', description: 'O que e onde buscar' },
  { id: 3, title: 'Opções Avançadas', description: 'Personalizar extração' },
  { id: 4, title: 'Revisar & Confirmar', description: 'Verificar e iniciar' },
]

export function ExtractionWizard({ onSubmit, onCancel }: ExtractionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExtractionFormData>({
    resolver: zodResolver(extractionSchema),
    defaultValues: {
      name: '',
      description: '',
      keywords: [],
      latitude: null,
      longitude: null,
      radius: 10,
      country_code: 'BR',
      language: 'pt',
      max_results: 100,
      extract_emails: true,
      extract_reviews: false,
      fast_mode: false,
      depth: 2,
    },
    mode: 'onChange',
  })

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = async () => {
    // Validar campos da etapa atual antes de avançar
    let fieldsToValidate: (keyof ExtractionFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['name', 'description', 'project_id']
    } else if (currentStep === 2) {
      fieldsToValidate = ['keywords', 'radius', 'country_code']
    } else if (currentStep === 3) {
      fieldsToValidate = ['max_results', 'extract_emails', 'extract_reviews', 'fast_mode', 'depth']
    }

    const isValid = await form.trigger(fieldsToValidate as any)

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: ExtractionFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep form={form} />
      case 2:
        return <SearchConfigStep form={form} />
      case 3:
        return <AdvancedOptionsStep form={form} />
      case 4:
        return <ReviewStep form={form} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Etapa {currentStep} de {STEPS.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-between">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex-1 text-center ${
              step.id === currentStep
                ? 'text-primary font-semibold'
                : step.id < currentStep
                ? 'text-muted-foreground'
                : 'text-muted-foreground/50'
            }`}
          >
            <div className="text-xs">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onCancel : handleBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {currentStep === 1 ? 'Cancelar' : 'Voltar'}
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Iniciar Extração'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
