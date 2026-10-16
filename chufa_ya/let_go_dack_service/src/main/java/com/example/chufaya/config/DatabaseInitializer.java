package com.example.chufaya.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        createAllTables();
        seedData();
    }

    private void createAllTables() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {

            // 用户表
            statement.execute("CREATE TABLE IF NOT EXISTS users (" +
                    "user_id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                    "nickname VARCHAR(50) NOT NULL," +
                    "duck_id VARCHAR(20) UNIQUE," +
                    "phone VARCHAR(20) UNIQUE," +
                    "password_hash VARCHAR(255)," +
                    "ip_location VARCHAR(100)," +
                    "bio VARCHAR(200)," +
                    "avatar_url VARCHAR(500)," +
                    "follow_count INT DEFAULT 0," +
                    "fans_count INT DEFAULT 0," +
                    "like_count INT DEFAULT 0," +
                    "status TINYINT DEFAULT 1," +
                    "create_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            System.out.println("[DB] Table users ready.");

            // 内容表
            statement.execute("CREATE TABLE IF NOT EXISTS content_info (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                    "user_id BIGINT NOT NULL," +
                    "content_type VARCHAR(20) NOT NULL," +
                    "title VARCHAR(200)," +
                    "content TEXT," +
                    "cover_url VARCHAR(500)," +
                    "image_list VARCHAR(2000)," +
                    "topic_ids VARCHAR(500)," +
                    "location VARCHAR(200)," +
                    "like_count INT DEFAULT 0," +
                    "comment_count INT DEFAULT 0," +
                    "collect_count INT DEFAULT 0," +
                    "status TINYINT DEFAULT 1," +
                    "publish_time DATETIME," +
                    "create_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                    "INDEX idx_user_id (user_id)," +
                    "INDEX idx_content_type (content_type)," +
                    "INDEX idx_publish_time (publish_time)," +
                    "INDEX idx_status (status)," +
                    "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            System.out.println("[DB] Table content_info ready.");

            // 用户行程表
            statement.execute("CREATE TABLE IF NOT EXISTS user_trip (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "user_id BIGINT NOT NULL," +
                    "content_id BIGINT NOT NULL," +
                    "content_type VARCHAR(50)," +
                    "title VARCHAR(255)," +
                    "cover_url VARCHAR(500)," +
                    "location VARCHAR(100)," +
                    "start_time DATETIME NULL," +
                    "end_time DATETIME NULL," +
                    "status VARCHAR(20) DEFAULT 'Planning'," +
                    "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
            System.out.println("[DB] Table user_trip ready.");

            // 用户关注表
            statement.execute("CREATE TABLE IF NOT EXISTS user_follow (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                    "follower_id BIGINT NOT NULL," +
                    "followee_id BIGINT NOT NULL," +
                    "follow_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "status TINYINT DEFAULT 1," +
                    "create_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                    "INDEX idx_follower (follower_id)," +
                    "INDEX idx_followee (followee_id)," +
                    "UNIQUE KEY uk_follow (follower_id, followee_id)," +
                    "FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE," +
                    "FOREIGN KEY (followee_id) REFERENCES users(user_id) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            System.out.println("[DB] Table user_follow ready.");

            // 点赞表
            statement.execute("CREATE TABLE IF NOT EXISTS likes (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                    "user_id BIGINT NOT NULL," +
                    "content_id BIGINT NOT NULL," +
                    "content_type VARCHAR(20) NOT NULL," +
                    "like_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "INDEX idx_user_id (user_id)," +
                    "INDEX idx_content (content_id, content_type)," +
                    "UNIQUE KEY uk_like (user_id, content_id, content_type)," +
                    "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            System.out.println("[DB] Table likes ready.");

            // 收藏表
            statement.execute("CREATE TABLE IF NOT EXISTS collections (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                    "user_id BIGINT NOT NULL," +
                    "content_id BIGINT NOT NULL," +
                    "content_type VARCHAR(20) NOT NULL," +
                    "collect_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "INDEX idx_user_id (user_id)," +
                    "INDEX idx_content (content_id, content_type)," +
                    "UNIQUE KEY uk_collect (user_id, content_id, content_type)," +
                    "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            System.out.println("[DB] Table collections ready.");

            // 活动表
            statement.execute("CREATE TABLE IF NOT EXISTS activity (" +
                    "activity_id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "user_id BIGINT NOT NULL," +
                    "cover_img VARCHAR(500)," +
                    "title VARCHAR(255) NOT NULL," +
                    "address VARCHAR(255)," +
                    "start_date VARCHAR(50)," +
                    "end_date VARCHAR(50)," +
                    "total_num INT NOT NULL DEFAULT 2," +
                    "join_num INT NOT NULL DEFAULT 0," +
                    "detail TEXT," +
                    "like_count INT NOT NULL DEFAULT 0," +
                    "collect_count INT NOT NULL DEFAULT 0," +
                    "status INT NOT NULL DEFAULT 0," +
                    "create_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "INDEX idx_user_id (user_id)," +
                    "INDEX idx_status (status))");
            System.out.println("[DB] Table activity ready.");

            // 活动参与表
            statement.execute("CREATE TABLE IF NOT EXISTS activity_join (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                    "activity_id BIGINT NOT NULL," +
                    "user_id BIGINT NOT NULL," +
                    "join_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "UNIQUE KEY uk_activity_user (activity_id, user_id)," +
                    "INDEX idx_user_id (user_id)," +
                    "INDEX idx_activity_id (activity_id))");
            System.out.println("[DB] Table activity_join ready.");

            // 消息表
            statement.execute("CREATE TABLE IF NOT EXISTS messages (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                    "sender_id BIGINT NOT NULL," +
                    "receiver_id BIGINT NOT NULL," +
                    "content TEXT NOT NULL," +
                    "is_read TINYINT DEFAULT 0," +
                    "send_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "created_at DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "INDEX idx_sender_id (sender_id)," +
                    "INDEX idx_receiver_id (receiver_id)," +
                    "INDEX idx_send_time (send_time)," +
                    "FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE," +
                    "FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            System.out.println("[DB] Table messages ready.");

            System.out.println("[DB] All tables created successfully.");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void seedData() {
        // 种子数据已移除，用户需通过注册接口创建
    }
}
