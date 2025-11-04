'use client'

import { UseFormReturn } from 'react-hook-form'
import { ExtractionFormData } from '@/lib/schemas/extraction'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useState } from 'react'

interface SearchConfigStepProps {
  form: UseFormReturn<ExtractionFormData>
}

export function SearchConfigStep({ form }: SearchConfigStepProps) {
  const { formState: { errors }, setValue, watch } = form
  const [keywordInput, setKeywordInput] = useState('')

  const keywords = watch('keywords') || []
  const radius = watch('radius')

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setValue('keywords', [...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setValue('keywords', keywords.filter(k => k !== keyword))
  }

  return (
    <div className="space-y-6">
      {/* Keywords */}
      <div className="space-y-2">
        <Label>
          Palavras-chave <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: restaurante, pizza..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddKeyword()
              }
            }}
          />
          <Button type="button" onClick={handleAddKeyword}>
            Adicionar
          </Button>
        </div>

        {/* Keywords List */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="gap-1">
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {errors.keywords && (
          <p className="text-sm text-destructive">{errors.keywords.message}</p>
        )}
      </div>

      {/* Localização */}
      <div className="space-y-2">
        <Label>Localização</Label>
        <Input
          placeholder="Digite um endereço ou cidade..."
          // TODO: Implementar autocomplete com Google Places ou Nominatim
        />
        <p className="text-xs text-muted-foreground">
          Deixe em branco para buscar em todo o país
        </p>
      </div>

      {/* Raio de busca */}
      <div className="space-y-2">
        <Label htmlFor="radius">
          Raio de busca: {radius}km
        </Label>
        <input
          id="radius"
          type="range"
          min="1"
          max="100"
          value={radius}
          onChange={(e) => setValue('radius', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1km</span>
          <span>100km</span>
        </div>
      </div>

      {/* País */}
      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Select
          value={watch('country_code')}
          onValueChange={(value) => setValue('country_code', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BR">Brasil</SelectItem>
            <SelectItem value="US">Estados Unidos</SelectItem>
            <SelectItem value="PT">Portugal</SelectItem>
            <SelectItem value="ES">Espanha</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
