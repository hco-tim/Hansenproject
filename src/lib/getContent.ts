import "server-only";
import { initialContent, type SiteContent } from "@/data/initialContent";
import fs from "fs/promises";
import path from "path";

export type GitHubContentConfig = {
  pat: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
};

export function validateContentPath(value: string) {
  const segments = value.split("/");
  if (
    !value || value.length > 200 || value.startsWith("/") || value.includes("\\") ||
    !/^[A-Za-z0-9._/-]+$/.test(value) || segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("GITHUB_PATH must be a safe relative path inside the repository.");
  }
  return value;
}

export function getGitHubContentConfig(): GitHubContentConfig | null {
  const pat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const hasAnyConfig = Boolean(pat || owner || repo);
  if (!hasAnyConfig) return null;
  if (!pat || !owner || !repo) throw new Error("Set GITHUB_PAT, GITHUB_OWNER, and GITHUB_REPO together.");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("GITHUB_OWNER or GITHUB_REPO contains invalid characters.");
  }

  // Keep CMS content and uploaded media on a dedicated branch, separate from application code.
  // GITHUB_BRANCH remains the backward-compatible fallback for existing deployments.
  const branch = process.env.GITHUB_CONTENT_BRANCH || process.env.GITHUB_BRANCH || "main";
  if (!/^[A-Za-z0-9._/-]+$/.test(branch) || branch.includes("..") || branch.startsWith("/") || branch.endsWith("/")) {
    throw new Error("GITHUB_CONTENT_BRANCH or GITHUB_BRANCH contains invalid characters.");
  }

  return {
    pat,
    owner,
    repo,
    branch,
    path: validateContentPath(process.env.GITHUB_PATH || "content.json"),
  };
}

export function getLocalContentPath(configuredPath: string) {
  const root = path.resolve(process.cwd());
  const target = path.resolve(root, validateContentPath(configuredPath));
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error("Content file path must remain inside the project directory.");
  }
  return target;
}

export function getGitHubContentFileUrl(config: GitHubContentConfig, includeBranchRef = true) {
  const encodedPath = config.path.split("/").map(encodeURIComponent).join("/");
  const url = new URL(`https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}`);
  if (includeBranchRef) url.searchParams.set("ref", config.branch);
  return url;
}

export async function getSiteContent(): Promise<SiteContent> {
  let config: GitHubContentConfig | null;
  try {
    config = getGitHubContentConfig();
  } catch (error) {
    console.error("Invalid server-side GitHub content configuration:", error);
    return initialContent;
  }

  if (config) {
    try {
      const res = await fetch(getGitHubContentFileUrl(config), {
        headers: {
          Authorization: `Bearer ${config.pat}`,
          Accept: "application/vnd.github.raw+json",
        },
        next: { revalidate: false, tags: ["site-content"] },
      });

      if (res.ok) {
        return { ...initialContent, ...JSON.parse(await res.text()) };
      }
      console.error("GitHub content read failed:", res.status, res.statusText);
    } catch (error) {
      console.error("Failed to fetch content from GitHub in getSiteContent:", error);
    }
  }

  try {
    const localFilePath = getLocalContentPath(process.env.GITHUB_PATH || "content.json");
    const fileData = await fs.readFile(localFilePath, "utf-8");
    return { ...initialContent, ...JSON.parse(fileData) };
  } catch (error) {
    console.error("Failed to read local content.json:", error);
    return initialContent;
  }
}
