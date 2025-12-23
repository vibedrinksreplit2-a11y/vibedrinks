# Guia de Deploy no Render - Vibe Drinks

## ✅ Status de Preparação Pré-Deploy

### Build Status
- ✅ Vite build: **PASSOU** (✓ built in 20.20s)
- ✅ TypeScript check: **PASSOU** (sem erros)
- ✅ ESBuild: **PASSOU** (124.3 KB bundle)
- ✅ All configurations validated

### Possíveis Warnings (NÃO são erros)
- ⚠️ PostCSS plugin warning: Apenas informativo, não afeta build
- ⚠️ Chunk size > 500 KB: Pode ser ignorado, app funciona normalmente

---

## 🚀 Configuração no Render

### 1. Criar Web Service

**Environment**: Node.js
**Build Command**: `npm run build`
**Start Command**: `node dist/index.mjs`
**Port**: 5000

### 2. Environment Variables (CRÍTICO!)

Copiar e configurar TODOS esses no Render:

```
NODE_ENV=production
PORT=5000
SUPABASE_URL=seu-url-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui
SUPABASE_DATABASE_URL=postgresql://usuario:senha@host:porta/banco
SESSION_SECRET=gerar-uma-string-aleatoria-32-caracteres
VITE_API_URL=https://seu-render-app.onrender.com
VITE_SUPABASE_URL=seu-url-aqui
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 3. Database

**Opção A: Neon (Recomendado - Supabase compatible)**
1. Criar conta em neon.tech
2. Copiar `SUPABASE_DATABASE_URL` do Neon
3. Colar no Render como `SUPABASE_DATABASE_URL`

**Opção B: Supabase (Mais rápido)**
1. Usar PostgreSQL do Supabase
2. Connection string: `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres`

---

## 📋 Checklist Pre-Deploy

- [ ] Todas as variáveis de ambiente configuradas no Render
- [ ] `SUPABASE_DATABASE_URL` está correto (testar conexão localmente antes)
- [ ] `SESSION_SECRET` é uma string forte de 32+ caracteres
- [ ] `VITE_API_URL` aponta para URL final do Render
- [ ] Banco de dados PostgreSQL está acessível
- [ ] Backup do banco de dados realizado (se migração existente)

---

## 🔧 Resolução de Problemas Comuns

### ❌ Erro: "DATABASE_URL not found"
```
✅ SOLUÇÃO: Adicionar SUPABASE_DATABASE_URL em Environment Variables
```

### ❌ Erro: "Cannot find module 'server/index.ts'"
```
✅ SOLUÇÃO: Build usa dist/index.mjs (não dist/index.cjs)
Build Command: npm run build ✓
Start Command: node dist/index.mjs ✓
```

### ❌ Erro: "PostCSS plugin error"
```
✅ SOLUÇÃO: Apenas warning, não afeta deploy
Pode ignorar com segurança
```

### ❌ Erro: "SSE connection failed"
```
✅ SOLUÇÃO: Render supports Server-Sent Events
Nenhuma config extra necessária
```

### ❌ Build falha com "vite: command not found"
```
✅ SOLUÇÃO: npm install rodar automaticamente
Se falhar, adicione em Build Command:
npm ci && npm run build
```

---

## 🔍 Validação Pós-Deploy

1. **Testar endpoint raiz**
   ```
   curl https://seu-render-app.onrender.com/
   ```

2. **Testar API**
   ```
   curl https://seu-render-app.onrender.com/api/categories
   ```

3. **Verificar frontend**
   - Abrir em navegador: https://seu-render-app.onrender.com
   - Deve carregar com sucesso

4. **Verificar logs**
   - Abrir Render Dashboard
   - Ir em "Logs"
   - Procurar por erros de conexão

---

## 📊 Performance Esperada

- **Build time**: 30-40 segundos
- **Startup time**: 5-10 segundos
- **Bundle size**: ~124 KB (backend)
- **Frontend**: ~2 MB gzipped

---

## 🛡️ Segurança

- ✅ SESSION_SECRET é gerado com hash
- ✅ SUPABASE_SERVICE_ROLE_KEY não exposto no frontend
- ✅ CORS configurado para aceitar múltiplas origens
- ✅ Express.json limit: 10MB
- ✅ Multer limit: 10MB para uploads de imagem

---

## 📝 Notas Importantes

1. **Arquivo `.env`**: Não commit no Git (`.gitignore` já configurado)
2. **Build reproducível**: `npm ci` usa package-lock.json
3. **Node version**: Render usa Node.js LTS automaticamente
4. **Uptime**: Render coloca em sleep após 15 min inatividade (plano free)

---

## 🔗 Links Úteis

- Render Dashboard: https://dashboard.render.com
- Supabase Console: https://supabase.com/dashboard
- Neon Console: https://console.neon.tech

---

**Status**: ✅ PRONTO PARA DEPLOY
**Data**: 23 de Dezembro de 2024
**Build Version**: 1.0.0
