# WALLETZEY
----
Sistema para controlar de forma simples e rapida seus gastos e ganhos. Importe seu extrato bancario em formato PDF ou CSV para um Agente Inteligente analisar e categorizar seus gastos de forma simples e rapida. 
Para você que possue mais de uma conta bancaria e quer centralizar tudo de forma automatica e de facil acesso, rode localmente o Walletzey.
---

# **Passos para executar**
## 1. Criação do banco de dados local
- Acesse o arquivo supabase_migration.sql copie todo o conteudo de dentro do arquivo e cole no seu editor sql do supabase
- Adquira a API do supabase (service_role) e cole no arquivo .env.example
- Adquira a url do banco no supabase e cole no arquivo .env.example

## 2. Execução do backend
- entre na pasta do backend com cd backend
- crie um .venv (python -m venv .venv)
- ative seu .venv (.venv/scripts/activate)
- instale as dependencias necessarias para executar o projeto com: pip install -r requirements.txt
- agora execute o backend com: python -m uvicorn main:app --reload 
- o backend ira executar na porta 8000, confira se não havera conflitos de porta

## 3. Execução do frontend
- crie um novo terminal e entre na pasta frontend com: cd frontend
- configure seu .env.example com a url da porta que o backend esta rodando
- de o comando npm install para verificar as dependecias necessarias
- rode com npm run dev

# Walletzey sendo executado com sucesso
- para ver se esta rodando com sucesso, clique na aba de importação e importe seu extrato bancario
