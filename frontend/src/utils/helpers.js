export const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Une erreur est survenue';

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });