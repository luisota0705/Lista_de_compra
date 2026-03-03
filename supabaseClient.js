
// Importa a função de criação do client Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Cria o client com a URL e a chave fornecidas
export const supabase = createClient(
    'https://ylxqdwszxcvqsdklwmzg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlseHFkd3N6eGN2cXNka2x3bXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTE1MjEsImV4cCI6MjA4NzY4NzUyMX0.w75pSkWEk4F_43IQK5Y4DY53OqrO-8oIQGFj60uCvf4'
)
