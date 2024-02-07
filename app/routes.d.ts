declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/create": Record<string, never>;
    "/create/:projectId": { "projectId": string };
    "/create/:projectId/brush/:templateId": { "projectId": string, "templateId": string };
    "/create/:projectId/brush/:templateId/details": { "projectId": string, "templateId": string };
    "/create/:projectId/brush/:templateId/submit": { "projectId": string, "templateId": string };
    "/create/account": Record<string, never>;
    "/login": Record<string, never>;
    "/my": Record<string, never>;
    "/my/words": Record<string, never>;
    "/my/words/:projectId": { "projectId": string };
  };

  export function route<
    T extends
      | ["/"]
      | ["/create"]
      | ["/create/:projectId", RouteParams["/create/:projectId"]]
      | ["/create/:projectId/brush/:templateId", RouteParams["/create/:projectId/brush/:templateId"]]
      | ["/create/:projectId/brush/:templateId/details", RouteParams["/create/:projectId/brush/:templateId/details"]]
      | ["/create/:projectId/brush/:templateId/submit", RouteParams["/create/:projectId/brush/:templateId/submit"]]
      | ["/create/account"]
      | ["/login"]
      | ["/my"]
      | ["/my/words"]
      | ["/my/words/:projectId", RouteParams["/my/words/:projectId"]]
  >(...args: T): typeof args[0];
}
