# Adoção

Aplicação para consultar cães, gatos e os centros de adoção responsáveis por eles. O backend oferece uma API REST em Java; a interface independente em React ainda será desenvolvida.

> **Estado:** em desenvolvimento. O backend possui quatro rotas de leitura de animais. Ainda não há frontend implementado.

## Estrutura

```text
backend/   API Spring Boot
database/  Tabelas, dados iniciais e consultas SQL
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

O servidor inicia na porta 8080. As rotas disponíveis são:

- `GET /api/animais`: lista os animais com os nomes do centro de adoção e da raça.
- `GET /api/animais/resumo-por-especie`: retorna os totais de animais disponíveis e indisponíveis por espécie.
- `GET /api/animais/faixas-etarias`: retorna a quantidade de animais por espécie e faixa etária, incluindo a faixa `Unknown` para datas de nascimento ausentes ou futuras.
- `GET /api/animais/recomendados?userId=1`: lista animais disponíveis que atendem aos filtros cadastrados nas preferências do usuário. Retorna uma lista vazia quando não há preferências ou correspondências.

Os campos das respostas JSON usam nomes em inglês. O SQL está explícito no repositório JDBC; as quatro consultas estão reunidas em `database/03_consultas.sql`. Para executar a quarta no Workbench com outro usuário, altere o valor de `@user_id` no arquivo.

## Contribuição

Mantenha as mudanças pequenas e descreva como foram verificadas. As mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) e são escritas em inglês, por exemplo:

```text
feat(api): add animal listing
docs: document local setup
```

## Licença

O projeto é distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE).
