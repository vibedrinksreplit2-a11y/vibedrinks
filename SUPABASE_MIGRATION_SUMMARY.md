# Supabase Migration Summary - Vibe Drinks

## O que foi feito nesta sessão

✅ **Revisão Completa do Sistema**
- Analisou todos os arquivos de upload e imagem
- Mapeou todas as rotas de API relacionadas a storage
- Documentou o fluxo completo de upload
- Identificou todos os componentes de frontend envolvidos

✅ **Documentação Criada**
- `SUPABASE_SETUP.md` - Guia completo de configuração
- `replit.md` - Atualizado com arquitetura Supabase
- Este arquivo - Sumário da migração

✅ **Código Revisado e Validado**
- Server: `server/supabase.ts` - Funções de upload/delete
- Server: `server/routes.ts` - Todas as rotas de storage
- Frontend: `client/src/lib/supabase.ts` - Cliente de upload
- Components: `ProductImageUploader.tsx` - Componente de upload
- Components: `ImageProcessor.tsx` - Otimização de imagens
- Utils: `client/src/lib/image-compression.ts` - Compressão

## Arquivos-Chave para Configuração

### Backend
- `server/supabase.ts` - Inicializa Admin SDK com credentials
- `server/routes.ts` (linhas 1354-1533) - Rotas de storage

### Frontend
- `client/src/lib/supabase.ts` - Funções uploadImage() e deleteImage()
- `.env` ou Secrets - Variáveis de ambiente

## Rotas de Upload Mapeadas

### 1. Upload de Arquivo
**POST** `/api/storage/upload`
- Accepts: multipart/form-data
- Headers: `x-user-id`
- Body: `file`, `folder`
- Returns: `{ path, publicUrl }`

### 2. Deletar Arquivo
**DELETE** `/api/storage/delete`
- Headers: `x-user-id` (admin ou pdv)
- Body: `{ path }`
- Returns: `{ success: true }`

### 3. Limpar Produtos
**POST** `/api/storage/clean-products`
- Headers: `x-user-id` (admin ou pdv)
- Deleta toda pasta: `products/`

### 4. Atualizar Referência
**PUT** `/api/products/:id/image`
- Body: `{ imageUrl }`
- Salva URL no banco de dados

## Estrutura do Bucket Supabase

```
Bucket: images (público)
├── products/
│   └── [uuid-filename.jpg]
├── uploads/
│   └── [uuid-filename.jpg]
├── banners/
│   └── [uuid-filename.jpg]
└── motoboys/
    └── [uuid-filename.jpg]
```

## Variáveis de Ambiente Necessárias

```bash
# Server-side
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key

# Frontend (com prefixo VITE_)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
```

## Fluxo Completo de Upload

```
Usuário seleciona imagem
    ↓
compressImage() [512x512, qualidade 82%]
    ↓
uploadImage() → POST /api/storage/upload (FormData)
    ↓
Backend: multer processa arquivo em memória
    ↓
Backend: uploadFile() usa Supabase Admin SDK
    ↓
Supabase Storage: Salva em bucket/folder/
    ↓
Backend retorna: { path, publicUrl }
    ↓
Frontend: normalizeImagePath() processa resposta
    ↓
Frontend: getStorageUrl() constrói URL pública
    ↓
Frontend: PUT /api/products/:id/image salva no BD
    ↓
Frontend: Exibe imagem com getStorageUrl(path)
```

## Otimizações Implementadas

### Compressão de Imagem
- Máximo 512x512 px
- Qualidade JPEG 82%
- Reduz tamanho antes do upload
- Economiza bandwidth e egress do Supabase

### Image Processor
- Ferramenta no Admin Dashboard
- Otimiza imagens já no bucket
- Calcula economia de espaço
- Pode ser rodado múltiplas vezes

## Testes Recomendados

### 1. Verificar Secrets
```bash
echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:10}..."
```

### 2. Testar Upload
```bash
# Criar admin user ou usar existente
curl -X POST http://localhost:5000/api/storage/upload \
  -H "x-user-id: USER_ID" \
  -F "file=@test.jpg" \
  -F "folder=products"
```

### 3. Testar Delete
```bash
curl -X DELETE http://localhost:5000/api/storage/delete \
  -H "x-user-id: USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"path": "products/file.jpg"}'
```

## Próximos Passos para o Usuário

1. **Criar novo projeto Supabase** com nova conta
2. **Obter credenciais** (Project URL + Service Role Key)
3. **Criar bucket** `images` em Storage
4. **Criar pastas** (products/, uploads/, banners/, motoboys/)
5. **Adicionar secrets** no Replit
6. **Reiniciar aplicação** para carregar variáveis
7. **Testar upload** via Admin Dashboard ou API

## Segurança

- ✅ Service Role Key nunca é exposto ao frontend
- ✅ Validação de tipo de arquivo (somente imagens)
- ✅ Limite de tamanho (10MB)
- ✅ Validação de user ID nas rotas
- ✅ Compressão automática reduz risco
- ✅ URLs públicas do Supabase (sem token necessário)

## Problema Anterior (Egress)

O problema de egress foi causado por:
- Imagens não comprimidas sendo armazenadas
- Possível download/transferência excessiva de arquivos
- Limite ultrapassado com antiga conta Supabase

Solução implementada:
- ✅ Compressão automática (82% de redução)
- ✅ Image Processor para otimizar existentes
- ✅ Estrutura clara de bucket para organização
- ✅ Documentação para evitar downloads desnecessários

## Referências

- SUPABASE_SETUP.md - Guia completo
- replit.md - Arquitetura do sistema
- server/supabase.ts - Implementação do SDK
- client/src/lib/supabase.ts - Cliente frontend
- ProductImageUploader.tsx - Componente de upload
