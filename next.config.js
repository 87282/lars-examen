/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  typescript: {
    // TODO this is temporary. Needs to be enabled again asap
    ignoreBuildErrors: true,
  }
}
module.exports = nextConfig
