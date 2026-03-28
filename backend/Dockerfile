FROM node:20-alpine

# Installer OpenSSL et les dépendances nécessaires pour Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer TOUTES les dépendances (y compris devDependencies pour TypeScript)
RUN npm install --include=dev

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src/
COPY tsconfig.json ./

# Compiler TypeScript
RUN npx tsc

# Exposer le port
EXPOSE 3001

# Commande de démarrage : migration DB puis démarrage
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
