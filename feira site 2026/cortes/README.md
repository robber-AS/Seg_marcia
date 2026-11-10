# Gerador Automático de Cortes para YouTube - V1

## Visão Geral

Esta aplicação web recebe um link de vídeo do YouTube e gera automaticamente cortes curtos para redes sociais, usando IA para identificar os melhores momentos, transcrição e processamento de vídeo com FFmpeg.

## Stack Tecnológica

### Frontend
- React
- Vite
- TypeScript
- Sass

### Backend
- Node.js
- Express

### Processamento
- FFmpeg (via fluent-ffmpeg)

### Banco de Dados
- Supabase / PostgreSQL

### IA
- OpenAI (Whisper para transcrição, GPT para análise)

## Estrutura do Projeto

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       │   ├── youtube/
│       │   ├── transcription/
│       │   ├── ai/
│       │   ├── video/
│       │   └── subtitles/
│       ├── jobs/
│       └── utils/
│
├── .env.example
└── README.md
```

## ETAPAS DE IMPLEMENTAÇÃO

A aplicação foi desenvolvida em 14 etapas, seguindo a ordem especificada:

### ETAPA 1: Criar projeto React + Vite
- `cd frontend && npm create vite@latest . -- --template react-ts`
- `npm install`
- `npm run dev`

### ETAPA 2: Criar backend Node + Express
- `cd backend && npm init -y`
- `npm install express cors dotenv`
- `npm install @supabase/supabase-js fluent-ffmpeg @ffmpeg-installer/ffmpeg openai`
- Criar estrutura de pastas em `backend/src/`
- Implementar `index.js`, rotas e controladores

### ETAPA 3: Criar interface para inserir URL
- Componente `App.tsx` com campo de entrada de URL
- Estilização moderna com CSS

### ETAPA 4: Criar validação do YouTube
- Serviço `YouTubeService` na pasta `backend/src/services/youtube/`
- Validação de padrões `youtube.com/watch?v=...` e `youtu.be/`
- Endpoint `POST /api/projects/validate`

### ETAPA 5: Implementar pipeline de vídeo
- Serviço `VideoProcessingService` para operações FFmpeg
- Corte de vídeos, extração de áudio, redimensionamento

### ETAPA 6: Implementar transcrição
- Serviço `TranscriptionService` usando Whisper da OpenAI
- Retorna segments com timestamps preservados
- Endpoint integração no pipeline de processamento

### ETAPA 7: Implementar análise com IA
- Serviço `ClipAnalysisService` usando GPT-4o-mini
- Envia transcrição para IA e recebe sugestões de cortes
- Cada corte possui: title, start, end, duration, reason

### ETAPA 8: Implementar seleção de cortes
- IA seleciona 3-5 clips por vídeo
- Critérios: início interessante, conteúdo útil, frases de impacto
- Garantir duração entre 30-90 segundos

### ETAPA 9: Implementar FFmpeg para cortes
- Comandos centralizados no `VideoProcessingService`
- Corte de vídeo, resize para vertical, adição de legendas

### ETAPA 10: Implementar legendas
- Geração de arquivos `.srt` a partir de timestamps
- Aplicação de legendas no vídeo via FFmpeg
- Estilo: branco, negrito, centralizado, fundo com contraste

### ETAPA 11: Implementar conversão 9:16
- Redimensionamento de 1080x1920
- Padding central quando necessário
- Manela proporção sem distorcer imagem

### ETAPA 12: Implementar preview e download
- Componente de preview de vídeo com `<video controls>`
- Botão de download para cada corte
- armazenamento no Supabase Storage

### ETAPA 13: Integrar Supabase
- Tabelas no Supabase:
  - `projects`: id, youtube_url, status, created_at
  - `clips`: id, project_id, title, start_time, end_time, duration, video_url, subtitle_url, created_at
  - `transcriptions`: id, project_id, content, created_at
- Storage organizacao:
  - projects/{projectId}/original/
  - projects/{projectId}/audio/
  - projects/{projectId}/clips/
  - projects/{projectId}/subtitles/

### ETAPA 14: Testar todo o fluxo
- Testar validação de URL
- Testar criação de projeto
- Testar processamento completo (simulado)
- Verificar geração de clips e legendas

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz e nas pastas `frontend/` e `backend/`:

```
# Backend
PORT=3000
SUPABASE_URL=sua-url-do-supabase
SUPABASE_ANON_KEY=sua-key-anon
SUPABASE_SERVICE_ROLE_KEY=sua-key-service-role
AI_API_KEY=sua-chave-da-ia

# Frontend
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-key-anon

# Storage
STORAGE_BUCKET=seu-bucket
```

**Nunca colocar secrets no código ou enviar para o frontend.**

## Execução

### Backend
```
cd backend
npm install
node index.js
```

### Frontend
```
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` para usar a aplicação.

## Fluxo Mínimo Obrigatório

```
YouTube URL
     ↓
Transcrição
     ↓
IA encontra trechos
     ↓
3-5 cortes
     ↓
30-90 segundos
     ↓
Legendas
     ↓
9:16
     ↓
Preview
     ↓
Download
```

## Segurança

- Validação de URL no backend
- Limite de requisições por IP
- Limite de tamanho de upload
- Sanitização de arquivos
- Secrets apenas no backend (variáveis de ambiente)
- Proteção de rotas

## Testes

Criar testes para:
- Validação do link YouTube
- Duração dos cortes (clip.duration >= 30 e <= 90)
- Geração das legendas
- API endpoints
- Tratamento de erros
- Processamento do vídeo

Pelo menos um teste garantindo:
```javascript
expect(clip.duration).toBeGreaterThanOrEqual(30);
expect(clip.duration).toBeLessThanOrEqual(90);
```