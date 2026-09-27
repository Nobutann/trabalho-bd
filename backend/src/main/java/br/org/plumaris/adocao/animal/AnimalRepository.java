package br.org.plumaris.adocao.animal;

import java.sql.Date;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AnimalRepository {

    private static final String FIND_ALL_SQL = """
            SELECT
                a.idAnimal,
                a.nome,
                a.especie,
                a.dataNascimento,
                a.sexo,
                a.porte,
                a.cor,
                a.descricao,
                a.disponibilidade,
                a.idCentro,
                c.nome AS centroNome,
                a.idRaca,
                r.nome AS racaNome
            FROM Animal a
            JOIN Centro_Adocao c ON c.idConta = a.idCentro
            LEFT JOIN Raca r ON r.idRaca = a.idRaca
            ORDER BY a.idAnimal
            """;

    private static final String SPECIES_SUMMARY_SQL = """
            SELECT
                a.especie,
                COUNT(*) AS total,
                SUM(CASE WHEN a.disponibilidade = 1 THEN 1 ELSE 0 END) AS available,
                SUM(CASE WHEN a.disponibilidade = 0 THEN 1 ELSE 0 END) AS unavailable
            FROM Animal a
            GROUP BY a.especie
            ORDER BY a.especie
            """;

    private final JdbcTemplate jdbcTemplate;

    public AnimalRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AnimalResponse> findAll() {
        return jdbcTemplate.query(FIND_ALL_SQL, (resultSet, rowNumber) -> {
            Date birthDate = resultSet.getDate("dataNascimento");

            return new AnimalResponse(
                    resultSet.getInt("idAnimal"),
                    resultSet.getString("nome"),
                    resultSet.getString("especie"),
                    birthDate == null ? null : birthDate.toLocalDate(),
                    resultSet.getString("sexo"),
                    resultSet.getString("porte"),
                    resultSet.getString("cor"),
                    resultSet.getString("descricao"),
                    resultSet.getBoolean("disponibilidade"),
                    resultSet.getInt("idCentro"),
                    resultSet.getString("centroNome"),
                    resultSet.getObject("idRaca", Integer.class),
                    resultSet.getString("racaNome")
            );
        });
    }

    public List<AnimalSpeciesSummary> summarizeBySpecies() {
        return jdbcTemplate.query(SPECIES_SUMMARY_SQL, (resultSet, rowNumber) ->
                new AnimalSpeciesSummary(
                        resultSet.getString("especie"),
                        resultSet.getLong("total"),
                        resultSet.getLong("available"),
                        resultSet.getLong("unavailable")
                )
        );
    }
}
