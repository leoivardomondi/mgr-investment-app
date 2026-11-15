-- ============================================================================
-- MGR Investment Group — SQLite / MySQL Schema for cPanel
-- Note: api.php automatically creates and seeds all of these tables in SQLite
-- (./mgr_data/mgr_database.sqlite) or MySQL (if db_config.php is configured).
-- ============================================================================

CREATE TABLE IF NOT EXISTS mgr_app_state (
    id INT PRIMARY KEY,
    state_json LONGTEXT NOT NULL,
    updated_by VARCHAR(150) DEFAULT 'System',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mgr_users (
    member_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(60) DEFAULT '',
    position_title VARCHAR(100) NOT NULL,
    membership_tier VARCHAR(60) NOT NULL,
    access_level VARCHAR(40) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    permissions_json TEXT NOT NULL,
    account_status VARCHAR(30) DEFAULT 'Active',
    must_change_password TINYINT(1) DEFAULT 0,
    failed_attempts INT DEFAULT 0,
    locked_until VARCHAR(40) DEFAULT NULL,
    last_login VARCHAR(40) DEFAULT NULL,
    updated_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mgr_sessions (
    token VARCHAR(128) PRIMARY KEY,
    member_id VARCHAR(32) NOT NULL,
    ip_address VARCHAR(64) DEFAULT '',
    user_agent VARCHAR(255) DEFAULT '',
    created_at VARCHAR(40) NOT NULL,
    expires_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mgr_otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(32) NOT NULL,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(16) NOT NULL,
    purpose VARCHAR(40) DEFAULT 'login_or_reset',
    expires_at VARCHAR(40) NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mgr_mail_settings (
    id INT PRIMARY KEY,
    config_json TEXT NOT NULL,
    updated_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mgr_mail_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(180) NOT NULL,
    recipient_name VARCHAR(150) DEFAULT '',
    subject VARCHAR(255) NOT NULL,
    body_preview TEXT,
    transport_used VARCHAR(40) DEFAULT 'php_mail',
    status VARCHAR(40) DEFAULT 'Sent',
    sent_by VARCHAR(150) DEFAULT 'System',
    created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mgr_audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_summary VARCHAR(255) NOT NULL,
    actor_name VARCHAR(150) DEFAULT 'Executive Committee',
    ip_address VARCHAR(64) DEFAULT '',
    created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
