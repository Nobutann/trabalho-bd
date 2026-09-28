package br.org.plumaris.adocao.database;

import java.sql.SQLException;

public class DatabaseException extends RuntimeException {

    public DatabaseException(SQLException cause) {
        super("Database operation failed", cause);
    }

    public static DatabaseException from(SQLException cause) {
        String sqlState = cause.getSQLState();
        if (sqlState != null && sqlState.startsWith("23")) {
            return new DatabaseConstraintException(cause);
        }
        return new DatabaseException(cause);
    }
}
