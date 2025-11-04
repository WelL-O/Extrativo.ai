import { z } from 'zod'

// Schema para Etapa 1 - Informações Básicas
export const basicInfoSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  project_id: z.string().uuid('Selecione um projeto válido').optional(),
})

// Schema para Etapa 2 - Configuração de Busca
export const searchConfigSchema = z.object({
  keywords: z.array(z.string())
    .min(1, 'Adicione pelo menos uma palavra-chave')
    .max(10, 'Máximo de 10 palavras-chave'),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  radius: z.number().min(1).max(100).default(10),
  country_code: z.string().length(2).default('BR'),
  language: z.string().length(2).default('pt'),
})

// Schema para Etapa 3 - Opções Avançadas
export const advancedOptionsSchema = z.object({
  max_results: z.number()
    .min(1, 'Mínimo 1 resultado')
    .max(1000, 'Máximo 1000 resultados'),
  extract_emails: z.boolean().default(true),
  extract_reviews: z.boolean().default(false),
  fast_mode: z.boolean().default(false),
  depth: z.number().min(1).max(3).default(2), // 1=básica, 2=média, 3=completa
})

// Schema completo da extração
export const extractionSchema = basicInfoSchema
  .merge(searchConfigSchema)
  .merge(advancedOptionsSchema)

export type ExtractionFormData = z.infer<typeof extractionSchema>
export type BasicInfoData = z.infer<typeof basicInfoSchema>
export type SearchConfigData = z.infer<typeof searchConfigSchema>
export type AdvancedOptionsData = z.infer<typeof advancedOptionsSchema>
