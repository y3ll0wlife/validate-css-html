import { error, info, isDebug, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import type { PushEvent } from "@octokit/webhooks-types";
import validateCSS from "./css.js";
import validateHTML from "./html.js";

const token = process.env.GITHUB_TOKEN;

interface Validation {
  css: {
    errors: string[];
    warnings: string[];
  };
  html: {
    errors: string[];
    warnings: string[];
  };
}

async function run() {
  try {
    if (!token) return setFailed("Invalid GITHUB_TOKEN");

    const octokit = getOctokit(token);
    const { owner, repo } = context.repo;

    if (context.eventName !== "push") return;

    const payload = context.payload as PushEvent;
    const commitSha = payload.after;

    const commit = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitSha,
    });

    const files = commit.data.files;

    if (!files) return;

    let validation: Validation = {
      css: {
        errors: [],
        warnings: [],
      },
      html: {
        errors: [],
        warnings: [],
      },
    };

    for (let file of files) {
      const fileBlob = await octokit.rest.git.getBlob({
        owner,
        repo,
        file_sha: file.sha,
      });

      const content = Buffer.from(fileBlob.data.content, "base64").toString(
        "utf8"
      );

      if (file.filename.endsWith(".css")) {
        const { warnings, errors } = await validateCSS(content);
        validation.css.errors = errors;
        validation.css.warnings = warnings;
      } else if (file.filename.endsWith(".html")) {
        const { warnings, errors } = await validateHTML(content);
        validation.html.errors = errors;
        validation.html.warnings = warnings;
      }
    }

    let msg: string[] = [];
    let problem: boolean = false;

    if (
      validation.css.errors.length > 0 ||
      validation.css.warnings.length > 0
    ) {
      problem = true;
      msg.push("# CSS Validation Problem\n");

      if (validation.css.errors.length > 0) {
        msg.push("### Errors");
        msg.push(validation.css.errors.join("\n"));
      }

      if (validation.css.warnings.length > 0) {
        msg.push("### Warnings");
        msg.push(validation.css.warnings.join("\n"));
      }
    } else if (
      validation.html.errors.length > 0 ||
      validation.html.warnings.length > 0
    ) {
      if (problem) {
        msg.push("---");
      }

      problem = true;
      msg.push("# HTML Validation Problem\n");

      if (validation.html.errors.length > 0) {
        msg.push("### Errors");
        msg.push(validation.html.errors.join("\n"));
      }

      if (validation.html.warnings.length > 0) {
        msg.push("### Warnings");
        msg.push(validation.html.warnings.join("\n"));
      }
    }

    if (problem) {
      await octokit.rest.repos.createCommitComment({
        owner,
        repo,
        commit_sha: commitSha,
        body: msg.join("\n"),
      });
      return error("Validation errors was found, commented on the commit");
    }

    return info("No validation errors was found");
  } catch (error) {
    setFailed(isDebug() ? error.stack : error.message);
  }
}
run();
