// Las páginas públicas se guardan en caché hasta 30 días y solo se renuevan cuando el panel
// avisa del cambio. Si ese aviso falla (por ejemplo, con el panel abierto durante un
// despliegue), hay que decírselo al editor: de lo contrario el cambio no se vería en el sitio.
export function reportPublicRefreshFailure(error: unknown) {
  console.error('Error al actualizar la caché pública:', error);
  if (typeof window !== 'undefined') {
    window.alert('El cambio se guardó, pero el sitio público no se pudo actualizar. Recarga esta página del panel y guarda de nuevo para que se publique.');
  }
}
