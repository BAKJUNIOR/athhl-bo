/**
 * Environnement local — API backend lancée en local (voir HELP.md du backend).
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  cloudinary: {
    cloudName: 'drfq0bt4z',
    uploadPreset: 'xbanking'
  },
  endpoints: {
    auth: {
      authenticate: 'api/v1/authenticate',
    },
    users: {
      currentUser: 'api/v1/users/current-user',
      register: 'api/v1/users/register',
      activation: 'api/v1/users/activation',
      resendActivation: 'api/v1/users/resend-activation-code',
      updateProfile: 'api/v1/users/update-profile',
      changePassword: 'api/v1/users/change-password',
      list: 'api/v1/users',
      resetPassword: (userId: number | string) => `api/v1/users/${userId}/reset-password`,
      block: (userId: number | string) => `api/v1/users/${userId}/block`,
      unblock: (userId: number | string) => `api/v1/users/${userId}/unblock`,
      byId: (userId: number | string) => `api/v1/users/${userId}`,
    },
    // Pas encore implémenté côté backend — endpoints posés à l'avance pour que le BO
    // soit prêt dès que l'API existera (voir domains/services).
    services: {
      list: 'api/v1/services',
      create: 'api/v1/services',
      update: (serviceId: number | string) => `api/v1/services/${serviceId}`,
      publish: (serviceId: number | string) => `api/v1/services/${serviceId}/publish`,
      unpublish: (serviceId: number | string) => `api/v1/services/${serviceId}/unpublish`,
      byId: (serviceId: number | string) => `api/v1/services/${serviceId}`,
    },
    jobs: {
      list: 'api/v1/jobs',
      create: 'api/v1/jobs',
      update: (jobId: number | string) => `api/v1/jobs/${jobId}`,
      publish: (jobId: number | string) => `api/v1/jobs/${jobId}/publish`,
      unpublish: (jobId: number | string) => `api/v1/jobs/${jobId}/unpublish`,
      byId: (jobId: number | string) => `api/v1/jobs/${jobId}`,
    },
    jobDomains: {
      list: 'api/v1/job-domains',
      create: 'api/v1/job-domains',
      byId: (domainId: number | string) => `api/v1/job-domains/${domainId}`,
    },
    quotes: {
      list: 'api/v1/quotes',
      updateStatus: (quoteId: number | string) => `api/v1/quotes/${quoteId}/status`,
      byId: (quoteId: number | string) => `api/v1/quotes/${quoteId}`,
    },
    applications: {
      list: 'api/v1/applications',
      updateStatus: (applicationId: number | string) => `api/v1/applications/${applicationId}/status`,
      byId: (applicationId: number | string) => `api/v1/applications/${applicationId}`,
    },
    team: {
      list: 'api/v1/team',
      create: 'api/v1/team',
      update: (memberId: number | string) => `api/v1/team/${memberId}`,
      byId: (memberId: number | string) => `api/v1/team/${memberId}`,
    },
    projects: {
      list: 'api/v1/projects',
      create: 'api/v1/projects',
      update: (projectId: number | string) => `api/v1/projects/${projectId}`,
      publish: (projectId: number | string) => `api/v1/projects/${projectId}/publish`,
      unpublish: (projectId: number | string) => `api/v1/projects/${projectId}/unpublish`,
      byId: (projectId: number | string) => `api/v1/projects/${projectId}`,
    },
    homeStats: {
      list: 'api/v1/home-stats',
      update: 'api/v1/home-stats',
    },
    siteContact: {
      get: 'api/v1/site-settings/contact',
      update: 'api/v1/site-settings/contact',
    },
    popups: {
      list: 'api/v1/popups',
      create: 'api/v1/popups',
      update: (popupId: number | string) => `api/v1/popups/${popupId}`,
      activate: (popupId: number | string) => `api/v1/popups/${popupId}/activate`,
      deactivate: (popupId: number | string) => `api/v1/popups/${popupId}/deactivate`,
      byId: (popupId: number | string) => `api/v1/popups/${popupId}`,
    },
  },
};
