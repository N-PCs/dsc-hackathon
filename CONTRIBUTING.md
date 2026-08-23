# Contributing to Origin Hackathon Portal

Thank you for considering contributing! This project helps manage hackathon team registration, verification, and project submissions. Please read the following guidelines to help make the contribution process smooth.

## Development Setup

1. **Fork the repository** and clone your fork
2. **Create a branch** for your feature/bugfix: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Make your changes** following the code conventions in the project
5. **Test your changes** locally: `npm run dev`
6. **Commit your changes**: `git commit -m 'Add some amazing feature'`
7. **Push to your branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request** against the main repository

## Code Conventions

- Follow the existing TypeScript style throughout the codebase
- Use functional components with hooks in React
- Keep API route handlers clean and focused
- Add appropriate comments for complex logic
- Maintain the 10MB file size limit enforcement for all uploads
- Ensure all environment variables are properly typed

## Adding New Features

1. **Backend** (`server/`): Add new API routes in `server.ts`, update database operations in `db.ts`
2. **Frontend** (`src/components/`): Create new components or extend existing ones
3. **Types** (`src/types.ts`): Update interfaces if new data structures are needed
4. **Environment** (`.env`): Add any required API keys or configuration

## Upload Functionality

- All file uploads go through `/api/upload` endpoint
- Maximum file size: 10MB
- Supported resource types: `image` (for payment screenshots), `raw` (for PDFs/PPTs)
- Fallback to local storage if Imagekit keys are not configured
- Uploaded files return `{ url, publicId, format }` from Imagekit API

## Admin Workflow

- Admin authentication via OTP sent to authorized emails
- Admins can: verify teams, reject teams, check-in teams, issue tickets, assign scores
- Project submission is gated: teams must have `paymentStatus: 'verified'` first
- All status changes tracked in Neon PostgreSQL

## Reporting Bugs

1. Check existing issues first
2. Open a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, browser, Node version)

## Pull Request Checklist

- [ ] Code follows project style conventions
- [ ] No existing Cloudinary references remain
- [ ] Imagekit integration works correctly
- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass if applicable
- [ ] Documentation updated if needed