# Adoção

Aplicação web para consultar cães e gatos disponíveis para adoção e os centros responsáveis por eles. O projeto terá uma API REST em Java e uma interface independente em React.

> **Estado:** em desenvolvimento. O backend possui uma rota de leitura de animais. Ainda não há frontend implementado.

## Estrutura

```text
backend/   API Spring Boot
database/  Criação das tabelas e dados iniciais do MySQL
```

O backend usa Java 21, Spring Boot 4.1.1, Maven e JDBC. As consultas e operações de escrita serão implementadas com SQL explícito. O frontend será desenvolvido em React com TypeScript e consumirá a API em JSON.

## Requisitos

- JDK 21
- MySQL Server

O Maven Wrapper está incluído em `backend/`; não é necessário instalar Maven separadamente.

## Preparar o banco

Crie o banco no MySQL:

```sql
CREATE DATABASE adocao_bd CHARACTER SET utf8mb4;
USE adocao_bd;
```

Com `adocao_bd` selecionado, execute os scripts nesta ordem:

1. `database/01_criacao_tabelas.sql`
2. `database/02_insercao_dados.sql`

Os scripts de carga foram preparados para um banco vazio. A carga inicial contém 30 animais; confira com `SELECT COUNT(*) FROM Animal;`.

## Configurar e executar o backend

O arquivo `backend/src/main/resources/application.yaml` usa `127.0.0.1:3306`, o banco `adocao_bd` e o usuário MySQL `root`. Defina a variável de ambiente `DB_PASSWORD` com a senha desse usuário antes de iniciar a aplicação. Não grave a senha no repositório.

Na pasta `backend/`, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

Em Linux ou macOS, use `./mvnw spring-boot:run`. No Eclipse, importe `backend/` como projeto Maven e execute `br.org.plumaris.adocao.AdocaoApplication` como aplicação Java. Se a variável `DB_PASSWORD` foi criada após abrir o Eclipse, reinicie o IDE antes de executar.

O servidor inicia na porta 8080. A rota `GET /api/animais` lista os animais com os nomes do centro de adoção e da raça. Os campos da resposta JSON usam nomes em inglês. A consulta está escrita explicitamente no repositório JDBC.

## Contribuição

Mantenha as mudanças pequenas e descreva como foram verificadas. As mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) e são escritas em inglês, por exemplo:

```text
feat(api): add animal listing
docs: document local setup
```

## Licença

A licença do projeto ainda não foi definida. Antes de publicá-lo como software de código aberto, será necessário escolher uma licença e adicionar o arquivo `LICENSE`.
