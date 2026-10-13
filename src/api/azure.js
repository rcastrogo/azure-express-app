// @ts-nocheck

import { responseWrapper } from '../lib/response.js';


function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const AZURE_LOCATION = process.env.AZURE_LOCATION || 'swedencentral';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://ai-azure-rcastrogo.services.ai.azure.com/openai/v1'; 
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'Phi-4-reasoning';

// ---------- Azure Translator ----------
const AZURE_TRANSLATOR_KEY = AZURE_OPENAI_KEY;
const AZURE_TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://ai-azure-rcastrogo.cognitiveservices.azure.com/';
const AZURE_TRANSLATOR_API_VERSION = process.env.AZURE_TRANSLATOR_API_VERSION || '2025-10-01-preview';

async function invokeModel(payload) {
  if (!AZURE_OPENAI_KEY) {
    throw new Error('AZURE_OPENAI_KEY no está definida en las variables de entorno.');
  }
  if (!AZURE_OPENAI_ENDPOINT) {
    throw new Error('AZURE_OPENAI_ENDPOINT no está definida en las variables de entorno.');
  }

  const deploymentName = payload.model || AZURE_OPENAI_DEPLOYMENT;
  const cleanEndpoint = AZURE_OPENAI_ENDPOINT.replace(/\/$/, '');
  const azureUrl = `${cleanEndpoint}/chat/completions`;

  const azurePayload = {
    ...payload,
    model: deploymentName
  };

  console.log('Invocando Azure AI con payload:', azurePayload);

  const response = await fetch(azureUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AZURE_OPENAI_KEY}`,
      'api-key': AZURE_OPENAI_KEY, // Enviamos ambas para máxima compatibilidad
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(azurePayload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || 'desconocido';
      throw new Error(`Rate limit de Azure excedido. Reintentar en ${retryAfter} segundos.`);
    }
    throw new Error(`Azure AI Error (${response.status}): ${err?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  return message ?? {};
}


export default async function handler(req, res) {
  // =========================================================
  // Cabeceras CORS
  // =========================================================
  setCorsHeaders(res);

  // =========================================================
  // Respuesta inmediata para peticiones Preflight CORS
  // =========================================================
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { 
    ok, 
    methodNotAllowed, 
    serverError 
  } = responseWrapper.wrap(res);

  try {   
    if (req.method === 'POST') {
      // console.log('Azure AI - Invocando modelo con payload:', req.body);      
      const { action, ...rest } = req.body || {};
      // ================================================================================
      // Traducción: { "action": "translate", "text": "...", "to": "es", "from": "en" }
      // ================================================================================
      // if (action === 'translate') {
      //   const result = await translateText(rest);
      //   return ok(result);
      // }
      // ================================================================================
      // Invocación general del modelo de Azure AI
      // ================================================================================
      const result = await invokeModel(req.body);
      // console.log('Azure AI - Resultado recibido:', result);
      return ok(result);
    }
    return methodNotAllowed();
  } catch (error) {
    console.error('Error en Azure AI:', error);
    return serverError();
  }
}