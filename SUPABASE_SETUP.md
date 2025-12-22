# Configuração Supabase - Vibe Drinks

## Resumo da Arquitetura

O sistema Vibe Drinks usa **exclusivamente Supabase Storage** para todos os arquivos de mídia. Um único bucket chamado `images` é compartilhado e organizado em pastas por tipo de conteúdo.

## Variáveis de Ambiente Necessárias

Você precisa adicionar estas credenciais do novo Supabase:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
```

### Como Obter as Credenciais:

1. Entre no seu projeto Supabase em https://supabase.com
2. Vá para "Settings" → "API"
3. Copie o **Project URL**
4. Copie o **Service Role** (não use anon key)
5. Configure as variáveis nos secrets do Replit

## Estrutura do Bucket Storage

**Bucket Name:** `images` (deve ser criado manualmente ou via Supabase)

**Pastas Dentro do Bucket:**
```
images/
├── products/          # Imagens de produtos e ícones de categorias
├── uploads/           # Upload geral de arquivos
├── banners/           # Banners promocionais
└── motoboys/          # Fotos de perfil dos motoboys
```

## Rotas de Upload do Sistema

### 1. POST `/api/storage/upload`
**Upload de arquivo para Supabase**

```bash
curl -X POST http://localhost:5000/api/storage/upload \
  -H "x-user-id: user-id-here" \
  -F "file=@image.jpg" \
  -F "folder=products"
```

**Respostas:**
```json
{
  "path": "products/uuid-filename.jpg",
  "publicUrl": "https://seu-projeto.supabase.co/storage/v1/object/public/images/products/uuid-filename.jpg"
}
```

### 2. DELETE `/api/storage/delete`
**Deletar arquivo do Supabase**

```bash
curl -X DELETE http://localhost:5000/api/storage/delete \
  -H "x-user-id: user-id-here" \
  -H "Content-Type: application/json" \
  -d '{"path": "products/uuid-filename.jpg"}'
```

**Requer:** User com role `admin` ou `pdv`

### 3. POST `/api/storage/clean-products`
**Limpar toda a pasta de produtos (cuidado!)**

```bash
curl -X POST http://localhost:5000/api/storage/clean-products \
  -H "x-user-id: user-id-here"
```

**Requer:** User com role `admin` ou `pdv`

## Componentes de Upload no Frontend

### ProductImageUploader
- Upload local de arquivo
- Captura via câmera
- Pesquisa de imagem via Serper API
- Compressão automática antes do upload
- Preview de imagem

**Localização:** `client/src/components/ProductImageUploader.tsx`

### Image Compression
- Redimensiona para máximo 512x512
- Qualidade JPEG: 82%
- Normalization de caminhos

**Localização:** `client/src/lib/image-compression.ts`

## Fluxo Completo de Upload de Imagem

1. **Seleção** - Usuário seleciona, tira foto ou pesquisa imagem
2. **Compressão** - `compressImage()` otimiza o arquivo
3. **Upload** - `uploadImage()` chama `/api/storage/upload`
4. **Multer** - Backend processa file buffer
5. **Supabase** - `uploadFile()` envia para bucket via Service Role
6. **Retorno** - Backend retorna path e publicUrl
7. **Normalização** - `normalizeImagePath()` processa a resposta
8. **Database** - `PUT /api/products/:id/image` salva URL no DB
9. **Display** - `getStorageUrl()` constrói URL pública para exibir

## Limites e Configurações

- **Tamanho máximo de arquivo:** 10MB
- **Tipos aceitos:** image/* (JPEG, PNG, WebP, etc)
- **Bucket público:** Sim (URLs públicas são acessíveis)
- **Compressão:** Automática no frontend antes do upload
- **Pasta padrão:** `products`

## Otimização de Imagens

Existe um **ImageProcessor** no Admin Dashboard que:
- Lista todas as imagens do bucket
- Otimiza automaticamente
- Calcula economia de espaço
- Pode ser executado a qualquer momento

**Endpoint:** `POST /api/admin/images/process`

## Troubleshooting

### Erro: "Supabase is not configured"
- Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão definidos
- Reinicie o servidor após adicionar as variáveis

### Erro: "Failed to upload file"
- Verifique o tamanho do arquivo (máx 10MB)
- Confirme que é uma imagem válida
- Verifique se o bucket existe e está público

### Imagens não aparecem após upload
- Confirme que `VITE_SUPABASE_URL` está correto (deve ser igual ao `SUPABASE_URL`)
- Verifique no Supabase Storage se os arquivos foram criados
- Teste a URL pública diretamente no navegador

### Erro de egress (que causou a mudança de conta)
- Imagens comprimidas reduzem o uso de egress
- Evite uploads desnecessários de imagens grandes
- Considere usar CDN para distribuição global

## Referências

- **Supabase Docs:** https://supabase.com/docs/guides/storage
- **Client SDK:** https://supabase.com/docs/reference/javascript/storage
- **Admin SDK:** https://supabase.com/docs/reference/typescript/storage-admin
