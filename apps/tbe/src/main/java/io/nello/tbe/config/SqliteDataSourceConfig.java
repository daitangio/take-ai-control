package io.nello.tbe.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Configuration
public class SqliteDataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties props) throws SQLException {
        HikariDataSource ds = props.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
        // PRAGMA busy_timeout per-connection: retry writes for up to 30s instead of failing immediately
        ds.setConnectionInitSql("PRAGMA busy_timeout=30000");
        // WAL mode persists in the DB file — set it once at startup
        try (Connection c = ds.getConnection(); Statement s = c.createStatement()) {
            s.execute("PRAGMA journal_mode=WAL");
        }
        return ds;
    }
}
