# Smithery Support Email

## Email Details

**To:** support@smithery.ai
**Subject:** TypeScript Runtime Deployment Failure - keytar/libsecret Error

---

## Email Body

Hello Smithery Support Team,

I'm experiencing a persistent deployment failure with my MCP server that was **previously working successfully** on your platform. This appears to be related to a change in the Smithery TypeScript runtime environment rather than an issue with my code.

### Issue Summary

My MCP server "palette-mcp" ([@Opti-kjh/palette](https://smithery.ai/server/@Opti-kjh/palette)) is failing to deploy with a `libsecret-1.so.0` error during the `@smithery/cli build` step.

**The critical finding:** The same commit (809613a) that successfully deployed on **December 11, 2025** now fails to deploy with the identical error.

### Error Details

**Error Message:**
```
Error: libsecret-1.so.0: cannot open shared object file: No such file or directory
    at Object..node (node:internal/modules/cjs/loader:1865:18)
    at Module.load (node:internal/modules/cjs/loader:1441:32)
    ...
    at Object.<anonymous> (/root/.npm/_npx/2d0620bb1d41b604/node_modules/keytar/lib/keytar.js:1:14)
```

**Build Stage:**
- Fails at: `RUN npx -y @smithery/cli build -o .smithery/index.cjs`
- Runtime: TypeScript
- Node Version: v22.21.1

### Timeline Evidence

| Date | Commit | Result | Quality Score |
|------|--------|--------|---------------|
| Dec 11, 2025 | 809613a | ✅ **Success** | 88/100 |
| Jan 6, 2026 | 809613a | ❌ **Failed** | keytar error |

**Screenshot attached:** Shows successful deployment details from December 11, 2025.

### What We've Tried

Over the past day, we attempted multiple workarounds, all unsuccessful:
- Added `.npmrc` with `omit=optional`
- Added `package.json` resolutions to replace keytar with noop-package
- Switched between TypeScript and Container runtimes
- Created custom Dockerfile with libsecret-1-0 installed
- Removed all optional dependencies

**None of these worked**, because the error occurs in `@smithery/cli` itself, not our code.

### Question

**Has there been a recent change to the Smithery TypeScript runtime or `@smithery/cli` that introduced a keytar dependency?**

The fact that our unchanged code (809613a) worked in December but fails now strongly suggests an infrastructure change on the Smithery side between December 11, 2025, and January 6, 2026.

### Repository Information

- **GitHub:** https://github.com/Opti-kjh/palette
- **Smithery:** https://smithery.ai/server/@Opti-kjh/palette
- **Last Successful Commit:** 809613a
- **Current Main Branch:** Same codebase, different commits attempted

### Request

Could you please:
1. Investigate if there were changes to the TypeScript runtime or `@smithery/cli` in late December 2025?
2. Advise on how to resolve the keytar/libsecret dependency issue?
3. Let us know if there's a recommended approach for TypeScript runtime deployments going forward?

We'd love to continue using Smithery for hosting our MCP server, as the platform experience was excellent when it was working!

### Additional Context

Our MCP server converts Figma designs to React/Vue components using a design system. It uses:
- `@modelcontextprotocol/sdk`: ^1.20.0
- `@smithery/sdk`: ^2.1.0
- No native dependencies in our own code
- TypeScript with ESM modules

Thank you for your assistance! Please let me know if you need any additional information or logs.

Best regards,
KJH
GitHub: @Opti-kjh
Email: kjh@deali.net

---

## Attachments

1. Screenshot of successful deployment (Dec 11, 2025) showing Quality Score 88
2. Recent deployment log showing keytar error (available upon request)
