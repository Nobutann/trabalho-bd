package br.org.plumaris.adocao.animal;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
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

    private static final String FIND_BY_ID_SQL = """
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
            WHERE a.idAnimal = ?
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

    private static final String INSERT_SQL = """
            INSERT INTO Animal (
                nome, especie, dataNascimento, sexo, porte, cor, descricao,
                disponibilidade, idCentro, idRaca
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

    private static final String UPDATE_SQL = """
            UPDATE Animal
            SET nome = ?, especie = ?, dataNascimento = ?, sexo = ?, porte = ?,
                cor = ?, descricao = ?, disponibilidade = ?, idCentro = ?, idRaca = ?
            WHERE idAnimal = ?
            """;

    private static final String DELETE_SQL = """
            DELETE FROM Animal
            WHERE idAnimal = ?
            """;

    private static final String CENTER_EXISTS_SQL = """
            SELECT COUNT(*)
            FROM Centro_Adocao
            WHERE idConta = ?
            """;

    private static final String FIND_BREED_SPECIES_SQL = """
            SELECT especie
            FROM Raca
            WHERE idRaca = ?
            """;

    private final JdbcTemplate jdbcTemplate;

    public AnimalRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AnimalResponse> findAll() {
        return jdbcTemplate.query(FIND_ALL_SQL, AnimalRepository::mapAnimal);
    }

    public Optional<AnimalResponse> findById(int id) {
        return jdbcTemplate.query(FIND_BY_ID_SQL, AnimalRepository::mapAnimal, id)
                .stream()
                .findFirst();
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

    public int create(AnimalRequest request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS);
            bindAnimal(statement, request);
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    public void update(int id, AnimalRequest request) {
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(UPDATE_SQL);
            bindAnimal(statement, request);
            statement.setInt(11, id);
            return statement;
        });
    }

    public boolean delete(int id) {
        return jdbcTemplate.update(DELETE_SQL, id) > 0;
    }

    public boolean centerExists(int centerId) {
        Integer count = jdbcTemplate.queryForObject(CENTER_EXISTS_SQL, Integer.class, centerId);
        return count != null && count > 0;
    }

    public Optional<String> findBreedSpecies(int breedId) {
        return jdbcTemplate.query(FIND_BREED_SPECIES_SQL,
                (resultSet, rowNumber) -> resultSet.getString("especie"), breedId)
                .stream()
                .findFirst();
    }

    private static void bindAnimal(PreparedStatement statement, AnimalRequest request) throws SQLException {
        statement.setString(1, request.normalizedName());
        statement.setString(2, request.species());

        if (request.birthDate() == null) {
            statement.setNull(3, Types.DATE);
        } else {
            statement.setDate(3, Date.valueOf(request.birthDate()));
        }

        setNullableString(statement, 4, request.sex());
        setNullableString(statement, 5, request.size());
        setNullableString(statement, 6, request.color());
        setNullableString(statement, 7, request.description());
        statement.setBoolean(8, request.available());
        statement.setInt(9, request.centerId());

        if (request.breedId() == null) {
            statement.setNull(10, Types.INTEGER);
        } else {
            statement.setInt(10, request.breedId());
        }
    }

    private static void setNullableString(PreparedStatement statement, int index, String value) throws SQLException {
        if (value == null) {
            statement.setNull(index, Types.VARCHAR);
        } else {
            statement.setString(index, value);
        }
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
