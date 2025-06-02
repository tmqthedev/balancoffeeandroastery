# Makefile for Balan Coffee & Roastery project

.PHONY: help install dev start build test clean deploy-staging deploy-production lint

# Help command
help:
	@echo "Balan Coffee & Roastery Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make install         - Install all dependencies (frontend and backend)"
	@echo "  make dev             - Start development servers (frontend and backend)"
	@echo "  make build           - Build frontend for production"
	@echo "  make start           - Start production server"
	@echo "  make test            - Run all tests"
	@echo "  make lint            - Run linting"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make deploy-staging  - Deploy to staging environment"
	@echo "  make deploy-production - Deploy to production environment"

# Install dependencies
install:
	@echo "Installing frontend dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ All dependencies installed successfully!"

# Start development servers
dev:
	@echo "Starting development servers..."
	npm run dev & cd backend && npm run dev

# Build for production
build:
	@echo "Building frontend for production..."
	npm run build
	@echo "✅ Production build complete!"

# Start production server
start:
	@echo "Starting production server..."
	cd backend && npm start

# Run tests
test:
	@echo "Running frontend tests..."
	npm test
	@echo "Running backend tests..."
	cd backend && npm test

# Run linting
lint:
	@echo "Linting frontend code..."
	npm run lint
	@echo "Linting backend code..."
	cd backend && npm run lint

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.vite
	@echo "✅ Build artifacts cleaned!"

# Deploy to staging
deploy-staging:
	@echo "Deploying to staging environment..."
	./deploy.sh staging

# Deploy to production
deploy-production:
	@echo "⚠️ Deploying to PRODUCTION environment ⚠️"
	@echo "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	./deploy.sh production
