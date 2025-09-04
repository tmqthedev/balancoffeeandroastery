# Copilot Instructions for Coffee E-commerce Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack e-commerce website with blog integration for a coffee roastery business. The project includes:

### Frontend
- **Technology**: React with Vite, Tailwind CSS
- **Features**: Vietnamese language interface, responsive design, SEO optimization
- **Color Scheme**: Coffee tones (brown, cream, yellow) for elegant, minimalist design
- **Key Libraries**: React Router, React Helmet, Axios

### Backend
- **Technology**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with local authentication only
- **Payment**: Contact-based payment integration
- **Security**: Helmet, CORS, rate limiting, input validation

### Database Schema
Key collections: Users, Products, Orders, Blogs, Contacts (MongoDB)

### Third-party Integrations
- Google Maps for store location
- Analytics: Google Analytics 4, Google Search Console, TikTok Pixel

## Development Guidelines
1. **Code Style**: Use modern ES6+ syntax, functional components with hooks
2. **Security**: Always validate input, use parameterized queries, implement rate limiting
3. **SEO**: Include proper meta tags, structured data, sitemap.xml, robots.txt
4. **Performance**: Optimize images, lazy loading, code splitting
5. **Accessibility**: Follow WCAG guidelines, semantic HTML, proper ARIA labels
6. **Language**: All user-facing text is in Vietnamese

## Target Keywords
Focus on Vietnamese coffee terms: "cà phê rang mộc", "Arabica Cầu Đất", "Arabica Typica Kongo", "Robusta Lâm Đồng", "coffee and roastery", "mua hạt cà phê nguyên chất"

## File Structure
- `/src` - React frontend source code
- `/backend` - Node.js Express API server
- `/public` - Static assets and SEO files

When generating code, prioritize security, performance, and SEO best practices.
