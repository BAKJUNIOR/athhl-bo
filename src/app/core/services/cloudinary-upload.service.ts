import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiErrorMessage } from '../utils/api-error.util';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id?: string;
  [key: string]: unknown;
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

  upload(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    return this.uploadResource(file, folder);
  }

  uploadVideo(file: File, folder?: string): Observable<CloudinaryUploadResponse> {
    return this.uploadResource(file, folder);
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
