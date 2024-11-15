# Changelog App 

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`c3`](https://developers.cloudflare.com/pages/get-started/c3) that provides a modern changelog and updates tracking system.

## Features

- Timeline-based changelog display
- Twitter integration for embedding tweets
- Authentication support
- Interactive UI components 
- New log entry creation interface
- Cloudflare Pages deployment ready

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The application is organized as follows:

- `/app` - Main application code
  - `/api` - API routes including authentication endpoints
  - `/components` - React components including UI elements
  - `/lib` - Utility functions and configuration
  - `/types` - TypeScript type definitions
- `/public` - Static assets
- `/workers` - Cloudflare Workers code

## Cloudflare Integration

This project includes full Cloudflare Pages integration with the following scripts:

- `pages:build` - Build the application for Pages using [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages)
- `preview` - Local preview using [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- `deploy` - Deploy to Pages using Wrangler

> **Note:** While the `dev` script is optimal for local development, you should periodically preview your Pages application to ensure compatibility with the Pages environment. See the [`@cloudflare/next-on-pages` recommended workflow](https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md#recommended-development-workflow) for more details.

### Bindings

[Cloudflare Bindings](https://developers.cloudflare.com/pages/functions/bindings/) allow interaction with Cloudflare Platform resources. They can be used in:

1. Development mode - Configure in `next.config.js` under `setupDevBindings`
2. Preview mode - Add to the `pages:preview` script according to `wrangler pages dev`
3. Production - Configure in the Cloudflare [dashboard](https://dash.cloudflare.com/)

For detailed configuration instructions, see:
- [Next-on-Pages Documentation](https://github.com/cloudflare/next-on-pages/blob/05b6256/internal-packages/next-dev/README.md)
- [Wrangler Command Documentation](https://developers.cloudflare.com/workers/wrangler/commands/#dev-1)
- [Pages Bindings Documentation](https://developers.cloudflare.com/pages/functions/bindings/)

## Authentication

The app includes authentication support through NextAuth.js. Configuration can be found in `/app/lib/authOptions.ts`.

## UI Components

The project includes several reusable UI components:

- Timeline display
- Changelog items
- Input fields with modern styling
- Tweet embedding functionality
- Form components

## Development

For local development:

1. Clone the repository
2. Install dependencies with your preferred package manager
3. Configure environment variables
4. Run the development server
5. Make changes and preview using the Pages preview functionality before deployment

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
