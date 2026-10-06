import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiErrorMessage } from '../utils/api-error.util';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id?: string;
  [key: string]: unknown;
}

/** Limite Cloudinary pour une image (offre actuelle) — à aligner avec app.upload.max-size côté
 *  Athl_back si l'offre change. Les vidéos ne sont bornées que par le plafond du backend. */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_SIZE = 25 * 1024 * 1024;
/** Largeur max d'une image réduite automatiquement : largement suffisant pour le site, même en plein écran. */
const MAX_IMAGE_DIMENSION = 2560;
const COMPRESSION_QUALITY = 0.85;
// Formats que le canvas ne sait pas réduire sans les abîmer (animation GIF, vectoriel SVG).
const NON_RESIZABLE_TYPES = ['image/gif', 'image/svg+xml'];

/** Taille lisible, ex. 13180635 -> "12,6 Mo" (même format que le message du backend). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.floor(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',').replace(',0', '')} Mo`;
}

/**
 * Upload de fichiers (images, vidéos, PDF) pour le BO. Passe par notre backend
 * (POST /api/v1/uploads, réservé ADMIN) plutôt que par un appel direct à Cloudinary :
 * l'API_KEY/API_SECRET Cloudinary ne doivent jamais atteindre le navigateur — c'est le
 * backend qui les détient et fait l'upload réel (voir CloudinaryConfig côté Athl_back).
 */
@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /**
   * Image : refusée si ce n'est pas une image ; au-delà de MAX_UPLOAD_SIZE, réduite dans le
   * navigateur (2560px max, JPEG/WebP 85 %) avant l'envoi plutôt que rejetée par Cloudinary.
   * Les erreurs remontent en Error(message) comme les erreurs API : les écrans les affichent déjà en toast.
   */
  upload(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    if (!file.type.startsWith('image/')) {
      return throwError(() => new Error('Format non accepté : choisissez une image (JPG, PNG, WebP…).'));
    }
    if (file.size <= MAX_UPLOAD_SIZE) {
      return this.uploadResource(file, folder);
    }
    if (NON_RESIZABLE_TYPES.includes(file.type)) {
      return throwError(() => new Error(CloudinaryUploadService.tooLargeMessage(file.size, MAX_UPLOAD_SIZE)));
    }
    return from(CloudinaryUploadService.shrinkImage(file)).pipe(
      switchMap((shrunk) => {
        if (shrunk.size > MAX_UPLOAD_SIZE) {
          return throwError(() => new Error(CloudinaryUploadService.tooLargeMessage(file.size, MAX_UPLOAD_SIZE)));
        }
        return this.uploadResource(shrunk, folder);
      }),
    );
  }

  uploadVideo(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    if (!file.type.startsWith('video/')) {
      return throwError(() => new Error('Format non accepté : choisissez une vidéo (MP4, WebM…).'));
    }
    if (file.size > MAX_VIDEO_UPLOAD_SIZE) {
      return throwError(() => new Error(CloudinaryUploadService.tooLargeMessage(file.size, MAX_VIDEO_UPLOAD_SIZE)));
    }
    return this.uploadResource(file, folder);
  }

  private static tooLargeMessage(size: number, max: number): string {
    return `Fichier trop lourd (${formatFileSize(size)}). Taille maximum : ${formatFileSize(max)}.`;
  }

  /**
   * Redessine l'image dans un canvas à 2560px max, puis l'exporte en JPEG (ou WebP pour un PNG,
   * afin de garder la transparence des logos). Si le résultat dépasse encore la limite (photo
   * très détaillée), on retente à 75 % de la taille, 3 fois au plus. Rejette si l'image est illisible.
   */
  private static async shrinkImage(file: File): Promise<File> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Image illisible : essayez un autre fichier.'));
        el.src = url;
      });
      const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
      const outputType = keepAlpha ? 'image/webp' : 'image/jpeg';
      let scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      let blob: Blob | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, COMPRESSION_QUALITY));
        if (blob && blob.size <= MAX_UPLOAD_SIZE) break;
        scale *= 0.75;
      }
      if (!blob) throw new Error('Impossible de réduire cette image : essayez un autre fichier.');
      const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
      const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
      return new File([blob], name, { type: blob.type });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private uploadResource(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    return this.http.post<CloudinaryUploadResponse>(`${this.base}/${environment.endpoints.uploads.create}`, formData).pipe(
      map((res) => ({ ...res, secure_url: CloudinaryUploadService.normalizeDeliveryUrl(res.secure_url) })),
      // Les composants consommateurs attendent un Error classique (err?.message) — pattern
      // hérité de l'ancien appel fetch() direct à Cloudinary, conservé pour ne pas les retoucher tous.
      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(extractApiErrorMessage(err, "Erreur lors de l'envoi du fichier."))),
      ),
    );
  }

  /**
   * Nettoie une URL Cloudinary existante pour supprimer les transformations invalides
   * ajoutées sur les PDFs `raw/upload`.
   */
  static normalizeDeliveryUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    return url.replace('/fl_attachment:false/', '/');
  }
}
