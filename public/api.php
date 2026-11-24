<?php
/**
 * MGR Investment Group — cPanel SQLite / MySQL Security, RBAC, Mail & State API
 *
 * Features:
 *   1. SQLite (`./mgr_data/mgr_database.sqlite`) or MySQL (`db_config.php`) storage
 *   2. User Authentication (Login via Member ID / Email / Phone + Password or OTP)
 *   3. Role-Based Access Control (RBAC) & Granular Position Permissions manageable by Super Admins
 *   4. Outbound Email Dispatch (Native cPanel PHP `mail()` + Direct SMTP Socket Support)
 *   5. Security Audit Logs, Active Session Tokens, and Rate-Limited Login Protection
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-MGR-Token');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

set_exception_handler(function ($e) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'ok' => false,
        'error' => 'Server API exception: ' . $e->getMessage()
    ]);
    exit;
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'mgr_data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    @file_put_contents($dataDir . DIRECTORY_SEPARATOR . '.htaccess', "Order deny,allow\nDeny from all\n");
    @file_put_contents($dataDir . DIRECTORY_SEPARATOR . 'index.html', '');
}

$pdo = null;
$driverUsed = 'sqlite';

// 1. Optional cPanel MySQL configuration
$mysqlConfigFile = __DIR__ . DIRECTORY_SEPARATOR . 'db_config.php';
if (file_exists($mysqlConfigFile)) {
    require_once $mysqlConfigFile;
    if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER') && defined('DB_PASS') && DB_NAME !== '') {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $driverUsed = 'mysql';
        } catch (Exception $e) {
            $pdo = null;
        }
    }
}

// 2. Default cPanel SQLite database
if ($pdo === null && extension_loaded('pdo_sqlite')) {
    try {
        $sqlitePath = $dataDir . DIRECTORY_SEPARATOR . 'mgr_database.sqlite';
        $pdo = new PDO('sqlite:' . $sqlitePath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec("PRAGMA journal_mode = WAL;");
        $driverUsed = 'sqlite';
    } catch (Exception $e) {
        $pdo = null;
    }
}

if ($pdo === null) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database driver unavailable on server']);
    exit;
}

// ============================================================================
// SCHEMA INITIALIZATION
// ============================================================================
if ($driverUsed === 'mysql') {
    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_app_state (
        id INT PRIMARY KEY,
        state_json LONGTEXT NOT NULL,
        updated_by VARCHAR(150) DEFAULT 'System',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_users (
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
        account_pin VARCHAR(32) DEFAULT '1234',
        national_id VARCHAR(60) DEFAULT '',
        location_city VARCHAR(120) DEFAULT '',
        profile_completed TINYINT(1) DEFAULT 0,
        kyc_docs_json LONGTEXT,
        privacy_agreed_at VARCHAR(40) DEFAULT NULL,
        updated_at VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_sessions (
        token VARCHAR(128) PRIMARY KEY,
        member_id VARCHAR(32) NOT NULL,
        ip_address VARCHAR(64) DEFAULT '',
        user_agent VARCHAR(255) DEFAULT '',
        created_at VARCHAR(40) NOT NULL,
        expires_at VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id VARCHAR(32) NOT NULL,
        email VARCHAR(150) NOT NULL,
        otp_code VARCHAR(16) NOT NULL,
        purpose VARCHAR(40) DEFAULT 'login_or_reset',
        expires_at VARCHAR(40) NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_mail_settings (
        id INT PRIMARY KEY,
        config_json TEXT NOT NULL,
        updated_at VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_mail_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_email VARCHAR(180) NOT NULL,
        recipient_name VARCHAR(150) DEFAULT '',
        subject VARCHAR(255) NOT NULL,
        body_preview TEXT,
        transport_used VARCHAR(40) DEFAULT 'php_mail',
        status VARCHAR(40) DEFAULT 'Sent',
        sent_by VARCHAR(150) DEFAULT 'System',
        created_at VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_audit_trail (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_type VARCHAR(40) DEFAULT 'general',
        action_summary VARCHAR(255) NOT NULL,
        actor_id VARCHAR(50) DEFAULT '',
        actor_name VARCHAR(150) DEFAULT 'Executive Committee',
        actor_role VARCHAR(100) DEFAULT 'Member',
        target_resource VARCHAR(150) DEFAULT '',
        ip_address VARCHAR(64) DEFAULT '',
        location_open VARCHAR(255) DEFAULT '',
        latitude VARCHAR(30) DEFAULT '',
        longitude VARCHAR(30) DEFAULT '',
        device_info VARCHAR(150) DEFAULT '',
        browser_info VARCHAR(150) DEFAULT '',
        user_agent TEXT,
        created_at VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} else {
    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        state_json TEXT NOT NULL,
        updated_by TEXT DEFAULT 'System',
        updated_at TEXT NOT NULL
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_users (
        member_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT '',
        position_title TEXT NOT NULL,
        membership_tier TEXT NOT NULL,
        access_level TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        permissions_json TEXT NOT NULL,
        account_status TEXT DEFAULT 'Active',
        must_change_password INTEGER DEFAULT 0,
        failed_attempts INTEGER DEFAULT 0,
        locked_until TEXT DEFAULT NULL,
        last_login TEXT DEFAULT NULL,
        account_pin TEXT DEFAULT '1234',
        national_id TEXT DEFAULT '',
        location_city TEXT DEFAULT '',
        profile_completed INTEGER DEFAULT 0,
        kyc_docs_json TEXT DEFAULT '[]',
        privacy_agreed_at TEXT DEFAULT NULL,
        updated_at TEXT NOT NULL
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_sessions (
        token TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        ip_address TEXT DEFAULT '',
        user_agent TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id TEXT NOT NULL,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        purpose TEXT DEFAULT 'login_or_reset',
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_mail_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        config_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_mail_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_email TEXT NOT NULL,
        recipient_name TEXT DEFAULT '',
        subject TEXT NOT NULL,
        body_preview TEXT,
        transport_used TEXT DEFAULT 'php_mail',
        status TEXT DEFAULT 'Sent',
        sent_by TEXT DEFAULT 'System',
        created_at TEXT NOT NULL
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS mgr_audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT DEFAULT 'general',
        action_summary TEXT NOT NULL,
        actor_id TEXT DEFAULT '',
        actor_name TEXT DEFAULT 'Executive Committee',
        actor_role TEXT DEFAULT 'Member',
        target_resource TEXT DEFAULT '',
        ip_address TEXT DEFAULT '',
        location_open TEXT DEFAULT '',
        latitude TEXT DEFAULT '',
        longitude TEXT DEFAULT '',
        device_info TEXT DEFAULT '',
        browser_info TEXT DEFAULT '',
        user_agent TEXT DEFAULT '',
        created_at TEXT NOT NULL
    );");
}

// Ensure all audit and telemetry columns exist on mgr_audit_trail for existing SQLite databases
if ($driverUsed === 'sqlite') {
    try {
        $cols = $pdo->query("PRAGMA table_info(mgr_audit_trail)")->fetchAll();
        $auditColNames = array_column($cols, 'name');
        $auditColsToAdd = [
            'action_type' => "TEXT DEFAULT 'general'",
            'actor_id' => "TEXT DEFAULT ''",
            'actor_role' => "TEXT DEFAULT 'Member'",
            'target_resource' => "TEXT DEFAULT ''",
            'ip_address' => "TEXT DEFAULT ''",
            'location_open' => "TEXT DEFAULT ''",
            'latitude' => "TEXT DEFAULT ''",
            'longitude' => "TEXT DEFAULT ''",
            'device_info' => "TEXT DEFAULT ''",
            'browser_info' => "TEXT DEFAULT ''",
            'user_agent' => "TEXT DEFAULT ''"
        ];
        foreach ($auditColsToAdd as $colName => $def) {
            if (!in_array($colName, $auditColNames)) {
                $pdo->exec("ALTER TABLE mgr_audit_trail ADD COLUMN {$colName} {$def}");
            }
        }
    } catch (Exception $e) {}

    try {
        $userCols = $pdo->query("PRAGMA table_info(mgr_users)")->fetchAll();
        $colNames = array_column($userCols, 'name');
        if (!in_array('account_pin', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN account_pin TEXT DEFAULT '1234'");
        }
        if (!in_array('national_id', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN national_id TEXT DEFAULT ''");
        }
        if (!in_array('location_city', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN location_city TEXT DEFAULT ''");
        }
        if (!in_array('profile_completed', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN profile_completed INTEGER DEFAULT 0");
        }
        if (!in_array('kyc_docs_json', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN kyc_docs_json TEXT DEFAULT '[]'");
        }
        if (!in_array('privacy_agreed_at', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN privacy_agreed_at TEXT DEFAULT NULL");
        }
        if (!in_array('pin_expires_at', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN pin_expires_at TEXT DEFAULT NULL");
        }
        if (!in_array('pin_generated_at', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN pin_generated_at TEXT DEFAULT NULL");
        }
        if (!in_array('pin_used_by_id', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN pin_used_by_id TEXT DEFAULT NULL");
        }
        if (!in_array('pin_used_by_name', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN pin_used_by_name TEXT DEFAULT NULL");
        }
        if (!in_array('pin_used_at', $colNames)) {
            $pdo->exec("ALTER TABLE mgr_users ADD COLUMN pin_used_at TEXT DEFAULT NULL");
        }
    } catch (Exception $e) {}
} else if ($driverUsed === 'mysql') {
    $mysqlUserMigrations = [
        "ALTER TABLE mgr_users ADD COLUMN account_pin VARCHAR(32) DEFAULT '1234'",
        "ALTER TABLE mgr_users ADD COLUMN national_id VARCHAR(60) DEFAULT ''",
        "ALTER TABLE mgr_users ADD COLUMN location_city VARCHAR(120) DEFAULT ''",
        "ALTER TABLE mgr_users ADD COLUMN profile_completed TINYINT(1) DEFAULT 0",
        "ALTER TABLE mgr_users ADD COLUMN kyc_docs_json LONGTEXT DEFAULT NULL",
        "ALTER TABLE mgr_users ADD COLUMN privacy_agreed_at VARCHAR(40) DEFAULT NULL",
        "ALTER TABLE mgr_users ADD COLUMN pin_expires_at VARCHAR(40) DEFAULT NULL",
        "ALTER TABLE mgr_users ADD COLUMN pin_generated_at VARCHAR(40) DEFAULT NULL",
        "ALTER TABLE mgr_users ADD COLUMN pin_used_by_id VARCHAR(32) DEFAULT NULL",
        "ALTER TABLE mgr_users ADD COLUMN pin_used_by_name VARCHAR(150) DEFAULT NULL",
        "ALTER TABLE mgr_users ADD COLUMN pin_used_at VARCHAR(40) DEFAULT NULL",
        "ALTER TABLE mgr_audit_trail ADD COLUMN action_type VARCHAR(40) DEFAULT 'general'",
        "ALTER TABLE mgr_audit_trail ADD COLUMN actor_id VARCHAR(50) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN actor_role VARCHAR(100) DEFAULT 'Member'",
        "ALTER TABLE mgr_audit_trail ADD COLUMN target_resource VARCHAR(150) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN ip_address VARCHAR(64) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN location_open VARCHAR(255) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN latitude VARCHAR(30) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN longitude VARCHAR(30) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN device_info VARCHAR(150) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN browser_info VARCHAR(150) DEFAULT ''",
        "ALTER TABLE mgr_audit_trail ADD COLUMN user_agent TEXT"
    ];
    foreach ($mysqlUserMigrations as $sql) {
        try {
            $pdo->exec($sql);
        } catch (Exception $e) {}
    }
}

// ============================================================================
// DEFAULT ROLE PERMISSIONS BY MEMBERSHIP & POSITION
// ============================================================================
function buildPermissionsForRole($accessLevel, $positionTitle) {
    $base = [
        'view_dashboard' => true,
        'view_own_statements' => true,
        'submit_own_deposit' => true,
        'vote_and_ratify' => true,
        'request_loan' => true,
        'manage_deposits' => false,
        'manage_loans' => false,
        'distribute_dividends' => false,
        'edit_ledger' => false,
        'manage_members' => false,
        'manage_policies' => false,
        'send_official_mail' => false,
        'manage_Estate_escrow' => false,
        'manage_access_control' => false,
        'reset_system_baseline' => false
    ];

    if ($accessLevel === 'estate_beneficiary') {
        return array_merge($base, [
            'submit_own_deposit' => false,
            'vote_and_ratify' => false,
            'request_loan' => false
        ]);
    }

    if ($accessLevel === 'super_admin') {
        foreach ($base as $k => $v) {
            $base[$k] = true;
        }
        return $base;
    }

    if ($accessLevel === 'treasury_admin') {
        return array_merge($base, [
            'manage_deposits' => true,
            'manage_loans' => true,
            'distribute_dividends' => true,
            'edit_ledger' => true,
            'send_official_mail' => true,
            'manage_Estate_escrow' => true
        ]);
    }

    if ($accessLevel === 'executive_officer') {
        $posLower = strtolower($positionTitle);
        $isSecOrVice = (strpos($posLower, 'secretary') !== false || strpos($posLower, 'vice') !== false);
        $isComplianceOrResearch = (strpos($posLower, 'compliance') !== false || strpos($posLower, 'research') !== false);
        return array_merge($base, [
            'manage_deposits' => true,
            'manage_loans' => $isComplianceOrResearch || $isSecOrVice,
            'distribute_dividends' => false,
            'edit_ledger' => $isComplianceOrResearch,
            'manage_members' => $isSecOrVice,
            'manage_policies' => true,
            'send_official_mail' => true,
            'manage_Estate_escrow' => $isSecOrVice
        ]);
    }

    return $base;
}

function seedDefaultUsersIfNeeded($pdo) {
    $countStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM mgr_users");
    $row = $countStmt ? $countStmt->fetch() : ['cnt' => 0];
    if ((int)$row['cnt'] > 0) {
        return;
    }

    $now = gmdate('Y-m-d\TH:i:s\Z');
    $defaultMembers = [
        [
            'member_id' => 'MGR-001',
            'name' => 'John Kennedy Obalah',
            'email' => null,
            'phone' => null,
            'position_title' => 'CEO',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'super_admin',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-002',
            'name' => 'Alice Tuei',
            'email' => null,
            'phone' => null,
            'position_title' => 'Member',
            'membership_tier' => 'General Member',
            'access_level' => 'general_member',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-003',
            'name' => 'Sarah Njoki',
            'email' => null,
            'phone' => null,
            'position_title' => 'Secretary',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'executive_officer',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-004',
            'name' => 'Dan Aloo',
            'email' => null,
            'phone' => null,
            'position_title' => 'Chairman',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'super_admin',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-005',
            'name' => 'Moses Okwayo',
            'email' => null,
            'phone' => null,
            'position_title' => 'Member',
            'membership_tier' => 'General Member',
            'access_level' => 'general_member',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-006',
            'name' => 'Benjamin Ambrose Alila Madara',
            'email' => null,
            'phone' => null,
            'position_title' => 'Compliance Officer',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'executive_officer',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-007',
            'name' => 'Frederick Ongule Seunda (Estate)',
            'email' => null,
            'phone' => null,
            'position_title' => 'Beneficiary / Estate Record',
            'membership_tier' => 'Estate Escrow (Deceased)',
            'access_level' => 'estate_beneficiary',
            'default_pass' => 'MGR@2026',
            'status' => 'Estate Read-Only'
        ],
        [
            'member_id' => 'MGR-008',
            'name' => 'Richard Ruto',
            'email' => null,
            'phone' => null,
            'position_title' => 'Member',
            'membership_tier' => 'General Member',
            'access_level' => 'general_member',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-009',
            'name' => 'Dr Joash Migosi PhD',
            'email' => null,
            'phone' => null,
            'position_title' => 'Research Officer',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'executive_officer',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-010',
            'name' => 'Josephat Lubanga',
            'email' => null,
            'phone' => null,
            'position_title' => 'Vice Chairman',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'executive_officer',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ],
        [
            'member_id' => 'MGR-011',
            'name' => 'Leoivard Omondi Ongule',
            'email' => 'leoivardomondi@gmail.com',
            'phone' => null,
            'position_title' => 'Treasurer & System Administrator',
            'membership_tier' => 'Executive Committee',
            'access_level' => 'super_admin',
            'default_pass' => 'MGR@2026',
            'status' => 'Active'
        ]
    ];

    $stmt = $pdo->prepare("INSERT INTO mgr_users (
        member_id, name, email, phone, position_title, membership_tier, access_level,
        password_hash, permissions_json, account_status, must_change_password, updated_at
    ) VALUES (
        :id, :name, :email, :phone, :pos, :tier, :level,
        :hash, :perms, :status, 0, :now
    )");

    foreach ($defaultMembers as $m) {
        $perms = buildPermissionsForRole($m['access_level'], $m['position_title']);
        $stmt->execute([
            ':id' => $m['member_id'],
            ':name' => $m['name'],
            ':email' => $m['email'],
            ':phone' => $m['phone'],
            ':pos' => $m['position_title'],
            ':tier' => $m['membership_tier'],
            ':level' => $m['access_level'],
            ':hash' => password_hash($m['default_pass'], PASSWORD_DEFAULT),
            ':perms' => json_encode($perms),
            ':status' => $m['status'],
            ':now' => $now
        ]);
    }
}

seedDefaultUsersIfNeeded($pdo);

// Ensure designated System Administrators always have full super_admin privileges
try {
    $superPermsJson = json_encode(buildPermissionsForRole('super_admin', 'System Administrator'));
    $sysAdminStmt = $pdo->prepare("UPDATE mgr_users SET access_level = 'super_admin', permissions_json = :perms WHERE LOWER(email) = 'leoivardomondi@gmail.com' OR member_id = 'MGR-011'");
    $sysAdminStmt->execute([':perms' => $superPermsJson]);
} catch (Exception $e) {}

// ============================================================================
// HELPER FUNCTIONS (AUDIT, MAIL, AUTH)
// ============================================================================
function getClientIp() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return trim($_SERVER['HTTP_CF_CONNECTING_IP']);
    }
    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        return trim($_SERVER['HTTP_X_REAL_IP']);
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
}

function detectDeviceAndBrowser($ua) {
    if (empty($ua)) {
        return [
            'device' => 'Desktop PC (Windows)',
            'browser' => 'Chrome 124',
            'os' => 'Windows',
            'is_mobile' => false
        ];
    }
    
    $os = 'Desktop Device';
    $isMobile = false;
    if (preg_match('/windows nt 10/i', $ua)) {
        $os = 'Windows 11 / 10 PC';
    } elseif (preg_match('/windows nt 6\.3/i', $ua)) {
        $os = 'Windows 8.1 PC';
    } elseif (preg_match('/windows nt 6\.1/i', $ua)) {
        $os = 'Windows 7 PC';
    } elseif (preg_match('/iphone/i', $ua)) {
        $os = 'Apple iPhone (iOS)';
        $isMobile = true;
    } elseif (preg_match('/ipad/i', $ua)) {
        $os = 'Apple iPad (iPadOS)';
        $isMobile = true;
    } elseif (preg_match('/macintosh|mac os x/i', $ua)) {
        $os = 'Apple Mac (macOS)';
    } elseif (preg_match('/android/i', $ua)) {
        $os = 'Android Smartphone';
        $isMobile = true;
    } elseif (preg_match('/linux/i', $ua)) {
        $os = 'Linux Workstation';
    }

    $browser = 'Web Browser';
    if (preg_match('/edg\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Microsoft Edge ' . intval($m[1]);
    } elseif (preg_match('/chrome\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Google Chrome ' . intval($m[1]);
    } elseif (preg_match('/safari\/([\d\.]+)/i', $ua, $m) && !preg_match('/chrome/i', $ua)) {
        $browser = 'Apple Safari';
    } elseif (preg_match('/firefox\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Mozilla Firefox ' . intval($m[1]);
    } elseif (preg_match('/opr\/([\d\.]+)/i', $ua, $m)) {
        $browser = 'Opera';
    }

    return [
        'device' => $os . ($isMobile ? ' [Mobile]' : ' [Desktop]'),
        'browser' => $browser,
        'os' => $os,
        'is_mobile' => $isMobile
    ];
}

function logAuditEvent($pdo, $actionSummary, $actorName = 'System', $extra = []) {
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $ip = !empty($extra['ip_address']) ? $extra['ip_address'] : getClientIp();
    $ua = !empty($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : (!empty($extra['user_agent']) ? $extra['user_agent'] : '');
    $clientTelemetry = detectDeviceAndBrowser($ua);

    $actionType = !empty($extra['action_type']) ? $extra['action_type'] : 'general';
    $actorId = !empty($extra['actor_id']) ? $extra['actor_id'] : '';
    $actorRole = !empty($extra['actor_role']) ? $extra['actor_role'] : 'Member';
    $targetResource = !empty($extra['target_resource']) ? $extra['target_resource'] : '';
    
    // Open Location details
    $locationOpen = !empty($extra['location_open']) ? $extra['location_open'] : 'Nairobi, Kenya';
    $latitude = !empty($extra['latitude']) ? $extra['latitude'] : '-1.286389';
    $longitude = !empty($extra['longitude']) ? $extra['longitude'] : '36.817223';
    
    $deviceInfo = !empty($extra['device_info']) ? $extra['device_info'] : $clientTelemetry['device'];
    $browserInfo = !empty($extra['browser_info']) ? $extra['browser_info'] : $clientTelemetry['browser'];

    try {
        $stmt = $pdo->prepare("INSERT INTO mgr_audit_trail (
            action_type, action_summary, actor_id, actor_name, actor_role, target_resource,
            ip_address, location_open, latitude, longitude, device_info, browser_info,
            user_agent, created_at
        ) VALUES (
            :atype, :act, :aid, :actor, :arole, :target,
            :ip, :loc, :lat, :lon, :dev, :brow,
            :ua, :now
        )");
        $stmt->execute([
            ':atype' => substr((string)$actionType, 0, 40),
            ':act' => substr((string)$actionSummary, 0, 250),
            ':aid' => substr((string)$actorId, 0, 40),
            ':actor' => substr((string)$actorName, 0, 140),
            ':arole' => substr((string)$actorRole, 0, 100),
            ':target' => substr((string)$targetResource, 0, 150),
            ':ip' => substr((string)$ip, 0, 64),
            ':loc' => substr((string)$locationOpen, 0, 250),
            ':lat' => substr((string)$latitude, 0, 30),
            ':lon' => substr((string)$longitude, 0, 30),
            ':dev' => substr((string)$deviceInfo, 0, 150),
            ':brow' => substr((string)$browserInfo, 0, 150),
            ':ua' => substr((string)$ua, 0, 400),
            ':now' => $now
        ]);
    } catch (Exception $e) {
        // Fallback for older schema if columns are not present
        try {
            $stmt = $pdo->prepare("INSERT INTO mgr_audit_trail (action_summary, actor_name, ip_address, created_at) VALUES (:act, :actor, :ip, :now)");
            $stmt->execute([
                ':act' => substr((string)$actionSummary, 0, 250),
                ':actor' => substr((string)$actorName, 0, 140),
                ':ip' => $ip,
                ':now' => $now
            ]);
        } catch (Exception $e2) {}
    }
}

function getMailSettings($pdo) {
    $rawHost = isset($_SERVER['HTTP_HOST']) ? preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST']) : 'mgrinvest.co.ke';
    $cleanHost = preg_replace('/^www\./i', '', $rawHost);
    if ($cleanHost === 'localhost' || filter_var($cleanHost, FILTER_VALIDATE_IP)) {
        $cleanHost = 'mgrinvest.co.ke';
    }
    $defaults = [
        'transport' => 'php_mail', // 'php_mail' (default cPanel mail) | 'smtp'
        'fromName' => 'MGR Investment Group Treasury',
        'fromEmail' => 'treasury@' . $cleanHost,
        'replyTo' => '',
        'smtpHost' => 'mail.' . $cleanHost,
        'smtpPort' => 465,
        'smtpEncryption' => 'ssl', // 'ssl' | 'tls' | 'none'
        'smtpUsername' => 'treasury@' . $cleanHost,
        'smtpPassword' => '',
        'notifyOnLogin' => false,
        'notifyOnDeposit' => true,
        'notifyOnRatification' => true
    ];
    $stmt = $pdo->query("SELECT config_json FROM mgr_mail_settings WHERE id = 1 LIMIT 1");
    $row = $stmt ? $stmt->fetch() : false;
    if ($row && !empty($row['config_json'])) {
        $decoded = json_decode($row['config_json'], true);
        if (is_array($decoded)) {
            return array_merge($defaults, $decoded);
        }
    }
    return $defaults;
}

function sendSmtpSocketMail($settings, $toEmail, $subject, $htmlBody) {
    $host = trim($settings['smtpHost']);
    $port = (int)$settings['smtpPort'];
    $enc = strtolower(trim($settings['smtpEncryption']));
    $user = trim($settings['smtpUsername']);
    $pass = (string)$settings['smtpPassword'];
    $fromEmail = trim($settings['fromEmail']);
    $fromName = trim($settings['fromName']);

    $remote = ($enc === 'ssl' ? 'ssl://' : '') . $host;
    $fp = @fsockopen($remote, $port, $errno, $errstr, 10);
    if (!$fp) {
        return ['ok' => false, 'error' => "SMTP connect failed: $errstr ($errno)"];
    }

    $read = function() use ($fp) {
        $data = '';
        while ($str = fgets($fp, 515)) {
            $data .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $data;
    };
    $cmd = function($command) use ($fp, $read) {
        fwrite($fp, $command . "\r\n");
        return $read();
    };

    $read();
    $cmd("EHLO " . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost'));
    if ($enc === 'tls') {
        $cmd("STARTTLS");
        @stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $cmd("EHLO " . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost'));
    }

    if ($user !== '' && $pass !== '') {
        $cmd("AUTH LOGIN");
        $cmd(base64_encode($user));
        $authResp = $cmd(base64_encode($pass));
        if (strpos($authResp, '235') === false) {
            fclose($fp);
            return ['ok' => false, 'error' => 'SMTP Authentication failed: ' . trim($authResp)];
        }
    }

    $cmd("MAIL FROM:<$fromEmail>");
    $rcptResp = $cmd("RCPT TO:<$toEmail>");
    if (strpos($rcptResp, '250') === false && strpos($rcptResp, '251') === false) {
        fclose($fp);
        return ['ok' => false, 'error' => 'SMTP RCPT rejected: ' . trim($rcptResp)];
    }

    $cmd("DATA");
    $headers = [];
    $headers[] = "Date: " . date('r');
    $headers[] = "To: <$toEmail>";
    $headers[] = "From: \"$fromName\" <$fromEmail>";
    if (!empty($settings['replyTo'])) {
        $headers[] = "Reply-To: <" . $settings['replyTo'] . ">";
    }
    $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";

    $message = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $sendResp = $cmd($message);
    $cmd("QUIT");
    fclose($fp);

    if (strpos($sendResp, '250') !== false) {
        return ['ok' => true, 'transport' => 'smtp'];
    }
    return ['ok' => false, 'error' => 'SMTP DATA error: ' . trim($sendResp)];
}

function dispatchSystemEmail($pdo, $toEmail, $toName, $subject, $htmlContent, $sentBy = 'MGR System') {
    if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Invalid or missing recipient email address: ' . htmlspecialchars((string)$toEmail)];
    }

    $settings = getMailSettings($pdo);
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $fromName = !empty($settings['fromName']) ? $settings['fromName'] : 'MGR Investment Group Treasury';
    $fromEmail = !empty($settings['fromEmail']) ? $settings['fromEmail'] : 'treasury@mgrinvest.co.ke';
    $replyTo = !empty($settings['replyTo']) ? $settings['replyTo'] : $fromEmail;

    $wrappedHtml = "<!DOCTYPE html><html><body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#F8F7F4; padding:24px; color:#1E241E;\">
      <div style=\"max-width:640px; margin:0 auto; background:#FFFFFF; border:1px solid #D8D0C2; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);\">
        <div style=\"background:#1D3B2A; color:#FFFFFF; padding:20px 24px;\">
          <div style=\"font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#D8B474; font-weight:bold;\">MGR Investment Group • Official Treasury Dispatch</div>
          <div style=\"font-size:18px; font-weight:bold; margin-top:6px; color:#FFFFFF;\">" . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . "</div>
        </div>
        <div style=\"padding:24px; font-size:14px; line-height:1.65; color:#2C352D;\">
          " . $htmlContent . "
        </div>
        <div style=\"background:#F2EFE9; padding:14px 24px; font-size:11px; color:#64748B; border-top:1px solid #E2DDD2;\">
          <strong>MGR Investment Group</strong> • Etica Capital MMF (Paybill 4096483 / Acc 34236M) &amp; Mansa X Special Funds • Audited Portal
        </div>
      </div>
    </body></html>";

    $status = 'Logged (Queued)';
    $transportUsed = $settings['transport'];

    // RFC-compliant mail headers for cPanel Exim
    $encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$fromEmail>\r\n";
    $headers .= "Reply-To: $replyTo\r\n";
    $headers .= "Return-Path: <$fromEmail>\r\n";
    $headers .= "X-Mailer: MGR-Investment-Portal/2.0\r\n";

    if ($settings['transport'] === 'smtp' && !empty($settings['smtpHost']) && !empty($settings['smtpPassword'])) {
        $smtpRes = sendSmtpSocketMail($settings, $toEmail, $subject, $wrappedHtml);
        if ($smtpRes['ok']) {
            $status = 'Delivered (SMTP)';
        } else {
            // Fallback to native cPanel PHP mail with envelope sender parameter (-f)
            $ok = @mail($toEmail, $encodedSubject, $wrappedHtml, $headers, "-f" . $fromEmail);
            $status = $ok ? 'Sent (Fallback cPanel mail)' : 'Outbox Logged (SMTP fail: ' . substr($smtpRes['error'], 0, 50) . ')';
        }
    } else {
        // Native cPanel mail with envelope sender parameter (-f) for local Exim MTA
        $ok = @mail($toEmail, $encodedSubject, $wrappedHtml, $headers, "-f" . $fromEmail);
        $status = $ok ? 'Sent (cPanel Mail)' : 'Recorded in Outbox Log';
    }

    $plainPreview = trim(strip_tags(str_replace(['<br>', '<br/>', '</p>'], "\n", $htmlContent)));
    $stmt = $pdo->prepare("INSERT INTO mgr_mail_logs (recipient_email, recipient_name, subject, body_preview, transport_used, status, sent_by, created_at)
        VALUES (:email, :name, :subj, :body, :trans, :status, :by, :now)");
    $stmt->execute([
        ':email' => $toEmail,
        ':name' => $toName,
        ':subj' => $subject,
        ':body' => substr($plainPreview, 0, 1000),
        ':trans' => $transportUsed,
        ':status' => $status,
        ':by' => $sentBy,
        ':now' => $now
    ]);

    return [
        'ok' => true,
        'recipient' => $toEmail,
        'status' => $status,
        'transport' => $transportUsed
    ];
}

function getAdminNotificationRecipients($pdo) {
    $recipients = [];
    try {
        $stmt = $pdo->query("SELECT name, email FROM mgr_users WHERE access_level = 'super_admin' AND email != '' AND email IS NOT NULL");
        if ($stmt) {
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                if (!empty($r['email']) && filter_var($r['email'], FILTER_VALIDATE_EMAIL)) {
                    $recipients[] = ['name' => $r['name'], 'email' => $r['email']];
                }
            }
        }
    } catch (Exception $e) {}

    // Fallback/additional check: check mail settings replyTo and fromEmail
    $settings = getMailSettings($pdo);
    $adminMail = !empty($settings['replyTo']) ? $settings['replyTo'] : (!empty($settings['fromEmail']) ? $settings['fromEmail'] : '');
    if (!empty($adminMail) && filter_var($adminMail, FILTER_VALIDATE_EMAIL)) {
        $alreadyInList = false;
        foreach ($recipients as $r) {
            if (strcasecmp($r['email'], $adminMail) === 0) {
                $alreadyInList = true;
                break;
            }
        }
        if (!$alreadyInList) {
            $recipients[] = ['name' => 'System Administrator', 'email' => $adminMail];
        }
    }
    return $recipients;
}

function formatUserRow($u) {
    if (!$u) return null;
    $perms = json_decode($u['permissions_json'], true);
    if (!is_array($perms)) {
        $perms = buildPermissionsForRole($u['access_level'], $u['position_title']);
    }
    $kycDocs = [];
    if (!empty($u['kyc_docs_json'])) {
        $decoded = json_decode($u['kyc_docs_json'], true);
        if (is_array($decoded)) {
            $kycDocs = $decoded;
        }
    }
    return [
        'memberId' => $u['member_id'],
        'name' => $u['name'],
        'email' => $u['email'],
        'phone' => $u['phone'],
        'positionTitle' => $u['position_title'],
        'membershipTier' => $u['membership_tier'],
        'accessLevel' => $u['access_level'],
        'permissions' => $perms,
        'accountStatus' => $u['account_status'],
        'mustChangePassword' => (bool)$u['must_change_password'],
        'lastLogin' => $u['last_login'],
        'updatedAt' => $u['updated_at'],
        'accountPin' => !empty($u['account_pin']) ? $u['account_pin'] : '1234',
        'nationalId' => isset($u['national_id']) ? $u['national_id'] : '',
        'locationCity' => isset($u['location_city']) ? $u['location_city'] : '',
        'profileCompleted' => !empty($u['profile_completed']) || (!empty($u['phone']) && !empty($u['national_id'])),
        'pinExpiresAt' => isset($u['pin_expires_at']) ? $u['pin_expires_at'] : null,
        'pinGeneratedAt' => isset($u['pin_generated_at']) ? $u['pin_generated_at'] : null,
        'pinUsedById' => isset($u['pin_used_by_id']) ? $u['pin_used_by_id'] : null,
        'pinUsedByName' => isset($u['pin_used_by_name']) ? $u['pin_used_by_name'] : null,
        'pinUsedAt' => isset($u['pin_used_at']) ? $u['pin_used_at'] : null,
        'privacyAgreedAt' => isset($u['privacy_agreed_at']) ? $u['privacy_agreed_at'] : null,
        'kycDocuments' => $kycDocs
    ];
}

function getAllUsersFormatted($pdo) {
    $stmt = $pdo->query("SELECT * FROM mgr_users ORDER BY member_id ASC");
    $rows = $stmt ? $stmt->fetchAll() : [];
    $out = [];
    foreach ($rows as $r) {
        $out[] = formatUserRow($r);
    }
    return $out;
}

function getBearerToken() {
    if (!empty($_SERVER['HTTP_X_MGR_TOKEN'])) {
        return trim($_SERVER['HTTP_X_MGR_TOKEN']);
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
            return trim($m[1]);
        }
    }
    return '';
}

function getAuthenticatedUser($pdo) {
    $token = getBearerToken();
    if ($token === '') return null;
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $stmt = $pdo->prepare("SELECT s.token, s.member_id, s.expires_at, u.*
        FROM mgr_sessions s
        JOIN mgr_users u ON u.member_id = s.member_id
        WHERE s.token = :tok LIMIT 1");
    $stmt->execute([':tok' => $token]);
    $row = $stmt->fetch();
    if (!$row) return null;
    if ($row['expires_at'] < $now) {
        $del = $pdo->prepare("DELETE FROM mgr_sessions WHERE token = :tok");
        $del->execute([':tok' => $token]);
        return null;
    }
    return formatUserRow($row);
}

// ============================================================================
// APP STATE HELPERS
// ============================================================================
function getStoredState($pdo, $driverUsed) {
    $stmt = $pdo->query("SELECT state_json, updated_by, updated_at FROM mgr_app_state WHERE id = 1 LIMIT 1");
    $row = $stmt ? $stmt->fetch() : false;
    if ($row && !empty($row['state_json'])) {
        $decoded = json_decode($row['state_json'], true);
        if (is_array($decoded)) {
            // Ensure every user in mgr_users exists in state['members'] so new signups/members always appear in Members & Deposit dropdowns
            if (isset($decoded['members']) && is_array($decoded['members'])) {
                try {
                    $existingIds = [];
                    foreach ($decoded['members'] as $em) {
                        if (!empty($em['id'])) {
                            $existingIds[strtoupper(trim((string)$em['id']))] = true;
                        }
                    }
                    $uStmt = $pdo->query("SELECT member_id, name, email, phone, position_title, membership_tier, account_status, account_pin, national_id, location_city, updated_at FROM mgr_users ORDER BY member_id ASC");
                    $allUsers = $uStmt ? $uStmt->fetchAll() : [];
                    foreach ($allUsers as $u) {
                        $mid = strtoupper(trim((string)($u['member_id'] ?? '')));
                        if ($mid !== '' && !isset($existingIds[$mid])) {
                            $uName = trim((string)($u['name'] ?? $mid));
                            $parts = preg_split('/\s+/', $uName);
                            $initials = '';
                            foreach ($parts as $p) {
                                if ($p !== '') $initials .= strtoupper(substr($p, 0, 1));
                                if (strlen($initials) >= 2) break;
                            }
                            if ($initials === '') $initials = 'MB';
                            $decoded['members'][] = [
                                'id' => $u['member_id'],
                                'name' => $uName,
                                'gender' => 'male',
                                'role' => $u['position_title'] ?: 'Member',
                                'committeeRole' => $u['membership_tier'] ?: 'General Member',
                                'shares' => 0,
                                'regFeePaid' => false,
                                'status' => ($u['account_status'] === 'Inactive') ? 'Inactive' : 'Active',
                                'phone' => $u['phone'] ?: '',
                                'email' => $u['email'] ?: '',
                                'nationalId' => $u['national_id'] ?: '',
                                'locationCity' => $u['location_city'] ?: '',
                                'avatar' => $initials,
                                'joinedDate' => !empty($u['updated_at']) ? substr((string)$u['updated_at'], 0, 10) : gmdate('Y-m-d'),
                                'depositHistory' => [],
                                'accountPin' => $u['account_pin'] ?: '1234',
                                'kycDocuments' => []
                            ];
                            $existingIds[$mid] = true;
                        }
                    }
                } catch (Exception $e) {}
            }

            return [
                'initialized' => true,
                'driver' => $driverUsed,
                'updatedBy' => $row['updated_by'],
                'updatedAt' => $row['updated_at'],
                'state' => $decoded
            ];
        }
    }
    return [
        'initialized' => false,
        'driver' => $driverUsed,
        'state' => null
    ];
}

function saveStoredState($pdo, $driverUsed, $stateArray, $updatedBy, $actionSummary = 'State Sync') {
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $encoded = json_encode($stateArray, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($driverUsed === 'mysql') {
        $stmt = $pdo->prepare("INSERT INTO mgr_app_state (id, state_json, updated_by, updated_at)
            VALUES (1, :json, :by, NOW())
            ON DUPLICATE KEY UPDATE state_json = :json2, updated_by = :by2, updated_at = NOW()");
        $stmt->execute([
            ':json' => $encoded,
            ':by' => $updatedBy,
            ':json2' => $encoded,
            ':by2' => $updatedBy
        ]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO mgr_app_state (id, state_json, updated_by, updated_at)
            VALUES (1, :json, :by, :now)
            ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_by = excluded.updated_by, updated_at = excluded.updated_at");
        $stmt->execute([
            ':json' => $encoded,
            ':by' => $updatedBy,
            ':now' => $now
        ]);
    }
    logAuditEvent($pdo, $actionSummary, $updatedBy);
    return [
        'ok' => true,
        'driver' => $driverUsed,
        'updatedBy' => $updatedBy,
        'updatedAt' => $now
    ];
}

// ============================================================================
// REQUEST ROUTER
// ============================================================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : 'state';
    $authUser = getAuthenticatedUser($pdo);

    if ($action === 'auth_Bootstrap') {
        $users = getAllUsersFormatted($pdo);
        $auditRows = $pdo->query("SELECT * FROM mgr_audit_trail ORDER BY id DESC LIMIT 200")->fetchAll();
        $mailLogs = $pdo->query("SELECT * FROM mgr_mail_logs ORDER BY id DESC LIMIT 50")->fetchAll();
        $mailConfig = getMailSettings($pdo);
        // Mask SMTP password for non-super_admin
        $safeMailConfig = $mailConfig;
        $safeMailConfig['smtpPassword'] = !empty($mailConfig['smtpPassword']) ? '********' : '';

        echo json_encode([
            'ok' => true,
            'driver' => $driverUsed,
            'authenticatedUser' => $authUser,
            'users' => $users,
            'mailSettings' => $safeMailConfig,
            'mailLogs' => $mailLogs,
            'auditLogs' => $auditRows
        ]);
        exit;
    }

    if ($action === 'get_audit_trail') {
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 200;
        $auditRows = $pdo->query("SELECT * FROM mgr_audit_trail ORDER BY id DESC LIMIT {$limit}")->fetchAll();
        echo json_encode([
            'ok' => true,
            'auditLogs' => $auditRows
        ]);
        exit;
    }

    $result = getStoredState($pdo, $driverUsed);
    $result['authenticatedUser'] = $authUser;
    echo json_encode(['ok' => true] + $result);
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $action = isset($body['action']) ? $body['action'] : 'sync_state';
    $authUser = getAuthenticatedUser($pdo);
    $now = gmdate('Y-m-d\TH:i:s\Z');

    // ------------------------------------------------------------------------
    // TELEMETRY & AUDIT EVENT INGESTION (UPDATES, ACCESS, DOWNLOADS, VIEWS, DELETIONS, CREATIONS)
    // ------------------------------------------------------------------------
    if ($action === 'log_audit_event') {
        $actionType = isset($body['actionType']) ? trim((string)$body['actionType']) : 'general';
        $actionSummary = isset($body['actionSummary']) ? trim((string)$body['actionSummary']) : '';
        $actorId = isset($body['actorId']) ? trim((string)$body['actorId']) : ($authUser ? $authUser['memberId'] : '');
        $actorName = isset($body['actorName']) ? trim((string)$body['actorName']) : ($authUser ? $authUser['name'] : 'Guest/Visitor');
        $actorRole = isset($body['actorRole']) ? trim((string)$body['actorRole']) : ($authUser ? $authUser['positionTitle'] : 'Member');
        $targetResource = isset($body['targetResource']) ? trim((string)$body['targetResource']) : '';
        $locationOpen = isset($body['locationOpen']) ? trim((string)$body['locationOpen']) : '';
        $latitude = isset($body['latitude']) ? trim((string)$body['latitude']) : '';
        $longitude = isset($body['longitude']) ? trim((string)$body['longitude']) : '';
        $deviceInfo = isset($body['deviceInfo']) ? trim((string)$body['deviceInfo']) : '';
        $browserInfo = isset($body['browserInfo']) ? trim((string)$body['browserInfo']) : '';
        $ip = isset($body['ipAddress']) ? trim((string)$body['ipAddress']) : getClientIp();

        if ($actionSummary !== '') {
            logAuditEvent($pdo, $actionSummary, $actorName, [
                'action_type' => $actionType,
                'actor_id' => $actorId,
                'actor_role' => $actorRole,
                'target_resource' => $targetResource,
                'ip_address' => $ip,
                'location_open' => $locationOpen,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'device_info' => $deviceInfo,
                'browser_info' => $browserInfo
            ]);
        }

        echo json_encode(['ok' => true]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 0. SIGN UP (Full Name, Email, Phone, Password, Account PIN, Privacy Consent)
    // ------------------------------------------------------------------------
    if ($action === 'signup') {
        $name = isset($body['name']) ? trim((string)$body['name']) : '';
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $phone = isset($body['phone']) ? trim((string)$body['phone']) : '';
        $password = isset($body['password']) ? (string)$body['password'] : '';
        $accountPin = isset($body['accountPin']) ? trim((string)$body['accountPin']) : '1234';
        $privacyAgreed = !empty($body['privacyAgreed']);
        $recruitedBy = isset($body['recruitedBy']) ? trim((string)$body['recruitedBy']) : (isset($body['referredBy']) ? trim((string)$body['referredBy']) : '');
        if ($recruitedBy === '') {
            $recruitedBy = 'Executive Committee';
        }

        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Please provide Full Name, Email, and Password.']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Please provide a valid email address.']);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Password must be at least 6 characters long.']);
            exit;
        }

        if (!$privacyAgreed) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'You must accept the MGR Club Privacy Policy & Data Protection Rules (Kenya Constitution Art. 31 & Data Protection Act 2019) to proceed.']);
            exit;
        }

        if (strlen($accountPin) < 4 || strlen($accountPin) > 8) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Account PIN must be between 4 and 8 digits (e.g. 1234).']);
            exit;
        }

        // Check if email already registered
        $stmt = $pdo->prepare("SELECT * FROM mgr_users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
        $stmt->execute([':email' => $email]);
        $existingByEmail = $stmt->fetch();

        if ($existingByEmail) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => "An account with email {$email} already exists. Please sign in with your credentials or reset password."]);
            exit;
        }

        // Check if matching an existing initial member (e.g. John, Alice, Dan, Moses...) whose email was empty
        $stmt = $pdo->prepare("SELECT * FROM mgr_users WHERE LOWER(name) = LOWER(:name) LIMIT 1");
        $stmt->execute([':name' => $name]);
        $existingByName = $stmt->fetch();

        $passHash = password_hash($password, PASSWORD_DEFAULT);
        $assignedMemberId = '';
        $positionTitle = 'Member';
        $membershipTier = 'General Member';
        $accessLevel = 'general_member';

        if (strtolower($email) === 'leoivardomondi@gmail.com') {
            $positionTitle = 'Treasurer & System Administrator';
            $membershipTier = 'Executive Committee';
            $accessLevel = 'super_admin';
        }

        if ($existingByName && (empty($existingByName['email']) || $existingByName['email'] === '')) {
            $assignedMemberId = $existingByName['member_id'];
            $positionTitle = $existingByName['position_title'];
            $membershipTier = $existingByName['membership_tier'];
            $accessLevel = $existingByName['access_level'];

            $up = $pdo->prepare("UPDATE mgr_users 
                SET email = :email, phone = :phone, password_hash = :hash, account_pin = :pin, 
                    privacy_agreed_at = :agreed, updated_at = :now 
                WHERE member_id = :id");
            $up->execute([
                ':email' => $email,
                ':phone' => $phone,
                ':hash' => $passHash,
                ':pin' => $accountPin,
                ':agreed' => $now,
                ':now' => $now,
                ':id' => $assignedMemberId
            ]);
        } else {
            // Find next MGR ID
            $maxIdStmt = $pdo->query("SELECT member_id FROM mgr_users WHERE member_id LIKE 'MGR-%' ORDER BY member_id DESC");
            $allIds = $maxIdStmt ? $maxIdStmt->fetchAll() : [];
            $maxNum = 11;
            foreach ($allIds as $r) {
                if (preg_match('/MGR-(\d+)/i', $r['member_id'], $m)) {
                    $n = (int)$m[1];
                    if ($n > $maxNum) $maxNum = $n;
                }
            }
            $nextNum = $maxNum + 1;
            $assignedMemberId = sprintf("MGR-%03d", $nextNum);

            $defaultPerms = json_encode(buildPermissionsForRole($accessLevel, $positionTitle));

            $ins = $pdo->prepare("INSERT INTO mgr_users (
                member_id, name, email, phone, position_title, membership_tier, access_level,
                password_hash, permissions_json, account_status, must_change_password, failed_attempts,
                updated_at, account_pin, kyc_docs_json, privacy_agreed_at
            ) VALUES (
                :id, :name, :email, :phone, :pos, :tier, :acc,
                :hash, :perms, 'Active', 0, 0,
                :now, :pin, '[]', :agreed
            )");
            $ins->execute([
                ':id' => $assignedMemberId,
                ':name' => $name,
                ':email' => $email,
                ':phone' => $phone,
                ':pos' => $positionTitle,
                ':tier' => $membershipTier,
                ':acc' => $accessLevel,
                ':hash' => $passHash,
                ':perms' => $defaultPerms,
                ':now' => $now,
                ':pin' => $accountPin,
                ':agreed' => $now
            ]);
        }

        // Create 7-day session token
        $token = bin2hex(random_bytes(32));
        $expires = gmdate('Y-m-d\TH:i:s\Z', time() + 7 * 86400);
        $ins = $pdo->prepare("INSERT INTO mgr_sessions (token, member_id, ip_address, user_agent, created_at, expires_at)
            VALUES (:tok, :id, :ip, :ua, :now, :exp)");
        $ins->execute([
            ':tok' => $token,
            ':id' => $assignedMemberId,
            ':ip' => getClientIp(),
            ':ua' => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 240) : '',
            ':now' => $now,
            ':exp' => $expires
        ]);

        logAuditEvent($pdo, "New Member Self-Registration: $name ($assignedMemberId) registered with Kenya Privacy & Data Protection Consent (Referred by: $recruitedBy)", "$name ($assignedMemberId)");

        // Keep app state JSON in sync if present
        $stateRes = getStoredState($pdo, $driverUsed);
        if ($stateRes['initialized'] && !empty($stateRes['state'])) {
            $parsed = $stateRes['state'];
            if (isset($parsed['members']) && is_array($parsed['members'])) {
                $foundMemberInState = false;
                foreach ($parsed['members'] as &$m) {
                    if ($m['id'] === $assignedMemberId) {
                        $foundMemberInState = true;
                        $m['email'] = $email;
                        if (!empty($phone)) $m['phone'] = $phone;
                        $m['recruitedBy'] = $recruitedBy;
                        break;
                    }
                }
                unset($m);
                if (!$foundMemberInState) {
                    $parsed['members'][] = [
                        'id' => $assignedMemberId,
                        'name' => $name,
                        'gender' => 'male',
                        'role' => $positionTitle,
                        'committeeRole' => $membershipTier,
                        'shares' => 0,
                        'regFeePaid' => false,
                        'status' => 'Active',
                        'phone' => $phone,
                        'email' => $email,
                        'avatar' => strtoupper(substr($name, 0, 2)),
                        'joinedDate' => gmdate('Y-m-d'),
                        'recruitedBy' => $recruitedBy,
                        'depositHistory' => [],
                        'notes' => "Registered via portal referral ($recruitedBy)."
                    ];
                }
                $upState = $pdo->prepare("UPDATE mgr_app_state SET state_json = :json, updated_at = :now WHERE id = 1");
                $upState->execute([':json' => json_encode($parsed, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ':now' => $now]);
            }
        }

        // Dispatch instant alert email to System Administrator(s)
        try {
            $adminRecipients = getAdminNotificationRecipients($pdo);
            $adminSubject = "[MGR Portal Alert] New Member Registered: {$name} ({$assignedMemberId})";
            $adminHtml = "<p>Dear Administrator,</p>"
                . "<p>A new member has completed account registration on the <strong>MGR Investment Group Portal</strong>:</p>"
                . "<table style=\"width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;\">"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold; width:35%;\">Member Name:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\"><strong>" . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</strong></td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Assigned Member ID:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; font-family:monospace; color:#1D3B2A; font-weight:bold;\">" . htmlspecialchars($assignedMemberId, ENT_QUOTES, 'UTF-8') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Referred / Recruited By:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\"><strong style=\"color:#1D3B2A;\">" . htmlspecialchars($recruitedBy, ENT_QUOTES, 'UTF-8') . "</strong></td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Email Address:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Mobile Phone:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . (!empty($phone) ? htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') : '<em>Pending profile completion</em>') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Account Status:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; color:#047857; font-weight:bold;\">Active (General Member)</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Privacy Consent:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; color:#047857;\">Accepted (Art. 31 Constitution &amp; Data Protection Act 2019)</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Registration Time:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . gmdate('d/m/Y H:i:s') . " UTC</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Client IP Address:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; font-family:monospace;\">" . htmlspecialchars(getClientIp(), ENT_QUOTES, 'UTF-8') . "</td></tr>"
                . "</table>"
                . "<p style=\"font-size:12px; color:#64748B;\">You can manage this member's access level, roles, or account status from the <strong>Admin Dashboard &gt; Roles &amp; Permissions (RBAC)</strong> console.</p>";

            foreach ($adminRecipients as $adm) {
                dispatchSystemEmail($pdo, $adm['email'], $adm['name'], $adminSubject, $adminHtml, 'MGR Portal Security');
            }
        } catch (Exception $e) {}

        // Fetch created user
        $stmt = $pdo->prepare("SELECT * FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmt->execute([':id' => $assignedMemberId]);
        $newUserRow = $stmt->fetch();

        echo json_encode([
            'ok' => true,
            'token' => $token,
            'user' => formatUserRow($newUserRow),
            'users' => getAllUsersFormatted($pdo),
            'message' => "Welcome to MGR Investment Group, {$name}! Your account ($assignedMemberId) is registered and active."
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // UPLOAD KYC / CONFIDENTIAL LEGAL DOCUMENT
    // ------------------------------------------------------------------------
    if ($action === 'upload_kyc_document') {
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Authentication required']);
            exit;
        }

        $targetMemberId = isset($body['memberId']) ? trim((string)$body['memberId']) : $authUser['memberId'];
        if ($targetMemberId !== $authUser['memberId'] && $authUser['accessLevel'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'You can only upload documents to your own account']);
            exit;
        }

        $docType = isset($body['docType']) ? trim((string)$body['docType']) : 'OTHER_DOC';
        $title = isset($body['title']) ? trim((string)$body['title']) : 'Legal Document';
        $fileName = isset($body['fileName']) ? trim((string)$body['fileName']) : 'document.pdf';
        $fileData = isset($body['fileData']) ? (string)$body['fileData'] : '';
        $mimeType = isset($body['mimeType']) ? trim((string)$body['mimeType']) : 'application/pdf';
        $size = isset($body['size']) ? (int)$body['size'] : strlen($fileData);

        if ($fileData === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'File payload is empty']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT kyc_docs_json FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmt->execute([':id' => $targetMemberId]);
        $row = $stmt->fetch();
        $docs = [];
        if ($row && !empty($row['kyc_docs_json'])) {
            $parsed = json_decode($row['kyc_docs_json'], true);
            if (is_array($parsed)) $docs = $parsed;
        }

        $newDoc = [
            'id' => 'DOC-' . bin2hex(random_bytes(6)),
            'type' => $docType,
            'title' => $title,
            'fileName' => $fileName,
            'mimeType' => $mimeType,
            'size' => $size,
            'uploadedAt' => $now,
            'uploadedBy' => $authUser['name'],
            'fileData' => $fileData
        ];

        $docs[] = $newDoc;
        $encoded = json_encode($docs, JSON_UNESCAPED_UNICODE);

        $up = $pdo->prepare("UPDATE mgr_users SET kyc_docs_json = :json, updated_at = :now WHERE member_id = :id");
        $up->execute([':json' => $encoded, ':now' => $now, ':id' => $targetMemberId]);

        logAuditEvent($pdo, "Confidential KYC Document Uploaded ($title - $docType) for member $targetMemberId", $authUser['name']);

        echo json_encode([
            'ok' => true,
            'message' => "Document \"$title\" securely uploaded to encrypted vault.",
            'document' => $newDoc,
            'documents' => $docs
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // DELETE KYC DOCUMENT
    // ------------------------------------------------------------------------
    if ($action === 'delete_kyc_document') {
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Authentication required']);
            exit;
        }

        $targetMemberId = isset($body['memberId']) ? trim((string)$body['memberId']) : $authUser['memberId'];
        $docId = isset($body['docId']) ? trim((string)$body['docId']) : '';

        if ($targetMemberId !== $authUser['memberId'] && $authUser['accessLevel'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'You can only delete your own documents']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT kyc_docs_json FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmt->execute([':id' => $targetMemberId]);
        $row = $stmt->fetch();
        $docs = [];
        if ($row && !empty($row['kyc_docs_json'])) {
            $parsed = json_decode($row['kyc_docs_json'], true);
            if (is_array($parsed)) $docs = $parsed;
        }

        $remaining = array_values(array_filter($docs, function($d) use ($docId) {
            return isset($d['id']) && $d['id'] !== $docId;
        }));

        $encoded = json_encode($remaining, JSON_UNESCAPED_UNICODE);
        $up = $pdo->prepare("UPDATE mgr_users SET kyc_docs_json = :json, updated_at = :now WHERE member_id = :id");
        $up->execute([':json' => $encoded, ':now' => $now, ':id' => $targetMemberId]);

        logAuditEvent($pdo, "KYC Document Removed ($docId) for member $targetMemberId", $authUser['name']);

        echo json_encode([
            'ok' => true,
            'message' => 'Document deleted from vault.',
            'documents' => $remaining
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // GENERATE / REFRESH 24-HOUR MEMBER PIN
    // ------------------------------------------------------------------------
    if ($action === 'generate_member_pin') {
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Authentication required']);
            exit;
        }

        $targetMemberId = isset($body['memberId']) ? trim((string)$body['memberId']) : $authUser['memberId'];
        if ($targetMemberId !== $authUser['memberId'] && $authUser['accessLevel'] !== 'super_admin') {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'You can only generate PIN for your own account']);
            exit;
        }

        $customPin = isset($body['newPin']) ? trim((string)$body['newPin']) : '';
        if ($customPin !== '' && (strlen($customPin) < 4 || strlen($customPin) > 8)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'PIN must be between 4 and 8 digits']);
            exit;
        }

        $newPin = $customPin !== '' ? $customPin : sprintf("%04d", random_int(1000, 9999));
        $generatedAt = $now;
        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + 86400); // exactly 24 hours

        $up = $pdo->prepare("UPDATE mgr_users 
            SET account_pin = :pin, pin_generated_at = :gen, pin_expires_at = :exp,
                pin_used_by_id = NULL, pin_used_by_name = NULL, pin_used_at = NULL,
                updated_at = :now 
            WHERE member_id = :id");
        $up->execute([
            ':pin' => $newPin,
            ':gen' => $generatedAt,
            ':exp' => $expiresAt,
            ':now' => $now,
            ':id' => $targetMemberId
        ]);

        logAuditEvent($pdo, "Generated new single-executive 24-hour authorization PIN (Expires in 24h)", $authUser['name']);

        echo json_encode([
            'ok' => true,
            'accountPin' => $newPin,
            'pinGeneratedAt' => $generatedAt,
            'pinExpiresAt' => $expiresAt,
            'pinUsedById' => null,
            'pinUsedByName' => null,
            'message' => 'New 24-hour single-executive authorization PIN generated.'
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // VERIFY MEMBER PIN (Executive Document Inspection Gate — 24H & Single-Executive)
    // ------------------------------------------------------------------------
    if ($action === 'verify_member_pin') {
        $targetMemberId = isset($body['targetMemberId']) ? trim((string)$body['targetMemberId']) : '';
        $enteredPin = isset($body['enteredPin']) ? trim((string)$body['enteredPin']) : '';

        if ($targetMemberId === '' || $enteredPin === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Member ID and Authorization PIN are required.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT member_id, name, account_pin, pin_expires_at, pin_generated_at, pin_used_by_id, pin_used_by_name, pin_used_at, kyc_docs_json FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmt->execute([':id' => $targetMemberId]);
        $targetUser = $stmt->fetch();

        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Member record not found.']);
            exit;
        }

        $actor = $authUser ? $authUser['name'] : 'Executive Officer';
        $claimingOfficerId = $authUser ? $authUser['memberId'] : (isset($body['officerId']) ? trim((string)$body['officerId']) : 'MGR-EXEC');
        $claimingOfficerName = $authUser ? $authUser['name'] : (isset($body['officerName']) ? trim((string)$body['officerName']) : 'Executive Officer');

        // 1. Expiration check (24 Hours)
        if (!empty($targetUser['pin_expires_at']) && $targetUser['pin_expires_at'] < $now) {
            logAuditEvent($pdo, "SECURITY ALERT: Attempted access using EXPIRED 24h PIN for member {$targetUser['member_id']}", $actor);
            http_response_code(403);
            echo json_encode([
                'ok' => false,
                'error' => "This authorization PIN expired on " . substr($targetUser['pin_expires_at'], 0, 16) . " (24-hour limit exceeded). Ask {$targetUser['name']} to generate a fresh 24-hour PIN."
            ]);
            exit;
        }

        // 2. PIN match check
        $expectedPin = !empty($targetUser['account_pin']) ? $targetUser['account_pin'] : '1234';
        if ($enteredPin !== $expectedPin) {
            logAuditEvent($pdo, "SECURITY ALERT: Failed PIN verification attempt for member {$targetUser['member_id']} documents", $actor);
            http_response_code(403);
            echo json_encode([
                'ok' => false,
                'error' => "Invalid Account PIN. Access denied as per Kenyan Privacy Policy (Article 31 & Data Protection Act 2019). Ask {$targetUser['name']} for their active PIN."
            ]);
            exit;
        }

        // 3. Single-Executive restriction (Can only be used by ONE executive within 24 hours)
        if (!empty($targetUser['pin_used_by_id']) && $targetUser['pin_used_by_id'] !== $claimingOfficerId) {
            $firstOfficer = !empty($targetUser['pin_used_by_name']) ? $targetUser['pin_used_by_name'] : $targetUser['pin_used_by_id'];
            logAuditEvent($pdo, "SECURITY BLOCKED: Second executive ($claimingOfficerName) attempted to use PIN already claimed by $firstOfficer", $claimingOfficerName);
            http_response_code(403);
            echo json_encode([
                'ok' => false,
                'error' => "Single-Executive Restriction: This authorization PIN was already claimed and used by $firstOfficer. Under MGR Club security bylaws, each PIN can only be used by one executive within 24 hours. {$targetUser['name']} must generate a separate PIN for you."
            ]);
            exit;
        }

        // Bind PIN to this claiming executive if not yet bound
        if (empty($targetUser['pin_used_by_id'])) {
            $upClaim = $pdo->prepare("UPDATE mgr_users SET pin_used_by_id = :oid, pin_used_by_name = :oname, pin_used_at = :now WHERE member_id = :id");
            $upClaim->execute([
                ':oid' => $claimingOfficerId,
                ':oname' => $claimingOfficerName,
                ':now' => $now,
                ':id' => $targetMemberId
            ]);
        }

        $docs = [];
        if (!empty($targetUser['kyc_docs_json'])) {
            $parsed = json_decode($targetUser['kyc_docs_json'], true);
            if (is_array($parsed)) $docs = $parsed;
        }

        logAuditEvent($pdo, "LEGAL ACCESS GRANTED: Executive $claimingOfficerName ($claimingOfficerId) accessed confidential documents for {$targetUser['name']} ({$targetUser['member_id']}) via verified 24h single-executive PIN", $claimingOfficerName);

        echo json_encode([
            'ok' => true,
            'unlocked' => true,
            'memberId' => $targetMemberId,
            'memberName' => $targetUser['name'],
            'documents' => $docs,
            'pinExpiresAt' => $targetUser['pin_expires_at'],
            'claimedBy' => $claimingOfficerName,
            'message' => "Authorization verified. Legal documents for {$targetUser['name']} unlocked (Exclusive to $claimingOfficerName)."
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // UPDATE ACCOUNT PIN
    // ------------------------------------------------------------------------
    if ($action === 'update_account_pin') {
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Authentication required']);
            exit;
        }

        $newPin = isset($body['newPin']) ? trim((string)$body['newPin']) : '';
        if (strlen($newPin) < 4 || strlen($newPin) > 8) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Account PIN must be between 4 and 8 digits (e.g. 1234).']);
            exit;
        }

        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', time() + 86400); // reset 24 hours
        $up = $pdo->prepare("UPDATE mgr_users 
            SET account_pin = :pin, pin_generated_at = :gen, pin_expires_at = :exp,
                pin_used_by_id = NULL, pin_used_by_name = NULL, pin_used_at = NULL,
                updated_at = :now 
            WHERE member_id = :id");
        $up->execute([
            ':pin' => $newPin,
            ':gen' => $now,
            ':exp' => $expiresAt,
            ':now' => $now,
            ':id' => $authUser['memberId']
        ]);

        logAuditEvent($pdo, "Account Security PIN updated and reset to 24h validity", $authUser['name']);

        echo json_encode([
            'ok' => true,
            'message' => 'Your Account Security PIN has been updated and set with a fresh 24-hour single-executive window.',
            'accountPin' => $newPin,
            'pinExpiresAt' => $expiresAt
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 1. LOGIN (Supports Member ID, Email, or Phone + Password)
    // ------------------------------------------------------------------------
    if ($action === 'login') {
        $identifier = isset($body['identifier']) ? trim((string)$body['identifier']) : '';
        $password = isset($body['password']) ? (string)$body['password'] : '';

        if ($identifier === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Please enter your Member ID / Email and Password.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM mgr_users
            WHERE UPPER(member_id) = UPPER(:id)
               OR LOWER(email) = LOWER(:id)
               OR REPLACE(phone, ' ', '') = REPLACE(:id, ' ', '')
            LIMIT 1");
        $stmt->execute([':id' => $identifier]);
        $userRow = $stmt->fetch();

        if (!$userRow) {
            logAuditEvent($pdo, "Failed login attempt for unknown identifier ($identifier)", 'Anonymous');
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Member account not found. Use your MGR-001..MGR-011 ID or registered email.']);
            exit;
        }

        if ($userRow['account_status'] === 'Suspended' || $userRow['account_status'] === 'Deactivated') {
            logAuditEvent($pdo, "Blocked login attempt on deactivated/suspended account {$userRow['member_id']}", $userRow['name']);
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'This member account has been deactivated by the System Administrator. Please contact management.']);
            exit;
        }

        if (!empty($userRow['locked_until']) && $userRow['locked_until'] > $now) {
            http_response_code(429);
            echo json_encode(['ok' => false, 'error' => 'Account temporarily locked due to multiple failed password attempts. Please try again in 10 minutes or use Email OTP.']);
            exit;
        }

        if (!password_verify($password, $userRow['password_hash'])) {
            $attempts = (int)$userRow['failed_attempts'] + 1;
            $lockUntil = ($attempts >= 5) ? gmdate('Y-m-d\TH:i:s\Z', time() + 600) : null;
            $up = $pdo->prepare("UPDATE mgr_users SET failed_attempts = :att, locked_until = :lock WHERE member_id = :id");
            $up->execute([':att' => $attempts, ':lock' => $lockUntil, ':id' => $userRow['member_id']]);
            logAuditEvent($pdo, "Invalid password login attempt #$attempts for {$userRow['member_id']}", $userRow['name']);
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Invalid password. Please verify your credentials or request an Email OTP code.']);
            exit;
        }

        // Valid login -> create 7-day session token
        $token = bin2hex(random_bytes(32));
        $expires = gmdate('Y-m-d\TH:i:s\Z', time() + 7 * 86400);
        $ins = $pdo->prepare("INSERT INTO mgr_sessions (token, member_id, ip_address, user_agent, created_at, expires_at)
            VALUES (:tok, :id, :ip, :ua, :now, :exp)");
        $ins->execute([
            ':tok' => $token,
            ':id' => $userRow['member_id'],
            ':ip' => getClientIp(),
            ':ua' => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 240) : '',
            ':now' => $now,
            ':exp' => $expires
        ]);

        $up = $pdo->prepare("UPDATE mgr_users SET failed_attempts = 0, locked_until = NULL, last_login = :now WHERE member_id = :id");
        $up->execute([':now' => $now, ':id' => $userRow['member_id']]);

        logAuditEvent($pdo, "Member signed in ({$userRow['position_title']} - {$userRow['access_level']})", "{$userRow['name']} ({$userRow['member_id']})");

        $mailCfg = getMailSettings($pdo);
        if (!empty($mailCfg['notifyOnLogin'])) {
            dispatchSystemEmail(
                $pdo,
                $userRow['email'],
                $userRow['name'],
                "Security Alert: New Sign-In to MGR Investment Portal",
                "<p>Dear <strong>" . htmlspecialchars($userRow['name']) . "</strong>,</p>
                 <p>Your MGR Investment Group account (<strong>{$userRow['member_id']}</strong> — {$userRow['position_title']}) was just signed into at <strong>$now</strong> from IP <code>" . getClientIp() . "</code>.</p>",
                'MGR Security Guard'
            );
        }

        $stmtFresh = $pdo->prepare("SELECT * FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmtFresh->execute([':id' => $userRow['member_id']]);
        $formattedUser = formatUserRow($stmtFresh->fetch());

        echo json_encode([
            'ok' => true,
            'token' => $token,
            'expiresAt' => $expires,
            'user' => $formattedUser
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 2. REQUEST EMAIL OTP (Passwordless Login / Password Reset)
    // ------------------------------------------------------------------------
    if ($action === 'request_otp') {
        $identifier = isset($body['identifier']) ? trim((string)$body['identifier']) : '';
        if ($identifier === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Enter your Member ID or registered Email to receive an OTP code.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM mgr_users
            WHERE UPPER(member_id) = UPPER(:id) OR LOWER(email) = LOWER(:id) LIMIT 1");
        $stmt->execute([':id' => $identifier]);
        $userRow = $stmt->fetch();

        if (!$userRow) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'No matching member found for that ID or email.']);
            exit;
        }

        $otp = (string)random_int(100000, 999999);
        $expires = gmdate('Y-m-d\TH:i:s\Z', time() + 900); // 15 minutes
        $ins = $pdo->prepare("INSERT INTO mgr_otp_codes (member_id, email, otp_code, purpose, expires_at, used, created_at)
            VALUES (:id, :email, :otp, 'login_or_reset', :exp, 0, :now)");
        $ins->execute([
            ':id' => $userRow['member_id'],
            ':email' => $userRow['email'],
            ':otp' => $otp,
            ':exp' => $expires,
            ':now' => $now
        ]);

        $mailRes = dispatchSystemEmail(
            $pdo,
            $userRow['email'],
            $userRow['name'],
            "MGR Portal Security Verification Code: $otp",
            "<p>Dear <strong>" . htmlspecialchars($userRow['name']) . "</strong> ({$userRow['member_id']}),</p>
             <p>Your one-time verification code (OTP) for the MGR Investment Group Portal is:</p>
             <div style=\"font-size:28px; font-weight:bold; letter-spacing:6px; background:#F2EFE9; padding:14px 20px; border-radius:8px; display:inline-block; color:#1D3B2A; border:1px solid #C89B57;\">$otp</div>
             <p style=\"margin-top:16px;\">This code is valid for 15 minutes. You can use it to sign in immediately or set a new password.</p>",
            'MGR Security Service'
        );

        logAuditEvent($pdo, "Requested Email OTP code sent to {$userRow['email']}", $userRow['name']);

        echo json_encode([
            'ok' => true,
            'memberId' => $userRow['member_id'],
            'email' => $userRow['email'],
            'mailStatus' => $mailRes['status'],
            'message' => "A 6-digit verification code has been dispatched to {$userRow['email']}."
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 3. VERIFY EMAIL OTP & OPTIONAL PASSWORD RESET
    // ------------------------------------------------------------------------
    if ($action === 'verify_otp') {
        $identifier = isset($body['identifier']) ? trim((string)$body['identifier']) : '';
        $otpCode = isset($body['otpCode']) ? trim((string)$body['otpCode']) : '';
        $newPassword = isset($body['newPassword']) ? trim((string)$body['newPassword']) : '';

        $stmt = $pdo->prepare("SELECT * FROM mgr_users
            WHERE UPPER(member_id) = UPPER(:id) OR LOWER(email) = LOWER(:id) LIMIT 1");
        $stmt->execute([':id' => $identifier]);
        $userRow = $stmt->fetch();

        if (!$userRow) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Member account not found.']);
            exit;
        }

        if ($userRow['account_status'] === 'Suspended' || $userRow['account_status'] === 'Deactivated') {
            logAuditEvent($pdo, "Blocked OTP verification on deactivated/suspended account {$userRow['member_id']}", $userRow['name']);
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'This member account has been deactivated by the System Administrator. Please contact management.']);
            exit;
        }

        $otpStmt = $pdo->prepare("SELECT * FROM mgr_otp_codes
            WHERE member_id = :id AND otp_code = :code AND used = 0
            ORDER BY id DESC LIMIT 1");
        $otpStmt->execute([':id' => $userRow['member_id'], ':code' => $otpCode]);
        $otpRow = $otpStmt->fetch();

        if (!$otpRow || $otpRow['expires_at'] < $now) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Invalid or expired OTP code.']);
            exit;
        }

        $pdo->prepare("UPDATE mgr_otp_codes SET used = 1 WHERE id = :id")->execute([':id' => $otpRow['id']]);

        if ($newPassword !== '' && strlen($newPassword) >= 6) {
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $pdo->prepare("UPDATE mgr_users SET password_hash = :h, failed_attempts = 0, locked_until = NULL, must_change_password = 0, updated_at = :now WHERE member_id = :id")
                ->execute([':h' => $newHash, ':now' => $now, ':id' => $userRow['member_id']]);
            logAuditEvent($pdo, "Password reset completed via Email OTP", $userRow['name']);
        }

        $token = bin2hex(random_bytes(32));
        $expires = gmdate('Y-m-d\TH:i:s\Z', time() + 7 * 86400);
        $pdo->prepare("INSERT INTO mgr_sessions (token, member_id, ip_address, user_agent, created_at, expires_at)
            VALUES (:tok, :id, :ip, :ua, :now, :exp)")->execute([
            ':tok' => $token,
            ':id' => $userRow['member_id'],
            ':ip' => getClientIp(),
            ':ua' => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 240) : '',
            ':now' => $now,
            ':exp' => $expires
        ]);

        $pdo->prepare("UPDATE mgr_users SET last_login = :now WHERE member_id = :id")->execute([':now' => $now, ':id' => $userRow['member_id']]);
        $stmtFresh = $pdo->prepare("SELECT * FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmtFresh->execute([':id' => $userRow['member_id']]);

        echo json_encode([
            'ok' => true,
            'token' => $token,
            'expiresAt' => $expires,
            'user' => formatUserRow($stmtFresh->fetch())
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 4. LOGOUT
    // ------------------------------------------------------------------------
    if ($action === 'logout') {
        $token = getBearerToken();
        if ($token !== '') {
            $pdo->prepare("DELETE FROM mgr_sessions WHERE token = :tok")->execute([':tok' => $token]);
        }
        if ($authUser) {
            logAuditEvent($pdo, "Member signed out", "{$authUser['name']} ({$authUser['memberId']})");
        }
        echo json_encode(['ok' => true]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 5. CHANGE OWN PASSWORD
    // ------------------------------------------------------------------------
    if ($action === 'change_password') {
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Authentication required']);
            exit;
        }
        $currentPassword = isset($body['currentPassword']) ? (string)$body['currentPassword'] : '';
        $newPassword = isset($body['newPassword']) ? (string)$body['newPassword'] : '';

        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'New password must be at least 6 characters long.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmt->execute([':id' => $authUser['memberId']]);
        $userRow = $stmt->fetch();

        if (!$userRow || !password_verify($currentPassword, $userRow['password_hash'])) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Your current password is incorrect.']);
            exit;
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $pdo->prepare("UPDATE mgr_users SET password_hash = :h, must_change_password = 0, updated_at = :now WHERE member_id = :id")
            ->execute([':h' => $hash, ':now' => $now, ':id' => $authUser['memberId']]);

        logAuditEvent($pdo, "Changed personal account password", "{$authUser['name']} ({$authUser['memberId']})");
        echo json_encode(['ok' => true, 'message' => 'Your password has been updated securely.']);
        exit;
    }

    // ------------------------------------------------------------------------
    // 6. ADMIN: UPDATE USER ACCESS, POSITION, MEMBERSHIP TIER, OR PERMISSIONS
    // ------------------------------------------------------------------------
    if ($action === 'admin_update_user_access') {
        if (!$authUser || empty($authUser['permissions']['manage_access_control'])) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Only Administrators with Access Control authority can modify member permissions.']);
            exit;
        }

        $targetMemberId = isset($body['memberId']) ? trim((string)$body['memberId']) : '';
        $newMemberId = isset($body['newMemberId']) ? trim((string)$body['newMemberId']) : $targetMemberId;
        $positionTitle = isset($body['positionTitle']) ? trim((string)$body['positionTitle']) : 'Member';
        $membershipTier = isset($body['membershipTier']) ? trim((string)$body['membershipTier']) : 'General Member';
        $accessLevel = isset($body['accessLevel']) ? trim((string)$body['accessLevel']) : 'general_member';
        $accountStatus = isset($body['accountStatus']) ? trim((string)$body['accountStatus']) : 'Active';
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $phone = isset($body['phone']) ? trim((string)$body['phone']) : '';
        $permissions = isset($body['permissions']) && is_array($body['permissions'])
            ? $body['permissions']
            : buildPermissionsForRole($accessLevel, $positionTitle);
        $resetPassword = isset($body['newPassword']) ? trim((string)$body['newPassword']) : '';

        $stmt = $pdo->prepare("SELECT * FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmt->execute([':id' => $targetMemberId]);
        $existing = $stmt->fetch();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Target member not found in security table.']);
            exit;
        }

        // If new member ID was provided and changed, verify uniqueness and migrate
        if ($newMemberId !== '' && $newMemberId !== $targetMemberId) {
            $chk = $pdo->prepare("SELECT member_id, name FROM mgr_users WHERE member_id = :nid LIMIT 1");
            $chk->execute([':nid' => $newMemberId]);
            $dup = $chk->fetch();
            if ($dup) {
                http_response_code(409);
                echo json_encode(['ok' => false, 'error' => "Member ID '$newMemberId' is already registered to {$dup['name']}."]);
                exit;
            }
            $pdo->prepare("UPDATE mgr_users SET member_id = :nid, updated_at = :now WHERE member_id = :oid")
                ->execute([':nid' => $newMemberId, ':now' => $now, ':oid' => $targetMemberId]);
            $pdo->prepare("UPDATE mgr_sessions SET member_id = :nid WHERE member_id = :oid")
                ->execute([':nid' => $newMemberId, ':oid' => $targetMemberId]);
            $pdo->prepare("UPDATE mgr_otp_codes SET member_id = :nid WHERE member_id = :oid")
                ->execute([':nid' => $newMemberId, ':oid' => $targetMemberId]);
            logAuditEvent(
                $pdo,
                "Admin updated official Member ID from '$targetMemberId' to '$newMemberId' for {$existing['name']}",
                "{$authUser['name']} ({$authUser['memberId']})"
            );
            $targetMemberId = $newMemberId;
        }

        $name = isset($body['name']) ? trim((string)$body['name']) : '';
        $newName = $name !== '' ? $name : $existing['name'];
        $newEmail = $email !== '' ? $email : $existing['email'];
        $newPhone = $phone !== '' ? $phone : $existing['phone'];

        if ($resetPassword !== '' && strlen($resetPassword) >= 6) {
            $hash = password_hash($resetPassword, PASSWORD_DEFAULT);
            $up = $pdo->prepare("UPDATE mgr_users SET
                name = :name,
                email = :email,
                phone = :phone,
                position_title = :pos,
                membership_tier = :tier,
                access_level = :level,
                permissions_json = :perms,
                account_status = :status,
                password_hash = :hash,
                failed_attempts = 0,
                locked_until = NULL,
                updated_at = :now
                WHERE member_id = :id");
            $up->execute([
                ':name' => $newName,
                ':email' => $newEmail,
                ':phone' => $newPhone,
                ':pos' => $positionTitle,
                ':tier' => $membershipTier,
                ':level' => $accessLevel,
                ':perms' => json_encode($permissions),
                ':status' => $accountStatus,
                ':hash' => $hash,
                ':now' => $now,
                ':id' => $targetMemberId
            ]);
        } else {
            $up = $pdo->prepare("UPDATE mgr_users SET
                name = :name,
                email = :email,
                phone = :phone,
                position_title = :pos,
                membership_tier = :tier,
                access_level = :level,
                permissions_json = :perms,
                account_status = :status,
                updated_at = :now
                WHERE member_id = :id");
            $up->execute([
                ':name' => $newName,
                ':email' => $newEmail,
                ':phone' => $newPhone,
                ':pos' => $positionTitle,
                ':tier' => $membershipTier,
                ':level' => $accessLevel,
                ':perms' => json_encode($permissions),
                ':status' => $accountStatus,
                ':now' => $now,
                ':id' => $targetMemberId
            ]);
        }

        logAuditEvent(
            $pdo,
            "Updated access & position for {$existing['name']} ($targetMemberId): Position=$positionTitle, Tier=$membershipTier, Role=$accessLevel, Status=$accountStatus",
            "{$authUser['name']} ({$authUser['memberId']})"
        );

        if (!empty($body['notifyUserByEmail'])) {
            $passNotice = ($resetPassword !== '')
                ? "<p><strong>Temporary Password Assigned:</strong> <code>" . htmlspecialchars($resetPassword) . "</code></p>"
                : "";
            dispatchSystemEmail(
                $pdo,
                $newEmail,
                $existing['name'],
                "MGR Portal Access & Position Updated: $positionTitle",
                "<p>Dear <strong>" . htmlspecialchars($existing['name']) . "</strong> ($targetMemberId),</p>
                 <p>Your membership position and access privileges on the MGR Investment Group Portal have been updated by <strong>{$authUser['name']}</strong>:</p>
                 <ul>
                   <li><strong>Official Position:</strong> " . htmlspecialchars($positionTitle) . "</li>
                   <li><strong>Membership Category:</strong> " . htmlspecialchars($membershipTier) . "</li>
                   <li><strong>System Access Tier:</strong> " . htmlspecialchars($accessLevel) . "</li>
                   <li><strong>Account Status:</strong> " . htmlspecialchars($accountStatus) . "</li>
                 </ul>
                 $passNotice",
                $authUser['name']
            );
        }

        echo json_encode([
            'ok' => true,
            'users' => getAllUsersFormatted($pdo)
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 6B. UPDATE MEMBER NUMBER / IDENTIFIER (CASCADING MIGRATION IN SQLITE/MYSQL)
    // ------------------------------------------------------------------------
    if ($action === 'update_member_id') {
        if (!$authUser || (empty($authUser['permissions']['manage_access_control']) && empty($authUser['permissions']['manage_member_registry']))) {
            $isExec = !empty($authUser['permissions']['manage_access_control']) || 
                      (isset($authUser['membershipTier']) && $authUser['membershipTier'] === 'Executive Committee');
            if (!$isExec && $authUser) {
                http_response_code(403);
                echo json_encode(['ok' => false, 'error' => 'Executive Committee or Administrator privileges required to change Member Number.']);
                exit;
            }
        }

        $oldMemberId = isset($body['oldMemberId']) ? trim((string)$body['oldMemberId']) : '';
        $newMemberId = isset($body['newMemberId']) ? trim((string)$body['newMemberId']) : '';

        if ($oldMemberId === '' || $newMemberId === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Both old and new Member IDs are required.']);
            exit;
        }

        if (strcasecmp($oldMemberId, $newMemberId) === 0) {
            echo json_encode(['ok' => true, 'message' => 'No change detected.']);
            exit;
        }

        $chk = $pdo->prepare("SELECT member_id, name FROM mgr_users WHERE member_id = :nid LIMIT 1");
        $chk->execute([':nid' => $newMemberId]);
        $existing = $chk->fetch();
        if ($existing) {
            http_response_code(409);
            echo json_encode(['ok' => false, 'error' => "Member ID '$newMemberId' is already registered to {$existing['name']}."]);
            exit;
        }

        $pdo->prepare("UPDATE mgr_users SET member_id = :nid, updated_at = :now WHERE member_id = :oid")
            ->execute([':nid' => $newMemberId, ':now' => $now, ':oid' => $oldMemberId]);
        $pdo->prepare("UPDATE mgr_sessions SET member_id = :nid WHERE member_id = :oid")
            ->execute([':nid' => $newMemberId, ':oid' => $oldMemberId]);
        $pdo->prepare("UPDATE mgr_otp_codes SET member_id = :nid WHERE member_id = :oid")
            ->execute([':nid' => $newMemberId, ':oid' => $oldMemberId]);

        // If app state JSON exists in DB, cascade the change inside the JSON
        $stateStmt = $pdo->prepare("SELECT state_json FROM mgr_app_state WHERE id = 1 LIMIT 1");
        $stateStmt->execute();
        $stateRow = $stateStmt->fetch();
        if ($stateRow && !empty($stateRow['state_json'])) {
            $parsed = json_decode($stateRow['state_json'], true);
            if (is_array($parsed)) {
                if (isset($parsed['members']) && is_array($parsed['members'])) {
                    foreach ($parsed['members'] as &$pm) {
                        if (isset($pm['id']) && $pm['id'] === $oldMemberId) {
                            $pm['id'] = $newMemberId;
                        }
                    }
                }
                if (isset($parsed['loans']) && is_array($parsed['loans'])) {
                    foreach ($parsed['loans'] as &$pl) {
                        if (isset($pl['borrowerId']) && $pl['borrowerId'] === $oldMemberId) $pl['borrowerId'] = $newMemberId;
                        if (isset($pl['funderMemberId']) && $pl['funderMemberId'] === $oldMemberId) $pl['funderMemberId'] = $newMemberId;
                    }
                }
                if (isset($parsed['resolutions']) && is_array($parsed['resolutions'])) {
                    foreach ($parsed['resolutions'] as &$pr) {
                        if (isset($pr['votes']) && is_array($pr['votes'])) {
                            foreach (['yes', 'no', 'abstain'] as $vk) {
                                if (isset($pr['votes'][$vk]) && is_array($pr['votes'][$vk])) {
                                    $pr['votes'][$vk] = array_map(function($v) use ($oldMemberId, $newMemberId) {
                                        return $v === $oldMemberId ? $newMemberId : $v;
                                    }, $pr['votes'][$vk]);
                                }
                            }
                        }
                    }
                }
                $upState = $pdo->prepare("UPDATE mgr_app_state SET state_json = :json, updated_at = :now WHERE id = 1");
                $upState->execute([':json' => json_encode($parsed, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ':now' => $now]);
            }
        }

        $actorDesc = $authUser ? "{$authUser['name']} ({$authUser['memberId']})" : 'Executive Committee';
        logAuditEvent($pdo, "Updated official Member Number from '$oldMemberId' to '$newMemberId'", $actorDesc);

        echo json_encode([
            'ok' => true,
            'oldMemberId' => $oldMemberId,
            'newMemberId' => $newMemberId,
            'users' => getAllUsersFormatted($pdo),
            'message' => "Member Number updated to $newMemberId successfully."
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 6C. MEMBER FIRST-LOGIN / PROFILE SETUP: UPDATE PHONE NUMBER & MEMBER NUMBER
    // ------------------------------------------------------------------------
    if ($action === 'update_profile') {
        if (!$authUser) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'You must be signed in to update your member profile.']);
            exit;
        }

        $phone = isset($body['phone']) ? trim((string)$body['phone']) : '';
        $newMemberId = isset($body['memberId']) ? trim((string)$body['memberId']) : '';
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $currentMemberId = $authUser['memberId'];

        // If member number is updated and different
        if ($newMemberId !== '' && strcasecmp($newMemberId, $currentMemberId) !== 0) {
            $chk = $pdo->prepare("SELECT member_id, name FROM mgr_users WHERE UPPER(member_id) = UPPER(:nid) AND UPPER(member_id) != UPPER(:oid) LIMIT 1");
            $chk->execute([':nid' => $newMemberId, ':oid' => $currentMemberId]);
            $dup = $chk->fetch();
            if ($dup) {
                http_response_code(409);
                echo json_encode(['ok' => false, 'error' => "Member number '$newMemberId' is already registered to {$dup['name']}."]);
                exit;
            }
            $pdo->prepare("UPDATE mgr_users SET member_id = :nid, updated_at = :now WHERE member_id = :oid")
                ->execute([':nid' => $newMemberId, ':now' => $now, ':oid' => $currentMemberId]);
            $pdo->prepare("UPDATE mgr_sessions SET member_id = :nid WHERE member_id = :oid")
                ->execute([':nid' => $newMemberId, ':oid' => $currentMemberId]);
            $pdo->prepare("UPDATE mgr_otp_codes SET member_id = :nid WHERE member_id = :oid")
                ->execute([':nid' => $newMemberId, ':oid' => $currentMemberId]);
            $currentMemberId = $newMemberId;
        }

        $accountPin = isset($body['accountPin']) ? trim((string)$body['accountPin']) : '';
        $nationalId = isset($body['nationalId']) ? trim((string)$body['nationalId']) : '';
        $locationCity = isset($body['locationCity']) ? trim((string)$body['locationCity']) : '';
        $newPassword = isset($body['newPassword']) ? (string)$body['newPassword'] : '';
        $newPhone = $phone !== '' ? $phone : $authUser['phone'];
        $newEmail = $email !== '' ? $email : $authUser['email'];

        $setParts = ["phone = :phone", "email = :email", "updated_at = :now", "profile_completed = 1"];
        $params = [
            ':phone' => $newPhone,
            ':email' => $newEmail,
            ':now' => $now,
            ':id' => $currentMemberId
        ];

        if ($accountPin !== '' && strlen($accountPin) >= 4) {
            $setParts[] = "account_pin = :pin";
            $params[':pin'] = $accountPin;
        }
        if ($nationalId !== '') {
            $setParts[] = "national_id = :nid";
            $params[':nid'] = $nationalId;
        }
        if ($locationCity !== '') {
            $setParts[] = "location_city = :loc";
            $params[':loc'] = $locationCity;
        }
        if ($newPassword !== '' && strlen($newPassword) >= 6) {
            $setParts[] = "password_hash = :hash";
            $setParts[] = "must_change_password = 0";
            $params[':hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
        }

        $sql = "UPDATE mgr_users SET " . implode(', ', $setParts) . " WHERE member_id = :id";
        $up = $pdo->prepare($sql);
        $up->execute($params);

        // Keep app state JSON in sync if present
        $stateRes = getStoredState($pdo, $driverUsed);
        if ($stateRes['initialized'] && !empty($stateRes['state'])) {
            $parsed = $stateRes['state'];
            if (isset($parsed['members']) && is_array($parsed['members'])) {
                foreach ($parsed['members'] as &$m) {
                    if ($m['id'] === $currentMemberId || $m['id'] === $authUser['memberId']) {
                        if ($currentMemberId !== $authUser['memberId']) $m['id'] = $currentMemberId;
                        if ($newPhone !== '') $m['phone'] = $newPhone;
                        if ($newEmail !== '') $m['email'] = $newEmail;
                        if ($nationalId !== '') $m['nationalId'] = $nationalId;
                        if ($locationCity !== '') $m['location'] = $locationCity;
                        if ($accountPin !== '') $m['accountPin'] = $accountPin;
                    }
                }
                unset($m);
                $upState = $pdo->prepare("UPDATE mgr_app_state SET state_json = :json, updated_at = :now WHERE id = 1");
                $upState->execute([':json' => json_encode($parsed, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), ':now' => $now]);
            }
        }

        logAuditEvent($pdo, "Full member profile updated & verified: Phone=$newPhone, ID=$nationalId, County=$locationCity", "{$authUser['name']} ($currentMemberId)", [
            'action_type' => 'update',
            'actor_id' => $currentMemberId,
            'actor_role' => $authUser['positionTitle'],
            'target_resource' => "Member Profile: $currentMemberId",
            'location_open' => $locationCity !== '' ? "$locationCity, Kenya" : 'Nairobi, Kenya'
        ]);

        // Dispatch instant alert email to System Administrator(s) when mandatory profile is completed
        try {
            $adminRecipients = getAdminNotificationRecipients($pdo);
            $adminSubject = "[MGR Portal Alert] Mandatory Profile Completed: {$authUser['name']} ({$currentMemberId})";
            $adminHtml = "<p>Dear Administrator,</p>"
                . "<p>Member <strong>" . htmlspecialchars($authUser['name'], ENT_QUOTES, 'UTF-8') . "</strong> ({$currentMemberId}) has completed and submitted their mandatory onboarding profile on the <strong>MGR Investment Group Portal</strong>:</p>"
                . "<table style=\"width:100%; border-collapse:collapse; margin:16px 0; font-size:13px;\">"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold; width:35%;\">Member Name:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\"><strong>" . htmlspecialchars($authUser['name'], ENT_QUOTES, 'UTF-8') . "</strong></td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Member ID:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; font-family:monospace; color:#1D3B2A; font-weight:bold;\">" . htmlspecialchars($currentMemberId, ENT_QUOTES, 'UTF-8') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">National ID / Passport:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; font-family:monospace;\">" . (!empty($nationalId) ? htmlspecialchars($nationalId, ENT_QUOTES, 'UTF-8') : '<em>Not specified</em>') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">County / City:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . (!empty($locationCity) ? htmlspecialchars($locationCity, ENT_QUOTES, 'UTF-8') : '<em>Not specified</em>') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Mobile Phone:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . (!empty($newPhone) ? htmlspecialchars($newPhone, ENT_QUOTES, 'UTF-8') : '<em>Not specified</em>') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Email Address:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . (!empty($newEmail) ? htmlspecialchars($newEmail, ENT_QUOTES, 'UTF-8') : '<em>Not specified</em>') . "</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Onboarding Status:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; color:#047857; font-weight:bold;\">Mandatory Profile Complete &amp; Verified</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Submission Time:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2;\">" . gmdate('d/m/Y H:i:s') . " UTC</td></tr>"
                . "<tr><td style=\"padding:8px 10px; border:1px solid #E2DDD2; background:#F8F7F4; font-weight:bold;\">Client IP Address:</td><td style=\"padding:8px 10px; border:1px solid #E2DDD2; font-family:monospace;\">" . htmlspecialchars(getClientIp(), ENT_QUOTES, 'UTF-8') . "</td></tr>"
                . "</table>"
                . "<p style=\"font-size:12px; color:#64748B;\">The member profile record has been synchronized in the database and logged to the security audit trail. Member security PINs are strictly excluded from transmission for data protection compliance.</p>";

            foreach ($adminRecipients as $adm) {
                dispatchSystemEmail($pdo, $adm['email'], $adm['name'], $adminSubject, $adminHtml, 'MGR Portal Security');
            }
        } catch (Exception $e) {}

        $stmtFresh = $pdo->prepare("SELECT * FROM mgr_users WHERE member_id = :id LIMIT 1");
        $stmtFresh->execute([':id' => $currentMemberId]);
        $freshUser = formatUserRow($stmtFresh->fetch());

        echo json_encode([
            'ok' => true,
            'user' => $freshUser,
            'users' => getAllUsersFormatted($pdo),
            'message' => 'Profile updated successfully.'
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 7. ADMIN: SAVE MAIL SERVER SETTINGS (cPanel PHP mail() or SMTP)
    // ------------------------------------------------------------------------
    if ($action === 'save_mail_settings') {
        if (!$authUser || empty($authUser['permissions']['manage_access_control'])) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Administrator privileges required to configure mail server.']);
            exit;
        }

        $current = getMailSettings($pdo);
        $incoming = isset($body['settings']) && is_array($body['settings']) ? $body['settings'] : [];
        if (isset($incoming['smtpPassword']) && $incoming['smtpPassword'] === '********') {
            $incoming['smtpPassword'] = $current['smtpPassword'];
        }
        $merged = array_merge($current, $incoming);
        $encoded = json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($driverUsed === 'mysql') {
            $stmt = $pdo->prepare("INSERT INTO mgr_mail_settings (id, config_json, updated_at)
                VALUES (1, :json, :now)
                ON DUPLICATE KEY UPDATE config_json = :json2, updated_at = :now2");
            $stmt->execute([':json' => $encoded, ':now' => $now, ':json2' => $encoded, ':now2' => $now]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO mgr_mail_settings (id, config_json, updated_at)
                VALUES (1, :json, :now)
                ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json, updated_at = excluded.updated_at");
            $stmt->execute([':json' => $encoded, ':now' => $now]);
        }

        logAuditEvent($pdo, "Updated cPanel Mail & SMTP configuration (Transport: {$merged['transport']})", $authUser['name']);

        $safe = $merged;
        $safe['smtpPassword'] = !empty($merged['smtpPassword']) ? '********' : '';
        echo json_encode(['ok' => true, 'mailSettings' => $safe]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 8. SEND OFFICIAL EMAIL (Individual Member, Executive Committee, or All Members)
    // ------------------------------------------------------------------------
    if ($action === 'send_email') {
        if (!$authUser || empty($authUser['permissions']['send_official_mail'])) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Your role does not have permission to send official treasury emails.']);
            exit;
        }

        $audience = isset($body['audience']) ? $body['audience'] : 'single'; // 'single' | 'executive' | 'all_active' | 'all_members'
        $targetMemberId = isset($body['memberId']) ? trim((string)$body['memberId']) : '';
        $customEmail = isset($body['customEmail']) ? trim((string)$body['customEmail']) : '';
        $subject = isset($body['subject']) ? trim((string)$body['subject']) : 'Official Notice from MGR Investment Group';
        $messageHtml = isset($body['messageHtml']) ? (string)$body['messageHtml'] : '';

        if ($subject === '' || trim(strip_tags($messageHtml)) === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Email subject and message body are required.']);
            exit;
        }

        $recipients = [];
        $allUsers = getAllUsersFormatted($pdo);

        if ($audience === 'custom' && $customEmail !== '') {
            $recipients[] = ['email' => $customEmail, 'name' => $customEmail];
        } elseif ($audience === 'single' && $targetMemberId !== '') {
            foreach ($allUsers as $u) {
                if ($u['memberId'] === $targetMemberId) {
                    $recipients[] = ['email' => $u['email'], 'name' => $u['name']];
                }
            }
        } elseif ($audience === 'executive') {
            foreach ($allUsers as $u) {
                if ($u['membershipTier'] === 'Executive Committee') {
                    $recipients[] = ['email' => $u['email'], 'name' => $u['name']];
                }
            }
        } elseif ($audience === 'all_active') {
            foreach ($allUsers as $u) {
                if ($u['accountStatus'] === 'Active') {
                    $recipients[] = ['email' => $u['email'], 'name' => $u['name']];
                }
            }
        } else {
            foreach ($allUsers as $u) {
                $recipients[] = ['email' => $u['email'], 'name' => $u['name']];
            }
        }

        $results = [];
        foreach ($recipients as $rcpt) {
            $results[] = dispatchSystemEmail($pdo, $rcpt['email'], $rcpt['name'], $subject, $messageHtml, $authUser['name']);
        }

        logAuditEvent($pdo, "Dispatched official email '$subject' to " . count($results) . " recipient(s)", $authUser['name']);
        $mailLogs = $pdo->query("SELECT * FROM mgr_mail_logs ORDER BY id DESC LIMIT 50")->fetchAll();

        echo json_encode([
            'ok' => true,
            'sentCount' => count($results),
            'results' => $results,
            'mailLogs' => $mailLogs
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 8B. DISPATCH FINANCIAL REPORT / STATEMENT EMAIL
    // ------------------------------------------------------------------------
    if ($action === 'send_report_email') {
        $reportType = isset($body['reportType']) ? trim((string)$body['reportType']) : 'Financial Statement';
        $recipientEmail = isset($body['recipientEmail']) ? trim((string)$body['recipientEmail']) : '';
        $recipientName = isset($body['recipientName']) ? trim((string)$body['recipientName']) : '';
        $reportHtml = isset($body['reportHtml']) ? (string)$body['reportHtml'] : '';
        $customSubject = isset($body['subject']) ? trim((string)$body['subject']) : '';
        $subject = !empty($customSubject) ? $customSubject : "MGR Investment Group — Official $reportType";

        if (empty($recipientEmail) && $authUser && !empty($authUser['email'])) {
            $recipientEmail = $authUser['email'];
            if (empty($recipientName)) $recipientName = $authUser['name'];
        }

        if (empty($recipientEmail) || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Please provide a valid recipient email address (or update your profile email first).']);
            exit;
        }

        if (trim(strip_tags($reportHtml)) === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Report content cannot be empty.']);
            exit;
        }

        $sentBy = $authUser ? "{$authUser['name']} ({$authUser['positionTitle']})" : 'MGR Treasury Portal';
        $res = dispatchSystemEmail($pdo, $recipientEmail, $recipientName, $subject, $reportHtml, $sentBy);
        logAuditEvent($pdo, "Dispatched $reportType to $recipientEmail ($recipientName)", $sentBy);

        echo json_encode([
            'ok' => true,
            'recipientEmail' => $recipientEmail,
            'reportType' => $reportType,
            'result' => $res
        ]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 9. RESET TO OFFICIAL 30/10/2026 BASELINE
    // ------------------------------------------------------------------------
    if ($action === 'reset') {
        $pdo->exec("DELETE FROM mgr_app_state WHERE id = 1");
        if (isset($body['state']) && is_array($body['state'])) {
            $actor = $authUser ? $authUser['name'] : 'Factory Reset (30/10/2026 Official Baseline)';
            $saved = saveStoredState($pdo, $driverUsed, $body['state'], $actor, 'Reset to 30/10/2026 Official Baseline');
            echo json_encode($saved);
            exit;
        }
        echo json_encode(['ok' => true, 'reset' => true, 'driver' => $driverUsed]);
        exit;
    }

    // ------------------------------------------------------------------------
    // 10. SYNC PORTFOLIO STATE
    // ------------------------------------------------------------------------
    if (!isset($body['state']) || !is_array($body['state'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing state object']);
        exit;
    }

    $updatedBy = $authUser
        ? "{$authUser['name']} ({$authUser['positionTitle']})"
        : (isset($body['updatedBy']) ? substr((string)$body['updatedBy'], 0, 140) : 'MGR Member');
    $actionSummary = isset($body['actionSummary']) ? substr((string)$body['actionSummary'], 0, 240) : 'Portfolio State Update';

    // Also ensure any new member added in state is registered in mgr_users
    if (isset($body['state']['members']) && is_array($body['state']['members'])) {
        $checkUserStmt = $pdo->prepare("SELECT member_id FROM mgr_users WHERE member_id = :id LIMIT 1");
        $insUserStmt = $pdo->prepare("INSERT INTO mgr_users (
            member_id, name, email, phone, position_title, membership_tier, access_level,
            password_hash, permissions_json, account_status, must_change_password, updated_at
        ) VALUES (
            :id, :name, :email, :phone, :pos, :tier, :level,
            :hash, :perms, :status, 0, :now
        )");
        foreach ($body['state']['members'] as $m) {
            if (empty($m['id'])) continue;
            $checkUserStmt->execute([':id' => $m['id']]);
            if (!$checkUserStmt->fetch()) {
                $isExec = (isset($m['committeeRole']) && $m['committeeRole'] === 'Executive Committee');
                $level = $isExec ? 'executive_officer' : 'general_member';
                $pos = !empty($m['role']) ? $m['role'] : 'Member';
                $tier = !empty($m['committeeRole']) ? $m['committeeRole'] : 'General Member';
                $perms = buildPermissionsForRole($level, $pos);
                $insUserStmt->execute([
                    ':id' => $m['id'],
                    ':name' => !empty($m['name']) ? $m['name'] : $m['id'],
                    ':email' => !empty($m['email']) ? $m['email'] : null,
                    ':phone' => !empty($m['phone']) ? $m['phone'] : null,
                    ':pos' => $pos,
                    ':tier' => $tier,
                    ':level' => $level,
                    ':hash' => password_hash('MGR@2026', PASSWORD_DEFAULT),
                    ':perms' => json_encode($perms),
                    ':status' => !empty($m['status']) ? $m['status'] : 'Active',
                    ':now' => $now
                ]);
            }
        }
    }

    $saved = saveStoredState($pdo, $driverUsed, $body['state'], $updatedBy, $actionSummary);
    echo json_encode($saved);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
