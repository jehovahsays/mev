<?php
header("Content-Type: application/json");

$folder = "./en/"; // Change this to the folder you want to monitor
if (!file_exists($folder)) {
    mkdir($folder, 0777, true); // Create the folder if it doesn't exist
}

$files = array_diff(scandir($folder), array('.', '..')); // Get files excluding . and ..
echo json_encode(array_values($files));
?>