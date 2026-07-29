/**
 * Host-asserted (RBAC) widget sessions for the playground.
 *
 * This is the same three-step flow a real embedder runs on their *server*:
 *
 *   1. POST /workspaces/:id/generate-access-key-token   (x-api-key)
 *      → an access-key token; with `roleId` the role rides in its metadata
 *   2. PUT  /workspaces/:id/activate-or-retrieve-user-space  (Bearer ak-token)
 *      → { token, spaceId }: a real user JWT carrying the role + a private
 *        space, idempotent per `customerIdString`
 *   3. hand the widget externalToken + spaceId
 *
 * Roles are listed through the API-key surface (`GET /v1/workspaces/:id/role`,
 * Bearer ak-token), so a workspace API key is all the playground needs.
 *
 * The playground does this in the browser on purpose — paste a key, switch
 * roles, see what each one retrieves. A production embed must keep the API key
 * on the server and ship only the minted externalToken to the page.
 */

export interface WorkspaceRole {
  id: string;
  name: string;
  description?: string | null;
}

export interface WorkspaceMeta {
  organizationId: string;
  rbacEnabled: boolean;
}

/**
 * Who the session is for. `activate-or-retrieve-user-space` takes either
 * identifier and the role rides on the token regardless — so "logged-in user
 * *and* role" is just `userId` plus a role-bound access-key token.
 *
 * - `customerIdString` — your own user key (email, CRM id, anything stable).
 *   Sharely creates a user keyed to it on first use and reuses it after.
 * - `userId` — an existing Sharely user **UUID**. The session then opens that
 *   user's own private space, history included.
 */
export type IdentityMode = "customerIdString" | "userId";

export interface Identity {
  mode: IdentityMode;
  /** Empty means "per-role playground identity" — see `identityBody`. */
  value: string;
}

export interface HostSession {
  externalToken: string;
  spaceId: string;
  roleId: string;
  roleName: string;
  /** The identifier actually sent, for display. */
  identityLabel: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value.trim());

/**
 * A `userId` that doesn't exist is **created** by the backend rather than
 * rejected, so a typo silently mints a ghost user. Refuse anything that isn't
 * a UUID before it reaches the API.
 */
export class InvalidUserIdError extends Error {
  constructor() {
    super(
      "A Sharely user id must be a UUID — check the value, or use Custom id.",
    );
    this.name = "InvalidUserIdError";
  }
}

/** RBAC is ACTIVE on the workspace, so a role-less session is refused. */
export class RoleRequiredError extends Error {
  constructor() {
    super("This workspace has RBAC enabled — pick a role to start a session.");
    this.name = "RoleRequiredError";
  }
}

const trimBase = (baseUrl: string) =>
  (baseUrl || "https://api.sharely.ai").replace(/\/+$/, "");

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error(`Couldn't reach ${new URL(url).origin}`);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // be answers `{ error }` on 400s and bare 500s alike.
    throw new Error(
      (body as { error?: string } | null)?.error ||
        `HTTP ${res.status} ${res.statusText}`,
    );
  }
  return body as T;
}

/**
 * Public workspace read — no auth. Gives us the organizationId every
 * `/workspaces/:id/*` call needs in its `organizationid` header, plus whether
 * RBAC is switched on.
 */
export async function fetchWorkspaceMeta(
  baseUrl: string,
  workspaceId: string,
): Promise<WorkspaceMeta> {
  const ws = await request<{ organizationId?: string; rbacStatus?: string }>(
    `${trimBase(baseUrl)}/workspaces/${workspaceId}`,
  );
  if (!ws?.organizationId) {
    throw new Error("Workspace has no organization — check the workspace ID");
  }
  return {
    organizationId: ws.organizationId,
    rbacEnabled: ws.rbacStatus === "ACTIVE",
  };
}

/** Step 1 — mint an access-key token, role-bound when `roleId` is given. */
async function mintAccessKeyToken(
  baseUrl: string,
  workspaceId: string,
  apiKey: string,
  roleId?: string,
): Promise<string> {
  const res = await request<{ token?: string }>(
    `${trimBase(baseUrl)}/workspaces/${workspaceId}/generate-access-key-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(roleId ? { roleId } : {}),
    },
  );
  if (!res?.token)
    throw new Error("No token in generate-access-key-token response");
  return res.token;
}

/** The workspace's RBAC roles, read with the API key. */
export async function listRoles(
  baseUrl: string,
  workspaceId: string,
  apiKey: string,
  meta: WorkspaceMeta,
): Promise<WorkspaceRole[]> {
  const akToken = await mintAccessKeyToken(baseUrl, workspaceId, apiKey);
  const roles = await request<WorkspaceRole[]>(
    `${trimBase(baseUrl)}/v1/workspaces/${workspaceId}/role`,
    {
      headers: {
        Authorization: `Bearer ${akToken}`,
        organizationid: meta.organizationId,
      },
    },
  );
  return Array.isArray(roles) ? roles : [];
}

/**
 * The `{ customerIdString }` / `{ userId }` body plus a human label for it.
 * With no identity given we fall back to a per-role playground key, so
 * re-picking a role reuses its space instead of piling up empty ones.
 */
function identityBody(role: WorkspaceRole, identity?: Identity) {
  const value = identity?.value.trim() ?? "";
  if (!value) {
    return {
      body: { customerIdString: `playground-${role.id}` },
      label: `playground-${role.id}`,
    };
  }
  if (identity?.mode === "userId") {
    if (!isUuid(value)) throw new InvalidUserIdError();
    return { body: { userId: value }, label: value };
  }
  return { body: { customerIdString: value }, label: value };
}

/**
 * Steps 1–2 — a user JWT + private space carrying `role`, for whoever
 * `identity` names. The role always comes from the access-key token, so any
 * identity can be paired with any role.
 */
export async function createHostSession(params: {
  baseUrl: string;
  workspaceId: string;
  apiKey: string;
  role: WorkspaceRole;
  organizationId: string;
  identity?: Identity;
}): Promise<HostSession> {
  const { baseUrl, workspaceId, apiKey, role, organizationId, identity } =
    params;
  // Throws before any request when the id is malformed — the backend would
  // happily create a user for it instead of complaining.
  const { body, label } = identityBody(role, identity);

  const akToken = await mintAccessKeyToken(
    baseUrl,
    workspaceId,
    apiKey,
    role.id,
  );

  try {
    const session = await request<{ token?: string; spaceId?: string }>(
      `${trimBase(baseUrl)}/workspaces/${workspaceId}/activate-or-retrieve-user-space`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${akToken}`,
          organizationid: organizationId,
        },
        body: JSON.stringify(body),
      },
    );
    if (!session?.token || !session?.spaceId) {
      throw new Error(
        "No token/spaceId in activate-or-retrieve-user-space response",
      );
    }
    return {
      externalToken: session.token,
      spaceId: session.spaceId,
      roleId: role.id,
      roleName: role.name,
      identityLabel: label,
    };
  } catch (error) {
    // RBAC workspaces refuse role-less sessions — a distinct, friendly case.
    if (/roleId is required|RBAC/i.test((error as Error).message)) {
      throw new RoleRequiredError();
    }
    throw error;
  }
}
