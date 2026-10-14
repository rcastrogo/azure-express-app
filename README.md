# Express en Azure App Service

Guía rápida para ejecutar la aplicación localmente y administrar su contenedor Docker.

## 1. Preparar el entorno

Requisitos: Node.js 20 o superior y Docker si se va a usar la opción de contenedor.

Instala las dependencias:

```powershell
npm install
```

Para usar Azure AI, crea un archivo `.env` en la raíz del proyecto. No publiques este archivo ni incluyas claves en el repositorio.

```dotenv
AZURE_OPENAI_KEY=tu_clave
AZURE_OPENAI_ENDPOINT=https://ai-azure-rcastrogo.services.ai.azure.com/openai/v1
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini
```

## 2. Ejecutar en local

Inicia el servidor en modo desarrollo. El comando carga las variables de `.env` y escucha en el puerto `3000`:

```powershell
npm run dev
```

Abre `http://localhost:3000`. Para iniciar sin el modo de recarga de desarrollo:

```powershell
npm start
```

Nota: `npm start` no carga `.env`; define las variables en el entorno antes de usarlo.

## 3. Rutas disponibles

| Ruta | Uso |
| --- | --- |
| `/` | Aplicación web estática |
| `/api/hello` | Respuesta JSON de ejemplo |
| `/api/azure` | Solicitudes `POST` a Azure AI |
| `/health` | Estado y tiempo de actividad del servidor |

## 4. Crear y ejecutar la imagen Docker

Construye la imagen desde la raíz del proyecto:

```powershell
docker build -t azure-express-app .
```

Inicia el contenedor en segundo plano. El puerto local `4000` se dirige al puerto `3000` de la aplicación, y las variables se leen de `.env`:

```powershell
docker run -d -p 4000:3000 --env-file .env --name mi-app-express azure-express-app
```

Comprueba el estado en `http://localhost:4000/health`.

## 5. Consultar y detener el contenedor

Ver los contenedores en ejecución:

```powershell
docker ps
```

Seguir los logs para revisar el arranque y detectar errores:

```powershell
docker logs -f mi-app-express
```

Detener el contenedor y eliminarlo cuando ya esté parado:

```powershell
docker stop mi-app-express
docker rm mi-app-express
```

Para detenerlo y eliminarlo en una sola operación:

```powershell
docker rm -f mi-app-express
```


## 6. Etiquetar y publicar la imagen en Docker Hub

Para subir la imagen a un registro público (como Docker Hub) y evitar costes en Azure Container Registry (ACR):

Inicia sesión en Docker Hub desde la terminal (si usas autenticación por Google u OAuth, recuerda generar y utilizar un Personal Access Token como contraseña):

```powershell
docker login
```
Etiqueta tu imagen local añadiendo tu nombre de usuario de Docker Hub:

```powershell
docker tag azure-express-app tu-usuario-dockerhub/azure-express-app:latest
```
Sube la imagen a la nube:

```powershell
docker push tu-usuario-dockerhub/azure-express-app:latest
```
Una vez completado, podrás desplegar esta imagen directamente en servicios de Azure compatibles con contenedores públicos (como Azure App Service Plan F1).
