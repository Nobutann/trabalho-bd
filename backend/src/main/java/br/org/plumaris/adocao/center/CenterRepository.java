package br.org.plumaris.adocao.center;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import br.org.plumaris.adocao.database.DatabaseConnectionFactory;
import br.org.plumaris.adocao.database.DatabaseException;

@Repository
public class CenterRepository {

    private static final String FIND_ALL_SQL = """
            SELECT idConta, nome
            FROM Centro_Adocao
            ORDER BY nome, idConta
            """;

    private final DatabaseConnectionFactory connectionFactory;

    public CenterRepository(DatabaseConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    public List<CenterResponse> findAll() {
        List<CenterResponse> centers = new ArrayList<>();
        try (Connection connection = connectionFactory.openConnection();
                PreparedStatement statement = connection.prepareStatement(FIND_ALL_SQL);
                ResultSet results = statement.executeQuery()) {
            while (results.next()) {
                centers.add(new CenterResponse(results.getInt("idConta"), results.getString("nome")));
            }
            return centers;
        } catch (SQLException exception) {
            throw DatabaseException.from(exception);
        }
    }
}
