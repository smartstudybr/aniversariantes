// utils/supabase-s3.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

// Nome do bucket que você criou no Dashboard > Storage
export const BUCKET_NAME = 'aniversariantes'

// URL base para abrir arquivos publicamente
export const S3_ENDPOINT = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`

/**
 * Verifica se o bucket existe e, se não, tenta criá-lo.
 */
export async function ensureBucketExists() {
  // Lista todos os buckets e vê se o seu está entre eles
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) return { success: false, error: listError }

  if (!buckets.find(b => b.name === BUCKET_NAME)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, { public: true })
    if (createError) return { success: false, error: createError }
  }

  return { success: true }
}

/**
 * Retorna a lista de objetos no bucket.
 */
export async function listFilesInS3Bucket() {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })
  if (error) return { success: false, error }
  return { success: true, files: data }
}

/**
 * Faz upload do arquivo e retorna a URL pública.
 * onProgress: callback opcional para progresso (0–100)
 */
export async function uploadDirectToS3({
  file,
  path,
  onProgress
}: {
  file: File
  path: string
  onProgress?: (progress: number) => void
}) {
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return { success: false, error: uploadError }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return { success: true, url: urlData.publicUrl }
}
