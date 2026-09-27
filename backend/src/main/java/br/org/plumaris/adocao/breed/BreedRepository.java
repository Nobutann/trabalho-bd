package br.org.plumaris.adocao.breed;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class BreedRepository {

    private static final String FIND_ALL_SQL = """
            SELECT idRaca, nome, especie
            FROM Raca
            ORDER BY especie, nome, idRaca
            """;

    private static final String FIND_BY_ID_SQL = """
            SELECT idRaca, nome, especie
            FROM Raca
            WHERE idRaca = ?
            """;

    private static final String INSERT_SQL = """
            INSERT INTO Raca (nome, especie)
            VALUES (?, ?)
            """;

    private static final String UPDATE_SQL = """
            UPDATE Raca
            SET nome = ?, especie = ?
            WHERE idRaca = ?
            """;

    private static final String DELETE_SQL = """
            DELETE FROM Raca
            WHERE idRaca = ?
            """;

    private final JdbcTemplate jdbcTemplate;

    public BreedRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<BreedResponse> findAll() {
        return jdbcTemplate.query(FIND_ALL_SQL, BreedRepository::mapBreed);
    }

    public Optional<BreedResponse> findById(int id) {
        return jdbcTemplate.query(FIND_BY_ID_SQL, BreedRepository::mapBreed, id)
                .stream()
                .findFirst();
    }

    public BreedResponse create(String name, String species) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, name);
            statement.setString(2, species);
            return statement;
        }, keyHolder);

        int id = Objects.requireNonNull(keyHolder.getKey()).intValue();
        return new BreedResponse(id, name, species);
    }

    public Optional<BreedResponse> update(int id, String name, String species) {
        jdbcTemplate.update(UPDATE_SQL, name, species, id);
        return findById(id);
    }

    public boolean delete(int id) {
        return jdbcTemplate.update(DELETE_SQL, id) > 0;
    }

    private static BreedResponse mapBreed(ResultSet resultSet, int rowNumber) throws SQLException {
        return new BreedResponse(
                resultSet.getInt("idRaca"),
                resultSet.getString("nome"),
                resultSet.getString("especie")
        );
    }
}
