"use server"

import type { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/server'
import { LaporanPage } from './LaporanPage'



export type ReportWithPhotos =
  Database['public']['Tables']['reports']['Row'] & {
    report_photos: Pick<Database['public']['Tables']['report_photos']['Row'], 'report_id' | 'file_name' | 'storage_path'>[];
  };

export default async function page() {
  const supabase = await createClient()
  const { data } = await supabase.from('reports').select(`
  *,
  report_photos(
    report_id,
    storage_path,
    file_name
  )
`)

  // biome-ignore lint/style/noNonNullAssertion: lha wes onok data ndek supabase, mosok ate dihapus
  return <LaporanPage reports={data!} />
}
