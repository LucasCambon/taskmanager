# Usar una imagen base oficial de Node.js
FROM node:20.13.1-alpine3.20

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Ejecutar migraciones
RUN npx sequelize-cli db:migrate

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación
EXPOSE 3000

# Comando para correr la aplicación
CMD ["node", "src/app.js"]