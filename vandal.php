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
	echo "<meta name='viewport' content='width=device-width'>Click the link to visit the webpage you created for the keyword<br><br><a href='./en/$value.html'>$value</a><br><br>";
	echo "<script> var msg = new SpeechSynthesisUtterance('the keyword $value already exists'); window.speechSynthesis.speak(msg); </script>";
	//echo "<body onload='loadout()'><script>function loadout(){window.location.href = './vandal.html'}</script>";	
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
	. "p {"
	. "width:100%; "
	. "height:100%;"
	. "position: fixed;"
	. "padding: 0;"
	. "margin-top: 200px;"
	. "top: 0px;"
	. "left: 0px;"
	. "}"
	. "</style>"
	. "<title>"
	. $value
	. "</title>"
	. "</head>"
	. "<body>"
	. "<br><a href="
	. "\""
	. "../index.html"
	. "\""
	. "><center><button>Menu</button></center></a>"
	. "<br><br>"
	. "vandal vandalized $value"
	. "<br><br><a href="
	. "\"" 
	. "../delete.php?action=delete&filename=./en/" 
	. $value 
	. ".html" 
	. "\"" 
	. "><button>delete this keyword</button></a>"
	. "<script> var msg = new SpeechSynthesisUtterance('vandal vandalized $value'); window.speechSynthesis.speak(msg); </script>"
	. "</body>"
	. "<html>");
}

foreach($_POST as $variable => $value) 
{
	$value = str_replace(' ', '_', $value);
	$handle = fopen("./recentchanges.html", "a");
	fwrite($handle, 
	  "<br>vandal vandalized $value<br><a href=" 
	. "\"" 
	. "./en/"
	. $value
	. ".html" 
	. "\"" 
	. ">"
	. "view page"
	. "</a><br><br>"
	. "\r\n");
}

foreach($_POST as $variable => $value) 
{    
    $value = str_replace(' ', '_', $value);	
	$handle = fopen("./js/search.json", "a");
	// load the data and delete the line from the array 
	$lines = file('./js/search.json'); 
	$last = sizeof($lines) - 1 ; 
	unset($lines[$last]); 
	// write the new data to the file 
	file_put_contents('./js/search.json', $lines); 
	$value = str_replace(' ', '_', $value);
	fwrite($handle, 
      ","	
	. "\""
	. $value
	. "\""	
	. ":"
	. "\""
	. "en/"
	. $value
    . "\""
	. "\n"
    . "}}}");
}

 echo "<meta name='viewport' content='width=device-width'>Click the link to visit the webpage you created for the keyword $value <br><br> <a href='./en/$value.html'>$value</a><br><br>";
 echo "<body onload='loadout()'><script>function loadout(){window.location.href = './en/$value.html'}</script>";
 //echo "<body onload='loadout()'><script>function loadout(){window.location.href = './officer.html'}</script>"; 
 echo "<script> var msg = new SpeechSynthesisUtterance('you created the keyword $value'); window.speechSynthesis.speak(msg); </script>";		
fclose($handle);
exit();
?>