package br.org.plumaris.adocao.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionFactory {

    private final String url;
    private final String username;
    private final String password;

    public DatabaseConnectionFactory(
            @Value("${database.url}") String url,
            @Value("${database.username}") String username,
            @Value("${database.password}") String password) {
        this.url = url;
        this.username = username;
        this.password = password;
    }

    public Connection openConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }
}
