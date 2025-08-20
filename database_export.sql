-- Database Export for Supabase Migration
-- Generated on: 2025-01-20
-- This file contains all data from your current Supabase database

-- ============================================
-- PROFILES TABLE
-- ============================================
INSERT INTO public.profiles (id, criado_em, atualizado_em, nome, email) VALUES 
('060f8e0d-2d22-4365-891a-5db2ed33c714', '2025-05-09 12:23:41.166613+00', '2025-05-09 12:23:41.166613+00', 'Fernado Martins', 'nandoesporte1@gmail.com');

-- ============================================
-- ADMIN_USERS TABLE
-- ============================================
INSERT INTO public.admin_users (id, user_id, active, created_at, updated_at, email, name, role) VALUES 
('19dbebb3-3342-4e77-96d6-db88e908f644', '060f8e0d-2d22-4365-891a-5db2ed33c714', true, '2025-05-31 00:11:54.759995+00', '2025-05-31 00:11:54.759995+00', 'nandoesporte1@gmail.com', 'Nando Esporte Admin', 'admin');

-- ============================================
-- CATEGORIES TABLE
-- ============================================
INSERT INTO public.categories (id, active, created_at, updated_at, name, slug, description, image_url) VALUES 
('71381ae3-90f6-4584-bf11-c2e984e27220', true, '2025-05-30 20:46:36.164882+00', '2025-05-30 20:46:36.164882+00', 'Bolas de Campo', 'bolas-de-campo', 'Bolas oficiais para futebol de campo', null),
('ac92b4de-c880-4829-a13f-34aa0c3732ab', true, '2025-05-30 20:46:36.164882+00', '2025-05-30 20:46:36.164882+00', 'Bolas Society', 'bolas-society', 'Bolas para futebol society', null),
('2b575e58-2b28-41ef-8ef0-550eb86974ef', true, '2025-05-30 20:46:36.164882+00', '2025-05-30 20:46:36.164882+00', 'Bolas de Futsal', 'bolas-de-futsal', 'Bolas oficiais para futsal', null),
('a7ecab34-4a9e-4cda-b402-aaf011b4f7be', true, '2025-05-30 20:46:36.164882+00', '2025-05-30 20:46:36.164882+00', 'Acessórios', 'acessorios', 'Acessórios esportivos', null),
('0164143c-b5e0-44b2-8ca2-fe70c4a3d8e9', true, '2025-05-31 00:40:04.782588+00', '2025-05-31 00:40:04.782588+00', 'Chuteiras', 'chuteiras', 'Categoria Chuteiras', null),
('af5153cf-967a-472b-89a9-7e865041a535', true, '2025-05-31 00:40:08.007389+00', '2025-05-31 00:40:08.007389+00', 'Camisas', 'camisas', 'Categoria Camisas', null),
('173aeec2-05f4-4722-b570-8d68f995840e', true, '2025-05-31 01:21:01.288971+00', '2025-05-31 01:21:01.288971+00', 'Bolas', 'bolas', 'Categoria Bolas', null);

