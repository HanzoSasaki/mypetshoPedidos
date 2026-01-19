
# ClickPedidos - Gestão Inteligente de Pedidos

ClickPedidos é uma aplicação web interna projetada para otimizar e simplificar o processo de gerenciamento de pedidos recebidos através de planilhas do Google. A ferramenta oferece uma interface limpa e intuitiva para visualizar, organizar e rastrear o status de cada pedido, facilitando a logística de preparação e empacotamento.

## ✨ Funcionalidades Principais

- **Dashboard em Tempo Real**: Sincroniza com uma planilha do Google para exibir os pedidos mais recentes, com atualização automática a cada 60 segundos.
- **Resumo Inteligente**: Cards de resumo que mostram o total de pedidos, a quantidade de produtos "Areia" e o total de outros "Pacotes a embalar".
- **Controle de Status**: Altere facilmente o status de um pedido entre "Pendente" e "Embalado" com um clique. O status é salvo localmente no navegador para persistência.
- **Agrupamento por Variação**: Identifica e agrupa todos os produtos por variação, mostrando os mais vendidos e permitindo ações em massa.
- **Ações em Massa**: Marque todos os pedidos de uma determinada variação como "Embalado" ou "Pendente" de uma só vez, agilizando o processo de empacotamento.
- **Visualização Detalhada**: Telas dedicadas para visualizar todos os pedidos de uma variação específica ou a lista completa de todas as variações, com busca e filtros.
- **Consulta de Estoque**: Um modal de acesso rápido para consultar o estoque de produtos específicos (brinquedos), lido de uma planilha separada.
- **Design Totalmente Responsivo**: Interface otimizada para funcionar perfeitamente tanto em desktops quanto em dispositivos móveis, sem perda de funcionalidade.
- **Cálculo de Data de Coleta**: Informa automaticamente a data prevista para a coleta dos pedidos, com base no horário de corte diário e dias úteis.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com um conjunto de tecnologias modernas para garantir performance, escalabilidade e uma ótima experiência de desenvolvimento.

- **Frontend**:
  - **[Next.js](https://nextjs.org/)**: Framework React para renderização no lado do servidor (SSR) e geração de sites estáticos (SSG).
  - **[React](https://react.dev/)**: Biblioteca para construção de interfaces de usuário.
  - **[TypeScript](https://www.typescriptlang.org/)**: Superset de JavaScript que adiciona tipagem estática.
- **UI & Estilização**:
  - **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first para estilização rápida e responsiva.
  - **[Shadcn/ui](https://ui.shadcn.com/)**: Coleção de componentes de UI reutilizáveis e acessíveis.
  - **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones SVG.
- **Infraestrutura**:
  - **[Firebase App Hosting](https://firebase.google.com/docs/app-hosting)**: Plataforma para hospedar e gerenciar a aplicação.

## ⚙️ Como Executar o Projeto Localmente

Para rodar o projeto em seu ambiente de desenvolvimento, siga os passos abaixo:

1.  **Clone o Repositório**
    ```bash
    git clone https://github.com/HanzoSasaki/Sopedidos.git
    cd Sopedidos
    ```

2.  **Instale as Dependências**
    O projeto utiliza `npm` como gerenciador de pacotes.
    ```bash
    npm install
    ```

3.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```

4.  **Acesse a Aplicação**
    Abra seu navegador e acesse [http://localhost:9002](http://localhost:9002) para ver a aplicação em funcionamento.

## 📈 Estrutura de Dados

A aplicação consome dados de duas planilhas públicas do Google Sheets no formato TSV (Tab-Separated Values):

1.  **Planilha de Pedidos**: Contém as informações de cada pedido, incluindo `order_sn` e `product_info`.
2.  **Planilha de Estoque**: Detalha o SKU, nome e quantidade de produtos em estoque.

A lógica de parsing dos dados está localizada em `src/lib/data.ts` e é projetada para ser resiliente a variações no formato dos dados.
"# mypetshoPedidos" 
