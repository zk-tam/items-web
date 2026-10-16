export type CatalogSaveFailure = {
  error: string;
  errorId: number;
  referenceId?: string;
};

type DatabaseError = {
  code?: unknown;
};

const safeMessagePrefixes = [
  "Add a MYR price",
  "An artist can only be added once.",
  "An item can have at most",
  "An artist can have at most",
  "Artist was not found.",
  "Item was not found.",
  "Artist could not be saved.",
  "Item could not be saved.",
  "Choose at least one artist.",
  "Choose a valid visibility state.",
  "Each social link",
  "Media alt text",
  "Media order",
  "One or more existing media files",
  "One or more selected artists are unavailable.",
  "Slug ",
  "Name ",
  "Description ",
  "SEO title ",
  "SEO description ",
  "SEO page title ",
  "MYR price ",
  "USD price ",
  "Stock count ",
  "Sort order ",
  "Social link ",
  "Website ",
  "Artists "
];

function errorCode(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const { code } = error as DatabaseError;
  return typeof code === "string" ? code : null;
}

/**
 * Only messages produced by our validation/repository layer are returned to
 * the admin UI. Database and infrastructure failures remain in server logs.
 */
export function catalogSaveErrorMessage(error: unknown, entity: "artist" | "item") {
  if (errorCode(error) === "23505") {
    return "That URL handle is already in use.";
  }

  if (errorCode(error) === "23503") {
    return entity === "item"
      ? "One or more selected artists are unavailable."
      : "This artist is still referenced by another record.";
  }

  const message = error instanceof Error ? error.message.trim() : "";
  if (safeMessagePrefixes.some((prefix) => message.startsWith(prefix))) {
    return message;
  }

  return null;
}
