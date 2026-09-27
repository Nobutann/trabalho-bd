package br.org.plumaris.adocao.animal;

import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
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

    private static final String AGE_GROUP_SUMMARY_SQL = """
            SELECT
                a.especie,
                CASE
                    WHEN a.dataNascimento IS NULL OR a.dataNascimento > CURDATE() THEN 'Unknown'
                    WHEN TIMESTAMPDIFF(YEAR, a.dataNascimento, CURDATE()) < 2 THEN '0-1'
                    WHEN TIMESTAMPDIFF(YEAR, a.dataNascimento, CURDATE()) < 5 THEN '2-4'
                    ELSE '5+'
                END AS ageGroup,
                COUNT(*) AS total
            FROM Animal a
            GROUP BY a.especie, ageGroup
            ORDER BY a.especie, ageGroup
            """;

    private static final String FIND_RECOMMENDED_SQL = """
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
            FROM Preferencia p
            JOIN Animal a ON a.disponibilidade = 1
                AND (p.especieDesejada IS NULL OR a.especie = p.especieDesejada)
            JOIN Centro_Adocao c ON c.idConta = a.idCentro
            LEFT JOIN Raca r ON r.idRaca = a.idRaca
            WHERE p.idConta = ?
                AND (p.porteDesejado IS NULL OR a.porte = p.porteDesejado)
                AND (p.sexoDesejado IS NULL OR a.sexo = p.sexoDesejado)
                AND (p.corDesejada IS NULL OR a.cor = p.corDesejada)
                AND (p.idRaca IS NULL OR a.idRaca = p.idRaca)
                AND (p.idadeMinima IS NULL OR (
                    a.dataNascimento <= CURDATE()
                    AND TIMESTAMPDIFF(YEAR, a.dataNascimento, CURDATE()) >= p.idadeMinima
                ))
                AND (p.idadeMaxima IS NULL OR (
                    a.dataNascimento <= CURDATE()
                    AND TIMESTAMPDIFF(YEAR, a.dataNascimento, CURDATE()) <= p.idadeMaxima
                ))
            ORDER BY a.idAnimal
            """;

    private final JdbcTemplate jdbcTemplate;

    public AnimalRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AnimalResponse> findAll() {
        return jdbcTemplate.query(FIND_ALL_SQL, AnimalRepository::mapAnimal);
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

    public List<AnimalAgeGroupSummary> summarizeByAgeGroup() {
        return jdbcTemplate.query(AGE_GROUP_SUMMARY_SQL, (resultSet, rowNumber) ->
                new AnimalAgeGroupSummary(
                        resultSet.getString("especie"),
                        resultSet.getString("ageGroup"),
                        resultSet.getLong("total")
                )
        );
    }

    public List<AnimalResponse> findRecommendedForUser(int userId) {
        return jdbcTemplate.query(FIND_RECOMMENDED_SQL,
                statement -> statement.setInt(1, userId), AnimalRepository::mapAnimal);
    }

    private static AnimalResponse mapAnimal(ResultSet resultSet, int rowNumber) throws SQLException {
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
    }
}
