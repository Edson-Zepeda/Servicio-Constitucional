<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Display environment variables for debugging purposes
echo "ENDPOINT: " . getenv("ENDPOINT") . "<br>";
echo "DATABASE: " . getenv("DATABASE") . "<br>";
echo "USERD: " . getenv("USERD") . "<br>";
//echo "PASSD: " . getenv("PASSD") . "<br>"; // Corrected to display PASSD
//test1

try {
    // Create PDO connection with additional options for error handling and character set
    $test = new PDO(
        "mysql:host=" . getenv("ENDPOINT") . ";dbname=" . getenv("DATABASE"),
        getenv("USERD"),
        getenv("PASSD"),
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Set error mode to exception
            //PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8" // Ensure UTF-8 is used
        )
    );

    echo "Connected successfully<br>";

    // Attempt a simple query to verify the connection
    $stmt = $test->query("SELECT VERSION()");
    $version = $stmt->fetchColumn();
    echo "Database server version: " . $version . "<br>";
} catch (PDOException $e) {
    // Display detailed error message in case of connection failure
    echo "Connection failed: " . $e->getMessage();
}

// Optionally, you can remove this or use it for further debugging
// var_dump($test);
?>
