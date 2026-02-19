const API_URLS = {
  development: 'http://localhost:3000',
  production: 'aqui_debe_de_ir_la_url_a_produccion',
} as const

export const API_BASE_URL = import.meta.env.DEV
  ? API_URLS.development
  : API_URLS.production
