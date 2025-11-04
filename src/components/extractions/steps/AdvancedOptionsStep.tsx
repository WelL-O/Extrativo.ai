'use client'

import { UseFormReturn } from 'react-hook-form'
import { ExtractionFormData } from '@/lib/schemas/extraction'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface AdvancedOptionsStepProps {
  form: UseFormReturn<ExtractionFormData>
}

export function AdvancedOptionsStep({ form }: AdvancedOptionsStepProps) {
  const { register, formState: { errors }, setValue, watch } = form

  const maxResults = watch('max_results')
  const extractEmails = watch('extract_emails')
  const extractReviews = watch('extract_reviews')
  const fastMode = watch('fast_mode')
  const depth = watch('depth')

  return (
    <div className="space-y-6">
      {/* Max Results */}
      <div className="space-y-2">
        <Label htmlFor="max_results">
          Máximo de resultados
        </Label>
        <Input
          id="max_results"
          type="number"
          min="1"
          max="1000"
          {...register('max_results', { valueAsNumber: true })}
          className={errors.max_results ? 'border-destructive' : ''}
        />
        <p className="text-xs text-muted-foreground">
          Seu plano permite até 500 resultados por busca
        </p>
        {errors.max_results && (
          <p className="text-sm text-destructive">{errors.max_results.message}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-4">
        <Label>Opções de extração</Label>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="extract_emails"
            checked={extractEmails}
            onCheckedChange={(checked) => setValue('extract_emails', !!checked)}
          />
          <label
            htmlFor="extract_emails"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Extrair emails
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="extract_reviews"
            checked={extractReviews}
            onCheckedChange={(checked) => setValue('extract_reviews', !!checked)}
          />
          <label
            htmlFor="extract_reviews"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Extrair avaliações
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="fast_mode"
            checked={fastMode}
            onCheckedChange={(checked) => setValue('fast_mode', !!checked)}
          />
          <label
            htmlFor="fast_mode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Modo rápido (menos detalhes)
          </label>
        </div>
      </div>

      {/* Depth */}
      <div className="space-y-3">
        <Label>Profundidade de busca</Label>
        <RadioGroup
          value={String(depth)}
          onValueChange={(value) => setValue('depth', Number(value))}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="depth-1" />
            <Label htmlFor="depth-1" className="font-normal">
              Básica - Informações essenciais
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="depth-2" />
            <Label htmlFor="depth-2" className="font-normal">
              Média - Informações detalhadas
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="depth-3" />
            <Label htmlFor="depth-3" className="font-normal">
              Completa - Máximo de informações
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
