declare module "routes-gen" {
  export type RouteParams = {
    "/": Record<string, never>;
    "/create": Record<string, never>;
    "/create/:projectId": { "projectId": string };
    "/create/:projectId/details": { "projectId": string };
    "/create/:projectId/submit": { "projectId": string };
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
      | ["/create/:projectId/details", RouteParams["/create/:projectId/details"]]
      | ["/create/:projectId/submit", RouteParams["/create/:projectId/submit"]]
      | ["/create/account"]
      | ["/login"]
      | ["/my"]
      | ["/my/words"]
      | ["/my/words/:projectId", RouteParams["/my/words/:projectId"]]
  >(...args: T): typeof args[0];
}
