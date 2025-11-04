'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExtractionFormData, extractionSchema } from '@/lib/schemas/extraction'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Info,
  Search,
  Settings,
  CheckCircle2,
  MapPin,
  Globe,
  Zap,
  Mail,
  Star,
  Plus,
  X
} from 'lucide-react'
import { useState } from 'react'

interface TabsExtractionFormProps {
  onSubmit: (data: ExtractionFormData) => Promise<void>
  onCancel: () => void
}

export function TabsExtractionForm({ onSubmit, onCancel }: TabsExtractionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

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

  const { register, formState: { errors }, setValue, watch } = form

  // Mock de projetos - substituir por hook real
  const projects = [
    { id: '1', name: 'Projeto 1' },
    { id: '2', name: 'Projeto 2' },
  ]

  const handleSubmit = async (data: ExtractionFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ ...data, keywords })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addKeyword = () => {
    if (keywordInput.trim() && keywords.length < 10) {
      const newKeywords = [...keywords, keywordInput.trim()]
      setKeywords(newKeywords)
      setValue('keywords', newKeywords)
      setKeywordInput('')
    }
  }

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index)
    setKeywords(newKeywords)
    setValue('keywords', newKeywords)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Busca
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Opções
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Informações Básicas */}
        <TabsContent value="info" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Nome e descrição da sua extração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Configuração de Busca */}
        <TabsContent value="search" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Configuração de Busca
              </CardTitle>
              <CardDescription>
                O que e onde você deseja buscar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Palavras-chave */}
              <div className="space-y-2">
                <Label htmlFor="keywords">
                  Palavras-chave <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    placeholder="Ex: restaurante, pizzaria"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addKeyword()
                      }
                    }}
                  />
                  <Button type="button" onClick={addKeyword} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {keywords.length}/10 palavras-chave adicionadas
                </p>
                {errors.keywords && (
                  <p className="text-sm text-destructive">{errors.keywords.message}</p>
                )}
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </Label>
                <Input
                  id="location"
                  placeholder="Digite uma cidade ou endereço..."
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Autocomplete será implementado em breve
                </p>
              </div>

              {/* Raio */}
              <div className="space-y-2">
                <Label htmlFor="radius">Raio de busca: {watch('radius')} km</Label>
                <Slider
                  id="radius"
                  min={1}
                  max={100}
                  step={1}
                  value={[watch('radius') || 10]}
                  onValueChange={(value) => setValue('radius', value[0])}
                  className="w-full"
                />
              </div>

              {/* País */}
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  País
                </Label>
                <Select
                  value={watch('country_code') || 'BR'}
                  onValueChange={(value) => setValue('country_code', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="MX">México</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Opções Avançadas */}
        <TabsContent value="advanced" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Opções Avançadas
              </CardTitle>
              <CardDescription>
                Personalize o comportamento da extração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Max resultados */}
              <div className="space-y-2">
                <Label htmlFor="max_results">Máximo de resultados</Label>
                <Input
                  id="max_results"
                  type="number"
                  min={1}
                  max={1000}
                  {...register('max_results', { valueAsNumber: true })}
                  className={errors.max_results ? 'border-destructive' : ''}
                />
                {errors.max_results && (
                  <p className="text-sm text-destructive">{errors.max_results.message}</p>
                )}
              </div>

              {/* Opções de extração */}
              <div className="space-y-3">
                <Label>Dados para extrair</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extract_emails"
                      checked={watch('extract_emails')}
                      onCheckedChange={(checked) => setValue('extract_emails', checked as boolean)}
                    />
                    <Label htmlFor="extract_emails" className="flex items-center gap-2 cursor-pointer">
                      <Mail className="h-4 w-4" />
                      Extrair emails
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extract_reviews"
                      checked={watch('extract_reviews')}
                      onCheckedChange={(checked) => setValue('extract_reviews', checked as boolean)}
                    />
                    <Label htmlFor="extract_reviews" className="flex items-center gap-2 cursor-pointer">
                      <Star className="h-4 w-4" />
                      Extrair avaliações
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fast_mode"
                      checked={watch('fast_mode')}
                      onCheckedChange={(checked) => setValue('fast_mode', checked as boolean)}
                    />
                    <Label htmlFor="fast_mode" className="flex items-center gap-2 cursor-pointer">
                      <Zap className="h-4 w-4" />
                      Modo rápido
                    </Label>
                  </div>
                </div>
              </div>

              {/* Profundidade */}
              <div className="space-y-3">
                <Label>Profundidade da extração</Label>
                <RadioGroup
                  value={watch('depth')?.toString() || '2'}
                  onValueChange={(value) => setValue('depth', parseInt(value))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="depth-1" />
                    <Label htmlFor="depth-1" className="cursor-pointer">
                      Básica - Apenas informações principais
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="depth-2" />
                    <Label htmlFor="depth-2" className="cursor-pointer">
                      Média - Informações detalhadas (Recomendado)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="depth-3" />
                    <Label htmlFor="depth-3" className="cursor-pointer">
                      Completa - Máximo de informações possível
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resumo e Botões de Ação */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Resumo da Extração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{watch('name') || 'Não definido'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Palavras-chave</p>
              <p className="font-medium">{keywords.length > 0 ? keywords.join(', ') : 'Nenhuma'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Raio</p>
              <p className="font-medium">{watch('radius')} km</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Máx. resultados</p>
              <p className="font-medium">{watch('max_results')}</p>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? 'Criando...' : 'Iniciar Extração'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
