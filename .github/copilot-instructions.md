# Copilot Instructions for Coffee E-commerce Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack e-commerce website with blog integration for a coffee roastery business. The project includes:

### Frontend
- **Technology**: React with Vite, Tailwind CSS
- **Features**: Multilingual support (English/Vietnamese), responsive design, SEO optimization
- **Color Scheme**: Coffee tones (brown, cream, yellow) for elegant, minimalist design
- **Key Libraries**: React Router, i18next, React Helmet, Axios

### Backend
- **Technology**: Node.js with Express
- **Database**: Microsoft SQL Server (MSSQL)
- **Authentication**: Passport.js with local and Facebook OAuth
- **Payment**: Momo and VN-Pay integration
- **Security**: Helmet, CORS, rate limiting, input validation

### Database Schema
Key tables: Users, Products, Orders, Order_Products, Blogs, Contacts

### Third-party Integrations
- Google Maps for store location
- Facebook API for login and blog sharing
- Analytics: Google Analytics 4, Google Search Console, Meta Pixel, TikTok Pixel

## Development Guidelines
1. **Code Style**: Use modern ES6+ syntax, functional components with hooks
2. **Security**: Always validate input, use parameterized queries, implement rate limiting
3. **SEO**: Include proper meta tags, structured data, sitemap.xml, robots.txt
4. **Performance**: Optimize images, lazy loading, code splitting
5. **Accessibility**: Follow WCAG guidelines, semantic HTML, proper ARIA labels
6. **Internationalization**: Use i18next keys for all user-facing text

## Target Keywords
Focus on Vietnamese coffee terms: "cà phê rang mộc", "Arabica Cầu Đất", "Arabica Typica Kongo", "Robusta Lâm Đồng", "coffee and roastery", "mua hạt cà phê nguyên chất"

## File Structure
- `/src` - React frontend source code
- `/backend` - Node.js Express API server
- `/database` - SQL scripts and schema definitions
- `/public` - Static assets and SEO files

When generating code, prioritize security, performance, and SEO best practices.