-- ============================================
-- SITE_CONFIG TABLE
-- ============================================
INSERT INTO public.site_config (id, created_at, updated_at, config_key, config_value, config_type, description, category) VALUES 
('946ac969-e311-4c03-81d6-922d17953926', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'site_description', 'Bolas Penalty originais com entrega rápida em Maringá-PR', 'text', 'Descrição do site', 'general'),
('673828ab-d9b5-4848-b25a-a61fd90537cd', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'hero_title', 'Bolas Penalty Originais', 'text', 'Título principal do hero', 'hero'),
('c2f70d2a-5de3-492b-aef1-d0b5ad9f3181', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'hero_subtitle', 'Qualidade profissional com entrega rápida em Maringá', 'text', 'Subtítulo do hero', 'hero'),
('59e5089b-c653-49ea-8330-128b792d1dd8', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'delivery_city', 'Maringá-PR', 'text', 'Cidade de entrega', 'delivery'),
('63d6e0f6-b2d6-4521-93f8-e61ad1c7b00b', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'whatsapp_message', 'Olá! Gostaria de saber mais sobre este produto:', 'text', 'Mensagem padrão do WhatsApp', 'contact'),
('538245b8-499c-4c33-a3a1-764f6b6e01f1', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'featured_products_title', 'Produtos em Destaque', 'text', 'Título da seção de produtos em destaque', 'products'),
('32541e67-27e7-4017-9910-b077abf08b23', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:25:57.10572+00', 'featured_products_subtitle', 'Seleção especial das bolas Penalty mais vendidas', 'text', 'Subtítulo da seção de produtos em destaque', 'products'),
('96b05692-9504-439c-8b03-bed279accea0', '2025-05-31 02:25:57.10572+00', '2025-05-31 02:49:38.397558+00', 'site_name', 'NandoEsporte', 'text', 'Nome do site', 'general');

-- ============================================
-- CONFIGURACOES_SISTEMA TABLE
-- ============================================
INSERT INTO public.configuracoes_sistema (id, created_at, updated_at, chave, valor, tipo, descricao, categoria) VALUES 
('e291ab31-701f-4116-96a4-ecd39b3bf4f0', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.114848+00', 'business_hours_start', '08:00', 'string', 'Início do horário comercial', 'geral'),
('32599ab3-a74f-4bcb-b501-88bb815a246c', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.117538+00', 'elevenlabs_api_key', 'sk_120e2ccecb73e940cb291a626a7333bbef2e8c94f8eb2408', 'string', 'Chave da API ElevenLabs', 'voz'),
('47d118d5-d59e-4012-8559-e0bb23385e34', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.135207+00', 'business_hours_end', '00:00', 'string', 'Fim do horário comercial', 'geral'),
('ab1ac07d-2994-4487-8648-71d880e163d2', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.139857+00', 'welcome_message', 'Olá! Bem-vindo à nossa corretora de seguros. Como posso ajudá-lo hoje?', 'string', 'Mensagem de boas-vindas', 'mensagens'),
('453d0e12-b528-490b-b944-cc8cb89c22fb', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.177373+00', 'auto_response_enabled', 'true', 'string', 'Resposta automática ativada', 'automacao'),
('e8af526e-8de9-4732-a038-0bdd7c5edcf3', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.17459+00', 'whatsapp_instance_id', '48763', 'string', 'ID da instância WhatsApp', 'whatsapp'),
('17a4c419-0deb-48b4-8afd-1e333cdcd05c', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.162443+00', 'whatsapp_api_key', '8a7cf461-9004-4ebc-8875-cb1454c33314', 'string', 'Chave da API WhatsGW', 'whatsapp'),
('cfac6083-110d-4227-a3a0-76b290ef5b3b', '2025-06-09 00:07:17.77248+00', '2025-06-12 13:41:12.188937+00', 'elevenlabs_agent_id', 'agent_01jx80vgzgfnc9gawpyab0v2py', 'string', 'ID do agente ElevenLabs', 'voz'),
('1274c0aa-3e82-4e5e-af38-169fd2088300', '2025-06-09 02:15:38.177834+00', '2025-06-12 13:41:12.209217+00', 'n8n_webhook_url', 'https://primary-production-6d5a1.up.railway.app/webhook-test/6a8cb2f0-3af5-4c44-b894-49351625ec58', 'string', null, 'geral');

-- ============================================
-- TRAININGS TABLE
-- ============================================
INSERT INTO public.trainings (id, featured, created_at, updated_at, title, category, duration, description) VALUES 
('37ee29f0-6274-4453-95c0-04d5b1695021', true, '2025-05-24 13:15:36.432995+00', '2025-05-24 13:15:36.432995+00', 'Governança em Cooperativas', 'Cooperativismo', '16h', 'Fundamentos e práticas de governança para cooperativas de diferentes segmentos.'),
('84e9221e-a8dd-4113-a326-16c0f065116c', false, '2025-05-24 13:15:36.432995+00', '2025-05-24 13:15:36.432995+00', 'Liderança Cooperativa', 'Liderança', '20h', 'Desenvolvimento de habilidades de liderança com foco nos valores cooperativistas.'),
('5f5b8e34-55c9-4043-87e4-d0364155f9d9', true, '2025-05-24 13:15:36.432995+00', '2025-05-24 13:15:36.432995+00', 'Gestão Financeira para Cooperativas', 'Gestão', '24h', 'Análise e planejamento financeiro específico para organizações cooperativas.'),
('1913ea70-5c67-4e42-8cbc-d757ac134795', false, '2025-05-24 13:15:36.432995+00', '2025-05-24 13:15:36.432995+00', 'ESG e Cooperativismo', 'Sustentabilidade', '12h', 'Implementação de práticas ESG alinhadas aos princípios cooperativistas.'),
('e77787cb-ba3f-4645-97c8-a813d67b7121', false, '2025-05-24 13:15:36.432995+00', '2025-05-24 13:15:36.432995+00', 'Comunicação Estratégica', 'Gestão', '8h', 'Técnicas para comunicação eficaz dentro e fora da cooperativa.'),
('a2dfd981-1544-4a7e-82da-e60ed0131066', false, '2025-05-24 13:15:36.432995+00', '2025-05-24 13:15:36.432995+00', 'Princípios Cooperativistas na Prática', 'Cooperativismo', '16h', 'Aplicação prática dos princípios do cooperativismo no dia a dia das organizações.');

-- ============================================
-- REGRAS_RESPOSTA_AUTOMATICA TABLE
-- ============================================
INSERT INTO public.regras_resposta_automatica (id, is_active, created_at, updated_at, trigger_keywords, response_text) VALUES 
('35340516-e962-45bf-9e04-0fa0e37fc04c', true, '2025-06-11 20:32:41.664103+00', '2025-06-11 20:54:45.687571+00', 
ARRAY['olá', 'ola', 'tudo bem?', 'bom dia', 'Bom dia', 'boa tarde', 'Boa tarde', 'boa noite', 'Boa noite'], 
'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80" viewBox="0 0 300 80">
  <defs>
    <linearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#45a049;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
    </linearGradient>
    <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="4" result="offset"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/> 
      </feMerge>
    </filter>
  </defs>
  
  <!-- Sombra do botão -->
  <ellipse cx="150" cy="44" rx="140" ry="32" fill="url(#shadowGradient)" opacity="0.2"/>
  
  <!-- Corpo do botão -->
  <rect x="10" y="10" width="280" height="60" rx="30" ry="30" 
        fill="url(#buttonGradient)" 
        filter="url(#dropshadow)"
        stroke="#388E3C" 
        stroke-width="2"/>
  
  <!-- Brilho superior -->
  <rect x="12" y="12" width="276" height="20" rx="28" ry="10" 
        fill="rgba(255,255,255,0.3)" 
        opacity="0.8"/>
  
  <!-- Ícone do telefone -->
  <g transform="translate(50, 25)">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" 
          fill="white" 
          transform="scale(1.2)"/>
  </g>
  
  <!-- Texto "LIGAR" -->
  <text x="150" y="45" 
        font-family="Arial, sans-serif" 
        font-size="20" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="white" 
        dominant-baseline="middle">
    LIGAR
  </text>
  
  <!-- Efeito de brilho animado -->
  <rect x="10" y="10" width="280" height="60" rx="30" ry="30" 
        fill="none" 
        stroke="rgba(255,255,255,0.5)" 
        stroke-width="1" 
        opacity="0.6">
    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Indicador de link/ação -->
  <circle cx="260" cy="25" r="5" fill="rgba(255,255,255,0.8)">
    <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
  </circle>
</svg>');

-- ============================================
-- SITE_BANNERS TABLE
-- ============================================
INSERT INTO public.site_banners (id, is_active, start_date, end_date, display_order, created_at, updated_at, title, subtitle, image_url, link_url, position) VALUES 
('a995056e-dba8-4eaf-be8d-0eaf1cf97c40', true, null, null, 0, '2025-05-31 02:47:20.728242+00', '2025-05-31 02:47:20.728242+00', 'Destaque', '', 'https://cambuci.vtexassets.com/arquivos/ids/1426500-800-auto?v=638799768753900000&width=800&height=auto&aspect=true', '', 'hero');

-- ============================================
-- IMPORTANT NOTES FOR MIGRATION:
-- ============================================
-- 1. Make sure to create all the required tables and their schemas in your new Supabase instance before running these INSERT statements
-- 2. Ensure all custom types (enums) are created in the new database
-- 3. Set up RLS policies as needed for your tables
-- 4. Update any environment variables and configuration files to point to the new Supabase instance
-- 5. Test all functionality after migration

-- ============================================
-- END OF EXPORT
-- ============================================