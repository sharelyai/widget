/**
 * Host-asserted (RBAC) widget sessions for the playground.
 *
 * This is the same three-step flow a real embedder runs on their *server*:
 *
 *   1. POST /workspaces/:id/generate-access-key-token   (x-api-key)
 *      → an access-key token; with `roleId` the role rides in its metadata
 *   2. PUT  /workspaces/:id/activate-or-retrieve-user-space  (Bearer ak-token)
 *      → { token, spaceId }: a real user JWT carrying the role + a private
 *        space, idempotent per `userId`
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
 * A user id for the playground's test user. `activate-or-retrieve-user-space`
 * takes `userId` as a Sharely user UUID: an existing one opens that user's own
 * private space (history included), an unused one is created on the spot. The
 * role rides on the access-key token either way, so "real user *and* role" is
 * just this id plus a role-bound token.
 */
export function generateUserId(): string {
  // randomUUID needs a secure context — absent when the playground is opened
  // over plain http on a LAN address (phone testing), so fall back by hand.
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map((n) => n.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface HostSession {
  externalToken: string;
  spaceId: string;
  roleId: string;
  roleName: string;
  /** The `userId` actually sent, for display. */
  userId: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value.trim());

/**
 * The backend takes `userId` as `string().uuid()`, so a malformed value comes
 * back as a bare 400. Catch it here for a message that says what's wrong.
 * (A well-formed but unknown UUID can't be caught — that one gets created.)
 */
export class InvalidUserIdError extends Error {
  constructor() {
    super("The user id must be a UUID — check the value in Identify as.");
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
 * Steps 1–2 — a user JWT + private space carrying `role`, for the user
 * `userId` names. The role always comes from the access-key token, so any
 * user can be paired with any role.
 */
export async function createHostSession(params: {
  baseUrl: string;
  workspaceId: string;
  apiKey: string;
  role: WorkspaceRole;
  organizationId: string;
  userId: string;
}): Promise<HostSession> {
  const { baseUrl, workspaceId, apiKey, role, organizationId } = params;
  const userId = params.userId.trim();
  // Checked before spending a token mint — the backend answers a malformed
  // uuid with a bare 400 that says nothing useful.
  if (!isUuid(userId)) throw new InvalidUserIdError();

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
        body: JSON.stringify({ userId }),
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
      userId,
    };
  } catch (error) {
    // RBAC workspaces refuse role-less sessions — a distinct, friendly case.
    if (/roleId is required|RBAC/i.test((error as Error).message)) {
      throw new RoleRequiredError();
    }
    throw error;
  }
}
