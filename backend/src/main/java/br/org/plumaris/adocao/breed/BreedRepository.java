package br.org.plumaris.adocao.breed;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.org.plumaris.adocao.database.DatabaseConnectionFactory;
import br.org.plumaris.adocao.database.DatabaseException;

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

    private final DatabaseConnectionFactory connectionFactory;

    public BreedRepository(DatabaseConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    public List<BreedResponse> findAll() {
        List<BreedResponse> breeds = new ArrayList<>();
        try (Connection connection = connectionFactory.openConnection();
                PreparedStatement statement = connection.prepareStatement(FIND_ALL_SQL);
                ResultSet results = statement.executeQuery()) {
            while (results.next()) {
                breeds.add(mapBreed(results));
            }
            return breeds;
        } catch (SQLException exception) {
            throw DatabaseException.from(exception);
        }
    }

    public Optional<BreedResponse> findById(int id) {
        try (Connection connection = connectionFactory.openConnection();
                PreparedStatement statement = connection.prepareStatement(FIND_BY_ID_SQL)) {
            statement.setInt(1, id);
            try (ResultSet results = statement.executeQuery()) {
                return results.next() ? Optional.of(mapBreed(results)) : Optional.empty();
            }
        } catch (SQLException exception) {
            throw DatabaseException.from(exception);
        }
    }

    public BreedResponse create(String name, String species) {
        try (Connection connection = connectionFactory.openConnection();
                PreparedStatement statement = connection.prepareStatement(INSERT_SQL, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, name);
            statement.setString(2, species);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new IllegalStateException("Created breed has no generated ID");
                }
                return new BreedResponse(keys.getInt(1), name, species);
            }
        } catch (SQLException exception) {
            throw DatabaseException.from(exception);
        }
    }

    public Optional<BreedResponse> update(int id, String name, String species) {
        try (Connection connection = connectionFactory.openConnection();
                PreparedStatement statement = connection.prepareStatement(UPDATE_SQL)) {
            statement.setString(1, name);
            statement.setString(2, species);
            statement.setInt(3, id);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw DatabaseException.from(exception);
        }
        return findById(id);
    }

    public boolean delete(int id) {
        try (Connection connection = connectionFactory.openConnection();
                PreparedStatement statement = connection.prepareStatement(DELETE_SQL)) {
            statement.setInt(1, id);
            return statement.executeUpdate() > 0;
        } catch (SQLException exception) {
            throw DatabaseException.from(exception);
        }
    }

    private static BreedResponse mapBreed(ResultSet resultSet) throws SQLException {
        return new BreedResponse(
                resultSet.getInt("idRaca"),
                resultSet.getString("nome"),
                resultSet.getString("especie")
        );
    }
}
