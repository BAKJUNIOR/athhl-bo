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

      catchError((err: HttpErrorResponse) =>
        throwError(() => new Error(extractApiErrorMessage(err, err.status === 413
          ? 'Fichier trop lourd. Taille maximum : 10 Mo.'
          : "Erreur lors de l'envoi du fichier."))),
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
