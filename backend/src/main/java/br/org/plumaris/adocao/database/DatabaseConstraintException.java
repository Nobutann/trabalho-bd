package br.org.plumaris.adocao.database;

import java.sql.SQLException;

public class DatabaseConstraintException extends DatabaseException {

    public DatabaseConstraintException(SQLException cause) {
        super(cause);
    }
}
