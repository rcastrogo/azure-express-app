# 1. Utilizar una imagen oficial de Node.js (versión 20, requerida por tu package.json)
FROM node:20-alpine

# 2. Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# 4. Instalar únicamente las dependencias necesarias
RUN npm install --omit=dev

# 5. Copiar el resto del código del proyecto (server.js, etc.)
COPY . .

# 6. Exponer el puerto en el que escucha Express (por defecto se suele usar el 3000 o el que defina process.env.PORT)
EXPOSE 3000

# 7. Comando para iniciar la aplicación (coincide con tu script "start")
CMD ["npm", "start"]