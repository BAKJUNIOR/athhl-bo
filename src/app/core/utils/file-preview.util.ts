// Aide à l'affichage des pièces jointes (devis) et CV (candidatures) : ce sont des URLs Cloudinary
// brutes envoyées par les visiteurs — on distingue les images (miniature) des autres documents
// (lien avec nom de fichier) plutôt que d'afficher l'URL telle quelle.
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

function extensionOf(url: string): string {
  const clean = url.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : '';
}

export function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.includes(extensionOf(url));
}

export function fileNameOf(url: string): string {
  const clean = url.split('?')[0].split('#')[0];
  const parts = clean.split('/');
  return parts[parts.length - 1] || url;
}
