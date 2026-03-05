# ==========================================
# Etapa 1: Construcción (Builder)
# ==========================================
FROM node:20-alpine AS builder

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo las de desarrollo necesarias para compilar)
RUN npm ci

# Copiamos todo el código fuente
COPY . .

# Compilamos el proyecto (genera la carpeta /dist)
RUN npm run build

# ==========================================
# Etapa 2: Producción
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos solo los archivos de dependencias
COPY package*.json ./

# Instalamos SOLO las dependencias de producción (hace la imagen mucho más ligera)
RUN npm ci --omit=dev

# Copiamos el código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponemos el puerto que usa NestJS
EXPOSE 3000

# Comando para arrancar la aplicación en producción
CMD ["node", "dist/main"]