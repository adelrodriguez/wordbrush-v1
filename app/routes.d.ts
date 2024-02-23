declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/api/project/:projectId/images/:imageId": { "projectId": string, "imageId": string };
    "/api/projects/:projectId/recommendations": { "projectId": string };
    "/api/webhooks/lemonsqueezy": Record<string, never>;
    "/create": Record<string, never>;
    "/create/:projectId": { "projectId": string };
    "/create/:projectId/brush/:templateId": { "projectId": string, "templateId": string };
    "/create/:projectId/brush/:templateId/details": { "projectId": string, "templateId": string };
    "/create/:projectId/brush/:templateId/submit": { "projectId": string, "templateId": string };
    "/login": Record<string, never>;
    "/logout": Record<string, never>;
    "/magic-link": Record<string, never>;
    "/my": Record<string, never>;
    "/my/images": Record<string, never>;
    "/my/images/:imageId": { "imageId": string };
    "/my/profile": Record<string, never>;
    "/my/settings": Record<string, never>;
    "/my/words": Record<string, never>;
    "/my/words/:projectId": { "projectId": string };
    "/my/words/:projectId/images/:imageId": { "projectId": string, "imageId": string };
    "/pricing": Record<string, never>;
    "/robots.txt": Record<string, never>;
    "/sitemap.xml": Record<string, never>;
    "/verify": Record<string, never>;
  };

  export function route<
    T extends
      | ["/"]
      | ["/api/project/:projectId/images/:imageId", RouteParams["/api/project/:projectId/images/:imageId"]]
      | ["/api/projects/:projectId/recommendations", RouteParams["/api/projects/:projectId/recommendations"]]
      | ["/api/webhooks/lemonsqueezy"]
      | ["/create"]
      | ["/create/:projectId", RouteParams["/create/:projectId"]]
      | ["/create/:projectId/brush/:templateId", RouteParams["/create/:projectId/brush/:templateId"]]
      | ["/create/:projectId/brush/:templateId/details", RouteParams["/create/:projectId/brush/:templateId/details"]]
      | ["/create/:projectId/brush/:templateId/submit", RouteParams["/create/:projectId/brush/:templateId/submit"]]
      | ["/login"]
      | ["/logout"]
      | ["/magic-link"]
      | ["/my"]
      | ["/my/images"]
      | ["/my/images/:imageId", RouteParams["/my/images/:imageId"]]
      | ["/my/profile"]
      | ["/my/settings"]
      | ["/my/words"]
      | ["/my/words/:projectId", RouteParams["/my/words/:projectId"]]
      | ["/my/words/:projectId/images/:imageId", RouteParams["/my/words/:projectId/images/:imageId"]]
      | ["/pricing"]
      | ["/robots.txt"]
      | ["/sitemap.xml"]
      | ["/verify"]
  >(...args: T): typeof args[0];
}
