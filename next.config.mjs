/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV === "development";
// dev and build use separate output folders, so `npm run build` never breaks a running dev server.
// Build = static export into out/: plain files, no server functions, hosted on Cloudflare Pages (see DEPLOY.md).
export default { reactStrictMode: true, distDir: dev ? ".next-dev" : ".next", ...(dev ? {} : { output: "export" }) };
