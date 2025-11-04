'use client'

import { UseFormReturn } from 'react-hook-form'
import { ExtractionFormData } from '@/lib/schemas/extraction'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface BasicInfoStepProps {
  form: UseFormReturn<ExtractionFormData>
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const { register, formState: { errors }, setValue, watch } = form

  // Mock de projetos - substituir por hook real
  const projects = [
    { id: '1', name: 'Projeto 1' },
    { id: '2', name: 'Projeto 2' },
  ]

  return (
    <div className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome da Extração <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ex: Restaurantes em São Paulo"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descrição <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Descreva o objetivo desta extração..."
          rows={3}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Projeto */}
      <div className="space-y-2">
        <Label htmlFor="project">
          Projeto <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <div className="flex gap-2">
          <Select
            value={watch('project_id') || ''}
            onValueChange={(value) => setValue('project_id', value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecionar projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem projeto</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {errors.project_id && (
          <p className="text-sm text-destructive">{errors.project_id.message}</p>
        )}
      </div>
    </div>
  )
}
