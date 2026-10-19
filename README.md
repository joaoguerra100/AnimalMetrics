# 🐔 AnimalMetrics

> Sistema Full-Stack para Gestão Zootécnica e Financeira de Lotes Avícolas.

O **AnimalMetrics** é uma aplicação mobile (React Native) integrada a uma API robusta (.NET C#) desenvolvida para auxiliar produtores no controle e monitoramento diário de lotes de aves. O sistema unifica dados de consumo, mortalidade, sanidade e custos, entregando relatórios e uma linha do tempo clara para a tomada de decisão.

---

## ✨ Funcionalidades

O aplicativo foi modularizado para cobrir todas as necessidades do ciclo de vida de um lote:

- **📊 Dashboard (Início):** Visão geral instantânea com filtros dinâmicos por dia, mês e ano, exibindo o custo atual de ração, consumo hídrico, último peso e índice de mortalidade.
- **⚖️ Controle de Peso:** Registro de pesagens de rotina e acompanhamento da curva de crescimento das aves.
- **💧 Nutrição (Ração e Água):** Controle unificado de insumos diários com gráficos de consumo.
- **💀 Mortalidade:** Registro de perdas e suas respectivas causas (Calor, Manejo, Doenças, etc.).
- **💉 Sanidade:** Calendário de aplicações de vacinas, medicamentos e vitaminas com controle de dosagem.
- **🛠️ Manejo Diário:** Checklist estrutural diário (limpeza, bebedouros, temperatura) e observações técnicas.
- **⏳ Timeline:** O "Livro de Ocorrências" do lote, consolidando todos os eventos acima em uma única linha do tempo cronológica.

---

## 🚀 Tecnologias e Arquitetura

O projeto foi construído focando em escalabilidade, manutenibilidade e uma ótima experiência de usuário (UX).

### Front-end (Mobile)
- **React Native** com **Expo**
- **TypeScript** para tipagem estática e segurança.
- **Bibliotecas Principais:** `react-native-calendars` (Filtros e navegação temporal), `react-native-chart-kit` (Visualização de dados), `expo-router` (Navegação em Stack).

### Back-end (API)
- **C# / .NET 8** (ou 9) - Web API RESTful
- **Entity Framework Core** (Code-First)
- **PostgreSQL** como banco de dados relacional.
- **Arquitetura em Camadas:** Separação clara utilizando o padrão **Service / Repository Pattern**, injeção de dependências e DTOs para tráfego seguro de dados.

---

## 📱 Screenshots

<p align="center">
  <img src="./Imgs/imagem_do_menu.png" width="200" />
  <img src="./Imgs/imagem_do_dashboard.png" width="200" />
  <img src="./Imgs/imagem_da_timeline.png" width="200" />
</p>

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- Aplicativo **Expo Go** instalado no seu celular (ou emulador Android/iOS).

### 1. Rodando o Back-end (API)
Navegue até a pasta da API (C#):
```bash
cd AnimalMetrics.Api

Configure a string de conexão com o seu banco de dados PostgreSQL no arquivo appsettings.json. Em seguida, aplique as migrações:

dotnet ef database update

Inicie o servidor (Obrigatório rodar no IP 0.0.0.0 para aceitar conexão do celular):

dotnet run --urls "http://0.0.0.0:5234"

cd AnimalMetrics.App

npm install
npx expo start

Após iniciar, escaneie o QR Code gerado no terminal usando o aplicativo Expo Go no seu smartphone.

👨‍💻 Autor
Desenvolvido com dedicação e foco em Engenharia de Software.
Sinta-se à vontade para conectar-se comigo no LinkedIn para conversarmos sobre este e outros projetos!