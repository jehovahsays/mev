<?php
header_remove( 'X-Powered-By' );
header( 'Cache-control: none, no-cache, private, max-age=0' );
header( 'Pragma: no-cache' );
header( 'Content-Type-Options: nosniff' );
header( 'X-Content-Type-Options: nosniff' );
header( 'XSS-Protection: 1; mode=block' );
header( 'X-XSS-Protection: 1; mode=block' );
header( 'Vary: Accept-Encoding' );
header( 'viewport: width=device-width, initial-scale=1.0' );
header( 'Accept-Language: en-US,en;q=0.5' );
header( 'Connection: Keep-alive' );
header( 'Host: blackhole' );
header( 'description: blackhole' );
header( 'keywords: blackhole' );
header( 'Vary: Accept-Encoding' );
header( 'Expires: 0' );
header( 'Referrer-Policy:  same-origin' );
header( 'Accept-Language: en-US,en;q=0.5' );
header( 'Connection: Keep-alive' );
$answer1 = $_POST['secure-form-answer-Human'];        
$totalCorrect = 1;  
if ($answer1 == "Human") { $totalCorrect++; }            
echo "<div id='results'>$totalCorrect /  1 correct</div>";

foreach($_POST as $variable => $value) 
{
	$value = str_replace(' ', '_', $value);	
	$file_pointer = "./en/" . $value . ".html"; 						
	if (file_exists($file_pointer))  
	{ 
	echo "The file $file_pointer already exists <br>"; 
	echo "<meta name='viewport' content='width=device-width'>Click the link to visit the webpage you created for the keyword<br><br><a href='./en/$value'>$value</a><br><br>";
	echo "<script> var msg = new SpeechSynthesisUtterance('the keyword $value already exists'); window.speechSynthesis.speak(msg); </script>";
	//echo "<body onload='loadout()'><script>function loadout(){window.location.href = './index.html'}</script>";	
	echo "<body onload='loadout()'><script>function loadout(){window.location.href = './en/$value.html'}</script>";
	exit();
	}
}

    foreach($_POST as $variable => $value) 
{
	$value = str_replace(' ', '_', $value);
	$handle = fopen("./en/" . $value . ".html", "a");
	fwrite($handle, 
	  "<!DOCTYPE html>"
	. "<html>"
	. "<head>"
	. "<meta "
	. "name=\"viewport\""
	. "content=\"width=device-width\">"
	. "<style>"
	. "/* mobile */"
	. ".favicon {"
	. "top:0px; "
	. "left:0px;"
	. "position:fixed;"
	. "}"
	. "</style>"
	. "<title>"
	. $value
	. "</title>"
	. "</head>"
	. "<body>"
	. "<a href="
	. "\""
	. "../index.html"
	. "\""
	. ">"
	. "<img src="
	. "\""
	. "../img/favicon.ico"
	. "\""
	. "></a><br><br>"
	. "$value"
	. "<br><br><a href="
	. "\"" 
	. "../delete.php?action=delete&filename=./en/" 
	. $value 
	. ".html" 
	. "\"" 
	. "><button>delete this keyword</button></a>"
	. "<br><br>" 
	. "<script> var msg = new SpeechSynthesisUtterance('$value'); window.speechSynthesis.speak(msg); </script>"
	. "</body>"
	. "<html>");
}	

	foreach($_POST as $variable => $value) 
{
	$value = str_replace(' ', '_', $value);
	$handle = fopen("./index.html", "a");
	fwrite($handle, 
	  "<a href=" 
	. "\"" 
	. "./en/"
	. $value
	. ".html" 
	. "\"" 
	. "class=" 
	. "\"" 
	. "titleInput" 
	. "\"" 
	. ">" 
	. "<button>"
	. $value
    . "</button>"	
	. "</a>"
	. "\r\n");
}

 echo "<meta name='viewport' content='width=device-width'>Click the link to visit the webpage you created for the keyword $value <br><br> <a href='./en/$value.html'>$value</a><br><br>";
 echo "<body onload='loadout()'><script>function loadout(){window.location.href = '../en/$value.html'}</script>";
 //echo "<body onload='loadout()'><script>function loadout(){window.location.href = './officer.html'}</script>"; 
 echo "<script> var msg = new SpeechSynthesisUtterance('you created the keyword $value'); window.speechSynthesis.speak(msg); </script>";		
fclose($handle);
exit();
?>