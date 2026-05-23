# Usamos Node.js versión 20 (ligera)
FROM node:20-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero el package.json (para caché eficiente)
COPY package*.json ./

# Instalamos dependencias
RUN npm install --production

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa este servicio
EXPOSE 4000

# Comando para iniciar
CMD ["node", "src/index.js"]