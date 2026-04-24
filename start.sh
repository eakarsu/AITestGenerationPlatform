#!/bin/bash

# ============================================
# AI Test Generation Platform - Start Script
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║       AI Test Generation Platform                 ║"
echo "║       Starting Application...                     ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Step 1: Clean used ports ----
echo -e "${YELLOW}[1/6] Cleaning used ports...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ---- Step 2: Check PostgreSQL ----
echo -e "\n${YELLOW}[2/6] Checking PostgreSQL...${NC}"

if command -v pg_isready &> /dev/null; then
  if pg_isready -q 2>/dev/null; then
    echo -e "  ${GREEN}PostgreSQL is running${NC}"
  else
    echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -q 2>/dev/null; then
      echo -e "  ${GREEN}PostgreSQL started${NC}"
    else
      echo -e "  ${RED}PostgreSQL not ready - please start it manually${NC}"
      echo -e "  ${YELLOW}Try: brew services start postgresql${NC}"
    fi
  fi
else
  echo -e "  ${YELLOW}pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# ---- Step 3: Create database ----
echo -e "\n${YELLOW}[3/6] Setting up database...${NC}"

# Source .env variables
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs 2>/dev/null) || true
fi

DB_NAME=${DB_NAME:-ai_test_platform}
DB_USER=${DB_USER:-postgres}

# Create database if not exists
createdb "$DB_NAME" 2>/dev/null && echo -e "  ${GREEN}Database '$DB_NAME' created${NC}" || echo -e "  ${CYAN}Database '$DB_NAME' already exists${NC}"

# ---- Step 4: Install dependencies ----
echo -e "\n${YELLOW}[4/6] Installing dependencies...${NC}"

cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo -e "  ${CYAN}Installing backend dependencies...${NC}"
  npm install --silent 2>&1 | tail -1
else
  echo -e "  ${GREEN}Backend dependencies up to date${NC}"
fi

cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo -e "  ${CYAN}Installing frontend dependencies...${NC}"
  npm install --silent 2>&1 | tail -1
else
  echo -e "  ${GREEN}Frontend dependencies up to date${NC}"
fi

# ---- Step 5: Seed database ----
echo -e "\n${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seed.js
echo -e "  ${GREEN}Database seeded successfully${NC}"

# ---- Step 6: Start services with hot reload ----
echo -e "\n${YELLOW}[6/6] Starting services with hot reload...${NC}"

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
echo -e "  ${CYAN}Starting backend on port $BACKEND_PORT (with hot reload)...${NC}"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with React dev server (built-in hot reload)
cd "$PROJECT_DIR/frontend"
echo -e "  ${CYAN}Starting frontend on port $FRONTEND_PORT (with hot reload)...${NC}"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!

# Wait for services
sleep 3

echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║  AI Test Generation Platform is RUNNING!          ║"
echo "║                                                   ║"
echo "║  Frontend:  http://localhost:$FRONTEND_PORT            ║"
echo "║  Backend:   http://localhost:$BACKEND_PORT            ║"
echo "║                                                   ║"
echo "║  Demo Login:                                      ║"
echo "║    Email:    demo@testgen.ai                      ║"
echo "║    Password: demo123                              ║"
echo "║                                                   ║"
echo "║  Hot reload is enabled for both services          ║"
echo "║  Press Ctrl+C to stop all services                ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Trap Ctrl+C to clean up
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
