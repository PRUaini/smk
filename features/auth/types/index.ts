export interface Agent {
  id: string;
  kode_agent: string;
  nama: string;
  jabatan: string | null;
  unit_kerja: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginFormState {
  error?: string;
  success?: boolean;
}
