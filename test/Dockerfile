FROM node:20-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Git requires user identity for commits
RUN git config --global user.email "smoke-test@test.local" \
 && git config --global user.name  "Smoke Test"

# Copy project source
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src/ src/
RUN npm install && npm run build

# Copy test files
COPY test/ /app/test/

# Prepare workspace directories
RUN mkdir -p /workspace

# The log file will be written to /app/test/test-log.txt
# Mount this directory as a volume to persist the log on host
ENTRYPOINT ["bash", "/app/test/run-tests.sh"]
